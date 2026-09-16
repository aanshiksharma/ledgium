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
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
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
  settlements: {
    orderBy: { settledAt: "asc" as const },
    select: {
      id: true,
      amount: true,
      settledAt: true,
      createdBy: true,
      notes: true,
    },
  },
};

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
      skip: Number(filters.offset),
      take: Number(filters.limit),
      include: debtInclude,
    }),
    prisma.debt.count({ where }),
  ]);

  return { debts, total };
}

export async function listHouseholdDebtSummary(
  userId: string,
  householdId: string,
) {
  await assertMembership(userId, householdId);

  const grouped = await prisma.debt.groupBy({
    by: ["debtorId", "creditorId", "currency"],
    where: {
      sourceType: "HOUSEHOLD",
      isActive: true,
      householdExpense: { householdId },
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
    orderBy: { createdAt: "asc" },
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

      if (!debtor || !creditor || !outstandingAmount) return [];

      return [
        {
          debtor,
          creditor,
          outstandingAmount,
          currency: item.currency,
          debts: (
            debtsByPair.get(`${item.debtorId}:${item.creditorId}`) ?? []
          ).map((debt) => ({
            id: debt.id,
            description: debt.householdExpense?.description ?? debt.description,
            expenseDate: debt.householdExpense?.expenseDate ?? debt.createdAt,
            remainingAmount: debt.remainingAmount,
          })),
        },
      ];
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
    debt: {
      sourceType: "HOUSEHOLD",
      householdExpense: { householdId },
    },
  };

  const [settlements, total] = await prisma.$transaction([
    prisma.debtSettlement.findMany({
      where,
      orderBy: [{ settledAt: "desc" }, { createdAt: "desc" }],
      skip: Number(filters.offset),
      take: Number(filters.limit),
      include: {
        creator: {
          select: { id: true, name: true, email: true, imageUrl: true },
        },
        debt: {
          select: {
            id: true,
            currency: true,
            debtor: {
              select: { id: true, name: true, email: true, imageUrl: true },
            },
            creditor: {
              select: { id: true, name: true, email: true, imageUrl: true },
            },
            householdExpense: {
              select: { id: true, description: true, expenseDate: true },
            },
          },
        },
      },
    }),
    prisma.debtSettlement.count({ where }),
  ]);

  return { settlements, total };
}

export async function getHouseholdDebt(
  userId: string,
  householdId: string,
  debtId: string,
) {
  await assertMembership(userId, householdId);

  const debt = await prisma.debt.findFirst({
    where: {
      id: debtId,
      sourceType: "HOUSEHOLD",
      householdExpense: { householdId },
    },
    include: {
      ...debtInclude,
      settlements: {
        orderBy: { settledAt: "asc" },
        include: {
          creator: {
            select: { id: true, name: true, email: true, imageUrl: true },
          },
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
      select: {
        id: true,
        debtorId: true,
        creditorId: true,
        amount: true,
        remainingAmount: true,
        status: true,
        isActive: true,
      },
    });

    if (!debt) throw new ApiError(404, "Household debt not found.");
    if (
      !debt.isActive ||
      debt.status === "SETTLED" ||
      debt.status === "CANCELLED"
    ) {
      throw new ApiError(409, "This debt cannot accept another settlement.");
    }

    const amount = new Prisma.Decimal(input.amount);
    if (amount.greaterThan(debt.remainingAmount)) {
      throw new ApiError(400, "Settlement amount exceeds the remaining debt.");
    }

    const remainingAmount = debt.remainingAmount.sub(amount);
    const isFullySettled = remainingAmount.isZero();

    const settlement = await tx.debtSettlement.create({
      data: {
        debtId,
        amount,
        settledAt: normalizeDate(input.settledAt),
        createdBy: userId,
        notes: input.notes?.trim() || null,
      },
    });

    const updatedDebt = await tx.debt.update({
      where: { id: debtId },
      data: {
        remainingAmount,
        isActive: !isFullySettled,
        status: isFullySettled ? "SETTLED" : "PARTIALLY_SETTLED",
      },
    });

    if (isFullySettled) {
      const remainingRelationship = await tx.debt.aggregate({
        where: {
          debtorId: debt.debtorId,
          creditorId: debt.creditorId,
          sourceType: "HOUSEHOLD",
          isActive: true,
          householdExpense: { householdId },
        },
        _sum: { remainingAmount: true },
      });

      if (
        (
          remainingRelationship._sum.remainingAmount ?? new Prisma.Decimal(0)
        ).isZero()
      ) {
        await tx.debt.updateMany({
          where: {
            debtorId: debt.debtorId,
            creditorId: debt.creditorId,
            sourceType: "HOUSEHOLD",
            householdExpense: { householdId },
            isActive: true,
          },
          data: { isActive: false, status: "SETTLED", remainingAmount: 0 },
        });
      }
    }

    return { debt: updatedDebt, settlement };
  });
}
