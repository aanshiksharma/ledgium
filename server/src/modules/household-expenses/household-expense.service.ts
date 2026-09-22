import { Prisma } from "@prisma/client";
import { prisma } from "../../db/prisma.js";
import { runInTransaction } from "../../db/transactions.js";
import { ApiError } from "../../utils/apiError.js";

type ExpenseInput = {
  description: string;
  categoryId: string;
  totalAmount: number;
  expenseDate: Date;
  notes?: string | null;
  payers: Array<{ userId: string; paidAmount: number }>;
  participants: Array<{
    userId: string;
    shareAmount: number;
    sharePercentage?: number;
  }>;
};

async function assertMembership(userId: string, householdId: string) {
  const membership = await prisma.householdMember.findUnique({
    where: { householdId_userId: { householdId, userId } },
    select: { role: true },
  });

  if (!membership) throw new ApiError(404, "Household not found.");
  return membership;
}

async function assertMembersBelongToHousehold(
  householdId: string,
  userIds: string[],
) {
  const uniqueUserIds = [...new Set(userIds)];

  const members = await prisma.householdMember.findMany({
    where: {
      householdId,
      userId: { in: uniqueUserIds },
    },
    select: { userId: true },
  });

  if (members.length !== uniqueUserIds.length) {
    throw new ApiError(
      400,
      "All payers and participants must be household members.",
    );
  }
}

async function assertCategoryBelongsToHousehold(
  householdId: string,
  categoryId: string,
) {
  const category = await prisma.category.findFirst({
    where: { id: categoryId, householdId },
    select: { id: true },
  });

  if (!category) {
    throw new ApiError(400, "Category not found in this household.");
  }
}

function normalizeDate(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function buildDebtPairs(
  payers: Array<{ userId: string; paidAmount: Prisma.Decimal }>,
  participants: Array<{ userId: string; shareAmount: Prisma.Decimal }>,
) {
  const netByUser = new Map<string, Prisma.Decimal>();

  for (const payer of payers) {
    netByUser.set(
      payer.userId,
      (netByUser.get(payer.userId) ?? new Prisma.Decimal(0)).add(
        payer.paidAmount,
      ),
    );
  }

  for (const participant of participants) {
    netByUser.set(
      participant.userId,
      (netByUser.get(participant.userId) ?? new Prisma.Decimal(0)).sub(
        participant.shareAmount,
      ),
    );
  }

  const creditors = [...netByUser.entries()]
    .filter(([, amount]) => amount.greaterThan(0))
    .map(([userId, amount]) => ({ userId, amount }));

  const debtors = [...netByUser.entries()]
    .filter(([, amount]) => amount.lessThan(0))
    .map(([userId, amount]) => ({ userId, amount: amount.abs() }));

  const debts: Array<{
    debtorId: string;
    creditorId: string;
    amount: Prisma.Decimal;
  }> = [];

  let creditorIndex = 0;
  let debtorIndex = 0;

  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];

    if (!creditor || !debtor) break;

    const amount = creditor.amount.lessThan(debtor.amount)
      ? creditor.amount
      : debtor.amount;

    if (amount.lessThanOrEqualTo(0)) break;

    debts.push({
      debtorId: debtor.userId,
      creditorId: creditor.userId,
      amount,
    });

    creditor.amount = creditor.amount.sub(amount);
    debtor.amount = debtor.amount.sub(amount);

    if (creditor.amount.lessThanOrEqualTo(0.0001)) creditorIndex += 1;
    if (debtor.amount.lessThanOrEqualTo(0.0001)) debtorIndex += 1;
  }

  return debts;
}

function toDecimalPayers(
  payers: ExpenseInput["payers"],
): Array<{ userId: string; paidAmount: Prisma.Decimal }> {
  return payers.map((payer) => ({
    userId: payer.userId,
    paidAmount: new Prisma.Decimal(payer.paidAmount),
  }));
}

function toDecimalParticipants(
  participants: ExpenseInput["participants"],
): Array<{
  userId: string;
  shareAmount: Prisma.Decimal;
  sharePercentage?: Prisma.Decimal;
}> {
  return participants.map((participant) => ({
    userId: participant.userId,
    shareAmount: new Prisma.Decimal(participant.shareAmount),
    ...(participant.sharePercentage !== undefined
      ? { sharePercentage: new Prisma.Decimal(participant.sharePercentage) }
      : {}),
  }));
}

