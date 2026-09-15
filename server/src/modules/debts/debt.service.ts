import { Prisma } from "@prisma/client";
import { prisma } from "../../db/prisma.js";
import { ApiError } from "../../utils/apiError.js";

async function assertMembership(userId: string, householdId: string) {
  const membership = await prisma.householdMember.findUnique({
    where: { householdId_userId: { householdId, userId } },
    select: { role: true },
  });

  if (!membership) throw new ApiError(404, "Household not found.");
  return membership;
}

function normalizeDate(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export async function listHouseholdDebts(
  userId: string,
  householdId: string,
  filters: {
    status?: "OPEN" | "PARTIALLY_SETTLED" | "SETTLED" | "CANCELLED";
    userId?: string;
    limit: number;
    offset: number;
  },
) {
  await assertMembership(userId, householdId);

  const where: Prisma.DebtWhereInput = {
    sourceType: "HOUSEHOLD",
    householdExpense: { householdId },
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.userId
      ? { OR: [{ debtorId: filters.userId }, { creditorId: filters.userId }] }
      : {}),
  };

  const [debts, total] = await prisma.$transaction([
    prisma.debt.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: filters.offset,
      take: filters.limit,
      include: {
        debtor: { select: { id: true, name: true, email: true, imageUrl: true } },
        creditor: { select: { id: true, name: true, email: true, imageUrl: true } },
        householdExpense: {
          select: { id: true, description: true, expenseDate: true, totalAmount: true, currency: true },
        },
        settlements: {
          orderBy: { settledAt: "asc" },
          select: { id: true, amount: true, settledAt: true, createdBy: true, notes: true },
        },
      },
    }),
    prisma.debt.count({ where }),
  ]);

  return { debts, total };
}

export async function getHouseholdDebt(userId: string, householdId: string, debtId: string) {
  await assertMembership(userId, householdId);

  const debt = await prisma.debt.findFirst({
    where: {
      id: debtId,
      sourceType: "HOUSEHOLD",
      householdExpense: { householdId },
    },
    include: {
      debtor: { select: { id: true, name: true, email: true, imageUrl: true } },
      creditor: { select: { id: true, name: true, email: true, imageUrl: true } },
      householdExpense: {
        select: {
          id: true,
          description: true,
          totalAmount: true,
          currency: true,
          expenseDate: true,
        },
      },
      settlements: {
        orderBy: { settledAt: "asc" },
        include: {
          creator: { select: { id: true, name: true, email: true, imageUrl: true } },
        },
      },
    },
  });

  if (!debt) throw new ApiError(404, "Household debt not found.");
  return debt;
}

export async function createDebtSettlement(
  userId: string,
  householdId: string,
  debtId: string,
  input: { amount: number; settledAt: Date; notes?: string | null },
) {
  await assertMembership(userId, householdId);

  return prisma.$transaction(async (tx) => {
    const debt = await tx.debt.findFirst({
      where: {
        id: debtId,
        sourceType: "HOUSEHOLD",
        householdExpense: { householdId },
      },
      include: { settlements: { select: { amount: true } } },
    });

    if (!debt) throw new ApiError(404, "Household debt not found.");
    if (debt.status === "SETTLED" || debt.status === "CANCELLED") {
      throw new ApiError(409, "This debt cannot accept another settlement.");
    }

    const settledAmount = debt.settlements.reduce(
      (sum, settlement) => sum.add(settlement.amount),
      new Prisma.Decimal(0),
    );
    const remaining = debt.amount.sub(settledAmount);
    const amount = new Prisma.Decimal(input.amount);

    if (amount.greaterThan(remaining)) {
      throw new ApiError(400, "Settlement amount exceeds the remaining debt.");
    }

    const settlement = await tx.debtSettlement.create({
      data: {
        debtId,
        amount,
        settledAt: normalizeDate(input.settledAt),
        createdBy: userId,
        notes: input.notes?.trim() || null,
      },
    });

    const newSettledAmount = settledAmount.add(amount);
    const status = newSettledAmount.equals(debt.amount)
      ? "SETTLED"
      : "PARTIALLY_SETTLED";

    const updatedDebt = await tx.debt.update({
      where: { id: debtId },
      data: { status },
    });

    return { debt: updatedDebt, settlement };
  });
}
