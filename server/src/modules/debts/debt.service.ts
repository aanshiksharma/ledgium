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

const debtInclude = {
  debtor: { select: { id: true, name: true, email: true, imageUrl: true } },
  creditor: { select: { id: true, name: true, email: true, imageUrl: true } },
  householdExpense: {
    select: {
      id: true,
      description: true,
      expenseDate: true,
      totalAmount: true,
      currency: true,
    },
  },
  settlementAllocations: {
    orderBy: { createdAt: "asc" as const },
    select: {
      id: true,
      amount: true,
      settlement: {
        select: { id: true, settledAt: true, createdBy: true, notes: true },
      },
    },
  },
};

export async function listHouseholdDebts(
  userId: string,
  householdId: string,
  filters: {
    status?: "OPEN" | "PARTIALLY_SETTLED" | "SETTLED" | "CANCELLED";
    userId?: string;
    activeOnly: boolean;
    limit: number;
    offset: number;
  },
) {
  await assertMembership(userId, householdId);

  const where: Prisma.DebtWhereInput = {
    sourceType: "HOUSEHOLD",
    householdExpense: { householdId },
    OR: [{ debtorId: userId }, { creditorId: userId }],
    ...(filters.activeOnly ? { isActive: true } : {}),
    ...(filters.status ? { status: filters.status } : {}),
  };

  const [debts, total] = await prisma.$transaction([
    prisma.debt.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: Number(filters.offset),
      take: Number(filters.limit),
      include: debtInclude,
    }),
    prisma.debt.count({ where }),
  ]);

  return { debts, total };
}

export async function listHouseholdDebtSummary(userId: string, householdId: string) {
  await assertMembership(userId, householdId);

  const grouped = await prisma.debt.groupBy({
    by: ["debtorId", "creditorId", "currency"],
    where: {
      sourceType: "HOUSEHOLD",
      isActive: true,
      householdExpense: { householdId },
      OR: [{ debtorId: userId }, { creditorId: userId }],
    },
    _sum: { remainingAmount: true },
    orderBy: { _sum: { remainingAmount: "desc" } },
  });

  if (!grouped.length) return { balances: [], currency: "INR" };

  const activeDebts = await prisma.debt.findMany({
    where: {
      sourceType: "HOUSEHOLD",
      isActive: true,
      householdExpense: { householdId },
      OR: [{ debtorId: userId }, { creditorId: userId }],
      debtorId: { in: [...new Set(grouped.map((item) => item.debtorId))] },
      creditorId: { in: [...new Set(grouped.map((item) => item.creditorId))] },
    },
    select: {
      id: true,
      debtorId: true,
      creditorId: true,
      remainingAmount: true,
      description: true,
      createdAt: true,
      householdExpense: {
        select: { id: true, description: true, expenseDate: true },
      },
    },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });

  const debtsByPair = new Map<string, typeof activeDebts>();
  for (const debt of activeDebts) {
    const key = `${debt.debtorId}:${debt.creditorId}`;
    const current = debtsByPair.get(key) ?? [];
    current.push(debt);
    debtsByPair.set(key, current);
  }

  const userIds = [
    ...new Set(grouped.flatMap((item) => [item.debtorId, item.creditorId])),
  ];
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, email: true, imageUrl: true },
  });
  const usersById = new Map(users.map((user) => [user.id, user]));

  return {
    balances: grouped.flatMap((item) => {
      const debtor = usersById.get(item.debtorId);
      const creditor = usersById.get(item.creditorId);
      const outstandingAmount = item._sum.remainingAmount;
      if (!debtor || !creditor || !outstandingAmount || outstandingAmount.isZero()) return [];

      return [{
        debtor,
        creditor,
        outstandingAmount,
        currency: item.currency,
        debts: (debtsByPair.get(`${item.debtorId}:${item.creditorId}`) ?? []).map((debt) => ({
          id: debt.id,
          description: debt.householdExpense?.description ?? debt.description,
          expenseDate: debt.householdExpense?.expenseDate ?? debt.createdAt,
          remainingAmount: debt.remainingAmount,
        })),
      }];
    }),
    currency: grouped[0]?.currency ?? "INR",
  };
}