async function assertEditableAfterSettlement(
  tx: Prisma.TransactionClient,
  expenseId: string,
  input: ExpenseInput,
  existing: {
    totalAmount: Prisma.Decimal;
    payers: Array<{ userId: string; paidAmount: Prisma.Decimal }>;
    participants: Array<{ userId: string; shareAmount: Prisma.Decimal }>;
  },
) {
  const settledDebt = await tx.debt.findFirst({
    where: {
      householdExpenseId: expenseId,
      settlementAllocations: { some: {} },
    },
    select: { id: true },
  });

  if (!settledDebt) return false;

  const nextPayers = toDecimalPayers(input.payers);
  const nextParticipants = toDecimalParticipants(input.participants);

  const samePayer =
    existing.payers.length === nextPayers.length &&
    existing.payers.every((payer, index) => {
      const next = nextPayers[index];
      return (
        next !== undefined &&
        payer.userId === next.userId &&
        payer.paidAmount.equals(next.paidAmount)
      );
    });

  const sameParticipants =
    existing.participants.length === nextParticipants.length &&
    existing.participants.every((participant, index) => {
      const next = nextParticipants[index];
      return (
        next !== undefined &&
        participant.userId === next.userId &&
        participant.shareAmount.equals(next.shareAmount)
      );
    });

  const sameFinancialBasis =
    existing.totalAmount.equals(new Prisma.Decimal(input.totalAmount)) &&
    samePayer &&
    sameParticipants;

  if (!sameFinancialBasis) {
    throw new ApiError(
      409,
      "This expense has recorded settlements and its financial distribution can no longer be changed.",
    );
  }

  return true;
}

async function getExpenseWithRelations(expenseId: string) {
  return prisma.householdExpense.findUniqueOrThrow({
    where: { id: expenseId },
    include: {
      category: true,
      creator: {
        select: { id: true, name: true, email: true, imageUrl: true },
      },
      payers: {
        include: {
          user: {
            select: { id: true, name: true, email: true, imageUrl: true },
          },
        },
      },
      participants: {
        include: {
          user: {
            select: { id: true, name: true, email: true, imageUrl: true },
          },
        },
      },
      debts: {
        include: {
          settlementAllocations: true,
          debtor: {
            select: { id: true, name: true, email: true, imageUrl: true },
          },
          creditor: {
            select: { id: true, name: true, email: true, imageUrl: true },
          },
        },
      },
    },
  });
}

async function createOrUpdateExpense(
  userId: string,
  householdId: string,
  input: ExpenseInput,
  expenseId?: string,
) {
  await assertMembership(userId, householdId);
  await assertCategoryBelongsToHousehold(householdId, input.categoryId);
  await assertMembersBelongToHousehold(householdId, [
    ...input.payers.map((payer) => payer.userId),
    ...input.participants.map((participant) => participant.userId),
  ]);

  const household = await prisma.household.findUnique({
    where: { id: householdId },
    select: { currency: true },
  });

  if (!household) throw new ApiError(404, "Household not found.");

  const payers = toDecimalPayers(input.payers);
  const participants = toDecimalParticipants(input.participants);
  const debtPairs = buildDebtPairs(payers, participants);
  const expenseDate = normalizeDate(input.expenseDate);

  const savedExpenseId = await runInTransaction(async (tx) => {
    const existing = expenseId
      ? await tx.householdExpense.findFirst({
          where: { id: expenseId, householdId },
          include: {
            payers: { select: { userId: true, paidAmount: true } },
            participants: { select: { userId: true, shareAmount: true } },
          },
        })
      : null;

    if (expenseId && !existing) {
      throw new ApiError(404, "Household expense not found.");
    }

    if (existing) {
      const hasSettlements = await assertEditableAfterSettlement(
        tx,
        expenseId!,
        input,
        {
          totalAmount: existing.totalAmount,
          payers: existing.payers,
          participants: existing.participants,
        },
      );

      await tx.householdExpense.update({
        where: { id: existing.id },
        data: {
          description: input.description.trim(),
          categoryId: input.categoryId,
          totalAmount: new Prisma.Decimal(input.totalAmount),
          expenseDate,
          ...(input.notes !== undefined
            ? { notes: input.notes?.trim() || null }
            : {}),
        },
      });

      await tx.expensePayer.deleteMany({ where: { expenseId: existing.id } });
      await tx.expenseParticipant.deleteMany({
        where: { expenseId: existing.id },
      });

      await tx.expensePayer.createMany({
        data: payers.map((payer) => ({
          expenseId: existing.id,
          userId: payer.userId,
          paidAmount: payer.paidAmount,
        })),
      });

      await tx.expenseParticipant.createMany({
        data: participants.map((participant) => ({
          expenseId: existing.id,
          userId: participant.userId,
          shareAmount: participant.shareAmount,
          sharePercentage: participant.sharePercentage ?? null,
        })),
      });

      if (hasSettlements) {
        await tx.debt.updateMany({
          where: { householdExpenseId: existing.id },
          data: { description: input.description.trim() },
        });
      } else {
        await tx.debt.deleteMany({
          where: { householdExpenseId: existing.id },
        });

        if (debtPairs.length > 0) {
          await tx.debt.createMany({
            data: debtPairs.map((debt) => ({
              debtorId: debt.debtorId,
              creditorId: debt.creditorId,
              amount: debt.amount,
              remainingAmount: debt.amount,
              currency: household.currency,
              sourceType: "HOUSEHOLD",
              householdExpenseId: existing.id,
              description: input.description.trim(),
              status: "OPEN",
            })),
          });
        }
      }

      return existing.id;
    }

    const expense = await tx.householdExpense.create({
      data: {
        householdId,
        categoryId: input.categoryId,
        description: input.description.trim(),
        totalAmount: new Prisma.Decimal(input.totalAmount),
        currency: household.currency,
        expenseDate,
        notes: input.notes?.trim() || null,
        createdBy: userId,
        payers: {
          create: payers.map((payer) => ({
            userId: payer.userId,
            paidAmount: payer.paidAmount,
          })),
        },
        participants: {
          create: participants.map((participant) => ({
            userId: participant.userId,
            shareAmount: participant.shareAmount,
            sharePercentage: participant.sharePercentage ?? null,
          })),
        },
      },
    });

    if (debtPairs.length > 0) {
      await tx.debt.createMany({
        data: debtPairs.map((debt) => ({
          debtorId: debt.debtorId,
          creditorId: debt.creditorId,
          amount: debt.amount,
          remainingAmount: debt.amount,
          currency: household.currency,
          sourceType: "HOUSEHOLD",
          householdExpenseId: expense.id,
          description: input.description.trim(),
          status: "OPEN",
        })),
      });
    }

    return expense.id;
  });

  // The transaction is intentionally committed before loading the full
  // response graph. This prevents the expensive nested read from extending
  // the lifetime of the interactive transaction.
  return getExpenseWithRelations(savedExpenseId);
}

