import { Prisma } from "@prisma/client";
import { prisma } from "../../db/prisma.js";
import { ApiError } from "../../utils/apiError.js";

const SETTLEMENT_TX_TIMEOUT_MS = 5000; // hard limit enforced by Prisma
const SETTLEMENT_TX_SOFT_LIMIT_MS = 4000; // our own guard, fires before Prisma's

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
      if (
        !debtor ||
        !creditor ||
        !outstandingAmount ||
        outstandingAmount.isZero()
      )
        return [];

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
        creator: {
          select: { id: true, name: true, email: true, imageUrl: true },
        },
        debtor: {
          select: { id: true, name: true, email: true, imageUrl: true },
        },
        creditor: {
          select: { id: true, name: true, email: true, imageUrl: true },
        },
        allocations: {
          select: {
            amount: true,
            debt: {
              select: {
                id: true,
                currency: true,
                householdExpense: {
                  select: { id: true, description: true, expenseDate: true },
                },
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
  input: {
    debtorId: string;
    creditorId: string;
    allocations: { debtId: string; amount?: number }[];
    settledAt: Date;
    notes?: string | null;
  },
) {
  await assertMembership(userId, householdId);

  if (input.debtorId === input.creditorId) {
    throw new ApiError(
      400,
      "A settlement requires two different household members.",
    );
  }

  if (userId !== input.creditorId) {
    throw new ApiError(403, "Only the creditor can record this settlement.");
  }

  if (!input.allocations?.length) {
    throw new ApiError(400, "Provide at least one debt allocation.");
  }

  // Moved out of the transaction to keep it as short as possible.
  const debtorMembership = await prisma.householdMember.findUnique({
    where: {
      householdId_userId: {
        householdId,
        userId: input.debtorId,
      },
    },
    select: { id: true },
  });

  if (!debtorMembership) {
    throw new ApiError(
      400,
      "Both settlement participants must belong to the household.",
    );
  }

  let result: {
    settlementId: string;
    allocations: { debtId: string; amount: Prisma.Decimal }[];
    remainingRelationship: Prisma.Decimal;
  };

  try {
    result = await prisma.$transaction(
      async (tx) => {
        const startedAt = Date.now();
        const assertTimeBudget = () => {
          if (Date.now() - startedAt > SETTLEMENT_TX_SOFT_LIMIT_MS) {
            throw new ApiError(
              503,
              "Recording the settlement took too long. Nothing was saved, please try again.",
            );
          }
        };

        const debts = await tx.debt.findMany({
          where: {
            debtorId: input.debtorId,
            creditorId: input.creditorId,
            sourceType: "HOUSEHOLD",
            isActive: true,
            householdExpense: { householdId },
          },
          select: {
            id: true,
            remainingAmount: true,
            status: true,
          },
        });

        if (!debts.length) {
          throw new ApiError(
            404,
            "No outstanding debt exists between these members.",
          );
        }

        const outstanding = debts.reduce(
          (sum, debt) => sum.add(debt.remainingAmount),
          new Prisma.Decimal(0),
        );

        // Looked up only among the pair's active household debts, so a
        // caller cannot settle debts outside this pair or household.
        const debtsById = new Map(debts.map((debt) => [debt.id, debt]));

        // Per-debt settlement is the only way to settle: the caller chooses
        // the debts and amounts, and nothing is allocated automatically.
        const ids = input.allocations.map((item) => item.debtId);
        if (new Set(ids).size !== ids.length) {
          throw new ApiError(400, "Duplicate debt in settlement allocations.");
        }

        const allocations: {
          debtId: string;
          amount: Prisma.Decimal;
        }[] = [];

        for (const item of input.allocations) {
          const debt = debtsById.get(item.debtId);

          if (!debt) {
            throw new ApiError(404, "Debt not found between these members.");
          }

          const allocationAmount =
            item.amount === undefined
              ? debt.remainingAmount // settle in full
              : new Prisma.Decimal(item.amount);

          if (allocationAmount.lessThanOrEqualTo(0)) {
            throw new ApiError(
              400,
              "Allocation amount must be greater than zero.",
            );
          }

          if (allocationAmount.greaterThan(debt.remainingAmount)) {
            throw new ApiError(
              400,
              "Allocation exceeds the remaining amount of a debt.",
            );
          }

          allocations.push({ debtId: debt.id, amount: allocationAmount });
        }

        const requestedAmount = allocations.reduce(
          (sum, allocation) => sum.add(allocation.amount),
          new Prisma.Decimal(0),
        );

        assertTimeBudget();

        // Single insert for the settlement and all of its allocations.
        const settlement = await tx.debtSettlement.create({
          data: {
            debtorId: input.debtorId,
            creditorId: input.creditorId,
            amount: requestedAmount,
            settledAt: normalizeDate(input.settledAt),
            createdBy: userId,
            notes: input.notes?.trim() || null,
            allocations: {
              createMany: {
                data: allocations.map((allocation) => ({
                  debtId: allocation.debtId,
                  amount: allocation.amount,
                })),
              },
            },
          },
          select: {
            id: true,
          },
        });

        const fullySettledIds: string[] = [];
        const partialUpdates: {
          id: string;
          remainingAmount: Prisma.Decimal;
        }[] = [];

        for (const allocation of allocations) {
          const debt = debtsById.get(allocation.debtId);

          if (!debt) {
            throw new ApiError(
              409,
              "Settlement allocation target disappeared during the transaction.",
            );
          }

          const remainingAmount = debt.remainingAmount.sub(allocation.amount);

          if (remainingAmount.isZero()) {
            fullySettledIds.push(debt.id);
          } else {
            partialUpdates.push({ id: debt.id, remainingAmount });
          }
        }

        // All fully settled debts are closed with one query, regardless of count.
        if (fullySettledIds.length) {
          await tx.debt.updateMany({
            where: { id: { in: fullySettledIds } },
            data: {
              remainingAmount: new Prisma.Decimal(0),
              isActive: false,
              status: "SETTLED",
            },
          });
        }

        // Partial updates need distinct values, so they run individually.
        for (const update of partialUpdates) {
          assertTimeBudget();

          await tx.debt.update({
            where: { id: update.id },
            data: {
              remainingAmount: update.remainingAmount,
              isActive: true,
              status: "PARTIALLY_SETTLED",
            },
          });
        }

        const remainingRelationship = outstanding.sub(requestedAmount);

        return {
          settlementId: settlement.id,
          allocations,
          remainingRelationship,
        };
      },
      { maxWait: 2000, timeout: SETTLEMENT_TX_TIMEOUT_MS },
    );
  } catch (error) {
    // P2028: Prisma's transaction timeout / expired transaction error.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2028"
    ) {
      throw new ApiError(
        503,
        "Recording the settlement took too long. Nothing was saved, please try again.",
      );
    }
    throw error;
  }

  const settlement = await prisma.debtSettlement.findUniqueOrThrow({
    where: { id: result.settlementId },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          imageUrl: true,
        },
      },
      debtor: {
        select: {
          id: true,
          name: true,
          email: true,
          imageUrl: true,
        },
      },
      creditor: {
        select: {
          id: true,
          name: true,
          email: true,
          imageUrl: true,
        },
      },
      allocations: {
        select: {
          id: true,
          debtId: true,
          amount: true,
        },
      },
    },
  });

  return {
    settlement,
    allocations: result.allocations,
    remainingRelationship: result.remainingRelationship,
  };
}