export async function listHouseholdSettlements(
  userId: string,
  householdId: string,
  filters: { limit: number; offset: number },
) {
  await assertMembership(userId, householdId);

  const where: Prisma.DebtSettlementWhereInput = {
    allocations: {
      some: {
        debt: {
          sourceType: "HOUSEHOLD",
          householdExpense: { householdId },
          OR: [{ debtorId: userId }, { creditorId: userId }],
        },
      },
    },
  };

  const [settlements, total] = await prisma.$transaction([
    prisma.debtSettlement.findMany({
      where,
      orderBy: [{ settledAt: "desc" }, { createdAt: "desc" }],
      skip: Number(filters.offset),
      take: Number(filters.limit),
      include: {
        creator: { select: { id: true, name: true, email: true, imageUrl: true } },
        debtor: { select: { id: true, name: true, email: true, imageUrl: true } },
        creditor: { select: { id: true, name: true, email: true, imageUrl: true } },
        allocations: {
          select: {
            amount: true,
            debt: {
              select: {
                id: true,
                currency: true,
                householdExpense: { select: { id: true, description: true, expenseDate: true } },
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    }),
    prisma.debtSettlement.count({ where }),
  ]);

  return { settlements, total };
}

export async function getHouseholdDebt(userId: string, householdId: string, debtId: string) {
  await assertMembership(userId, householdId);

  const debt = await prisma.debt.findFirst({
    where: {
      id: debtId,
      sourceType: "HOUSEHOLD",
      householdExpense: { householdId },
      OR: [{ debtorId: userId }, { creditorId: userId }],
    },
    include: debtInclude,
  });

  if (!debt) throw new ApiError(404, "Household debt not found.");
  return debt;
}

export async function createDebtSettlement(
  userId: string,
  householdId: string,
  input: { debtorId: string; creditorId: string; amount: number; settledAt: Date; notes?: string | null },
) {
  await assertMembership(userId, householdId);

  if (input.debtorId === input.creditorId) {
    throw new ApiError(400, "A settlement requires two different household members.");
  }

  if (userId !== input.creditorId) {
    throw new ApiError(403, "Only the creditor can record this settlement.");
  }

  return prisma.$transaction(async (tx) => {
    const [debtorMembership, creditorMembership] = await Promise.all([
      tx.householdMember.findUnique({ where: { householdId_userId: { householdId, userId: input.debtorId } }, select: { id: true } }),
      tx.householdMember.findUnique({ where: { householdId_userId: { householdId, userId: input.creditorId } }, select: { id: true } }),
    ]);

    if (!debtorMembership || !creditorMembership) {
      throw new ApiError(400, "Both settlement participants must belong to the household.");
    }

    const debts = await tx.debt.findMany({
      where: {
        debtorId: input.debtorId,
        creditorId: input.creditorId,
        sourceType: "HOUSEHOLD",
        isActive: true,
        householdExpense: { householdId },
      },
      select: { id: true, remainingAmount: true, status: true },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });

    if (!debts.length) {
      throw new ApiError(404, "No outstanding debt exists between these members.");
    }

    const requestedAmount = new Prisma.Decimal(input.amount);
    const outstanding = debts.reduce((sum, debt) => sum.add(debt.remainingAmount), new Prisma.Decimal(0));
    if (requestedAmount.greaterThan(outstanding)) {
      throw new ApiError(400, "Settlement amount exceeds the outstanding debt between these members.");
    }

    let remainingToAllocate = requestedAmount;
    const allocations: { debtId: string; amount: Prisma.Decimal }[] = [];

    for (const debt of debts) {
      if (remainingToAllocate.isZero()) break;
      const allocationAmount = Prisma.Decimal.min(debt.remainingAmount, remainingToAllocate);
      if (allocationAmount.greaterThan(0)) {
        allocations.push({ debtId: debt.id, amount: allocationAmount });
        remainingToAllocate = remainingToAllocate.sub(allocationAmount);
      }
    }

    if (!remainingToAllocate.isZero()) {
      throw new ApiError(409, "Unable to allocate the settlement across active debts.");
    }

    const settlement = await tx.debtSettlement.create({
      data: {
        debtorId: input.debtorId,
        creditorId: input.creditorId,
        amount: requestedAmount,
        settledAt: normalizeDate(input.settledAt),
        createdBy: userId,
        notes: input.notes?.trim() || null,
        allocations: { create: allocations.map((allocation) => ({ debtId: allocation.debtId, amount: allocation.amount })) },
      },
      include: {
        creator: { select: { id: true, name: true, email: true, imageUrl: true } },
        debtor: { select: { id: true, name: true, email: true, imageUrl: true } },
        creditor: { select: { id: true, name: true, email: true, imageUrl: true } },
        allocations: { select: { id: true, debtId: true, amount: true } },
      },
    });

    for (const allocation of allocations) {
      const debt = debts.find((item) => item.id === allocation.debtId);
      if (!debt) throw new ApiError(409, "Settlement allocation target disappeared during the transaction.");

      const remainingAmount = debt.remainingAmount.sub(allocation.amount);
      const fullySettled = remainingAmount.isZero();

      await tx.debt.update({
        where: { id: debt.id },
        data: {
          remainingAmount,
          isActive: !fullySettled,
          status: fullySettled ? "SETTLED" : "PARTIALLY_SETTLED",
        },
      });
    }

    const relationshipRemaining = await tx.debt.aggregate({
      where: {
        debtorId: input.debtorId,
        creditorId: input.creditorId,
        sourceType: "HOUSEHOLD",
        isActive: true,
        householdExpense: { householdId },
      },
      _sum: { remainingAmount: true },
    });

    if ((relationshipRemaining._sum.remainingAmount ?? new Prisma.Decimal(0)).isZero()) {
      await tx.debt.updateMany({
        where: {
          debtorId: input.debtorId,
          creditorId: input.creditorId,
          sourceType: "HOUSEHOLD",
          householdExpense: { householdId },
          isActive: true,
        },
        data: { isActive: false, status: "SETTLED", remainingAmount: 0 },
      });
    }

    return {
      settlement,
      allocations,
      remainingRelationship: relationshipRemaining._sum.remainingAmount ?? new Prisma.Decimal(0),
    };
  });
}