export async function createHouseholdExpense(
  userId: string,
  householdId: string,
  input: ExpenseInput,
) {
  return createOrUpdateExpense(userId, householdId, input);
}

export async function updateHouseholdExpense(
  userId: string,
  householdId: string,
  expenseId: string,
  input: ExpenseInput,
) {
  return createOrUpdateExpense(userId, householdId, input, expenseId);
}

export async function listHouseholdExpenses(
  userId: string,
  householdId: string,
  filters: { from?: Date; to?: Date; limit: number; offset: number },
) {
  await assertMembership(userId, householdId);

  const where: Prisma.HouseholdExpenseWhereInput = {
    householdId,
    ...(filters.from || filters.to
      ? {
          expenseDate: {
            ...(filters.from ? { gte: normalizeDate(filters.from) } : {}),
            ...(filters.to ? { lte: normalizeDate(filters.to) } : {}),
          },
        }
      : {}),
  };

  const [expenses, total] = await prisma.$transaction([
    prisma.householdExpense.findMany({
      where,
      orderBy: [{ expenseDate: "desc" }, { createdAt: "desc" }],
      skip: filters.offset,
      take: filters.limit,
      include: {
        category: true,
        creator: {
          select: { id: true, name: true, email: true, imageUrl: true },
        },
        payers: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        participants: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        debts: {
          select: {
            id: true,
            debtorId: true,
            creditorId: true,
            amount: true,
            currency: true,
            status: true,
            _count: { select: { settlementAllocations: true } },
          },
        },
      },
    }),
    prisma.householdExpense.count({ where }),
  ]);

  return { expenses, total };
}

export async function getHouseholdExpense(
  userId: string,
  householdId: string,
  expenseId: string,
) {
  await assertMembership(userId, householdId);

  const expense = await prisma.householdExpense.findFirst({
    where: { id: expenseId, householdId },
    include: {
      category: true,
      creator: {
        select: { id: true, name: true, email: true, imageUrl: true },
      },
      payers: {
        include: {
          user: {
            select: { id: true, name: true, email: true, imageUrl: true },
          },
        },
      },
      participants: {
        include: {
          user: {
            select: { id: true, name: true, email: true, imageUrl: true },
          },
        },
      },
      debts: {
        include: {
          settlementAllocations: true,
          debtor: {
            select: { id: true, name: true, email: true, imageUrl: true },
          },
          creditor: {
            select: { id: true, name: true, email: true, imageUrl: true },
          },
        },
      },
    },
  });

  if (!expense) throw new ApiError(404, "Household expense not found.");
  return expense;
}
