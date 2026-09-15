import { Prisma } from "@prisma/client";
import { prisma } from "../../db/prisma.js";
import { runInTransaction } from "../../db/transactions.js";
import { ApiError } from "../../utils/apiError.js";

async function assertMembership(userId: string, householdId: string) {
  const membership = await prisma.householdMember.findUnique({
    where: { householdId_userId: { householdId, userId } },
    select: { role: true },
  });

  if (!membership) throw new ApiError(404, "Household not found.");
  return membership;
}

async function assertMembersBelongToHousehold(householdId: string, userIds: string[]) {
  const uniqueUserIds = [...new Set(userIds)];
  const members = await prisma.householdMember.findMany({
    where: { householdId, userId: { in: uniqueUserIds } },
    select: { userId: true },
  });

  if (members.length !== uniqueUserIds.length) {
    throw new ApiError(400, "All payers and participants must be household members.");
  }
}

function normalizeDate(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function buildDebtPairs(
  payers: Array<{ userId: string; paidAmount: Prisma.Decimal }>,
  participants: Array<{ userId: string; shareAmount: Prisma.Decimal }>,
) {
  const netByUser = new Map<string, Prisma.Decimal>();

  for (const payer of payers) {
    netByUser.set(
      payer.userId,
      (netByUser.get(payer.userId) ?? new Prisma.Decimal(0)).add(payer.paidAmount),
    );
  }

  for (const participant of participants) {
    netByUser.set(
      participant.userId,
      (netByUser.get(participant.userId) ?? new Prisma.Decimal(0)).sub(participant.shareAmount),
    );
  }

  const creditors = [...netByUser.entries()]
    .filter(([, amount]) => amount.greaterThan(0))
    .map(([userId, amount]) => ({ userId, amount }));

  const debtors = [...netByUser.entries()]
    .filter(([, amount]) => amount.lessThan(0))
    .map(([userId, amount]) => ({ userId, amount: amount.abs() }));

  const debts: Array<{ debtorId: string; creditorId: string; amount: Prisma.Decimal }> = [];
  let creditorIndex = 0;
  let debtorIndex = 0;

  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];

    if (!creditor || !debtor) break;

    const amount = creditor.amount.lessThan(debtor.amount) ? creditor.amount : debtor.amount;

    if (amount.greaterThan(0)) {
      debts.push({ debtorId: debtor.userId, creditorId: creditor.userId, amount });
    }

    creditor.amount = creditor.amount.sub(amount);
    debtor.amount = debtor.amount.sub(amount);

    if (creditor.amount.isZero()) creditorIndex += 1;
    if (debtor.amount.isZero()) debtorIndex += 1;
  }

  return debts;
}

export async function createHouseholdExpense(
  userId: string,
  householdId: string,
  input: {
    description: string;
    totalAmount: number;
    expenseDate: Date;
    notes?: string | null;
    payers: Array<{ userId: string; paidAmount: number }>;
    participants: Array<{
      userId: string;
      shareAmount: number;
      sharePercentage?: number;
    }>;
  },
) {
  await assertMembership(userId, householdId);
  await assertMembersBelongToHousehold(
    householdId,
    [...input.payers.map((payer) => payer.userId), ...input.participants.map((participant) => participant.userId)],
  );

  const household = await prisma.household.findUnique({
    where: { id: householdId },
    select: { currency: true },
  });

  if (!household) throw new ApiError(404, "Household not found.");

  const payers = input.payers.map((payer) => ({
    userId: payer.userId,
    paidAmount: new Prisma.Decimal(payer.paidAmount),
  }));
  const participants = input.participants.map((participant) => ({
    userId: participant.userId,
    shareAmount: new Prisma.Decimal(participant.shareAmount),
    sharePercentage:
      participant.sharePercentage === undefined
        ? undefined
        : new Prisma.Decimal(participant.sharePercentage),
  }));

  const debtPairs = buildDebtPairs(payers, participants);
  const expenseDate = normalizeDate(input.expenseDate);

  return runInTransaction(async (tx) => {
    const expense = await tx.householdExpense.create({
      data: {
        householdId,
        description: input.description.trim(),
        totalAmount: new Prisma.Decimal(input.totalAmount),
        currency: household.currency,
        expenseDate,
        notes: input.notes?.trim() || null,
        createdBy: userId,
        payers: {
          create: payers,
        },
        participants: {
          create: participants.map((participant) => ({
            user: { connect: { id: participant.userId } },
            shareAmount: participant.shareAmount,
            ...(participant.sharePercentage !== undefined
              ? { sharePercentage: participant.sharePercentage }
              : {}),
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
          currency: household.currency,
          sourceType: "HOUSEHOLD",
          householdExpenseId: expense.id,
          description: input.description.trim(),
          status: "OPEN",
        })),
      });
    }

    return tx.householdExpense.findUniqueOrThrow({
      where: { id: expense.id },
      include: {
        creator: { select: { id: true, name: true, email: true, imageUrl: true } },
        payers: { include: { user: { select: { id: true, name: true, email: true, imageUrl: true } } } },
        participants: { include: { user: { select: { id: true, name: true, email: true, imageUrl: true } } } },
        debts: true,
      },
    });
  });
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
        creator: { select: { id: true, name: true, email: true, imageUrl: true } },
        payers: { include: { user: { select: { id: true, name: true, email: true } } } },
        participants: { include: { user: { select: { id: true, name: true, email: true } } } },
        debts: { select: { id: true, debtorId: true, creditorId: true, amount: true, currency: true, status: true } },
      },
    }),
    prisma.householdExpense.count({ where }),
  ]);

  return { expenses, total };
}

export async function getHouseholdExpense(userId: string, householdId: string, expenseId: string) {
  await assertMembership(userId, householdId);

  const expense = await prisma.householdExpense.findFirst({
    where: { id: expenseId, householdId },
    include: {
      creator: { select: { id: true, name: true, email: true, imageUrl: true } },
      payers: { include: { user: { select: { id: true, name: true, email: true, imageUrl: true } } } },
      participants: { include: { user: { select: { id: true, name: true, email: true, imageUrl: true } } } },
      debts: {
        include: {
          settlements: true,
          debtor: { select: { id: true, name: true, email: true, imageUrl: true } },
          creditor: { select: { id: true, name: true, email: true, imageUrl: true } },
        },
      },
    },
  });

  if (!expense) throw new ApiError(404, "Household expense not found.");
  return expense;
}
