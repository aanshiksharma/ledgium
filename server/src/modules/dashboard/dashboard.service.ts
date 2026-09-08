import { Prisma } from "@prisma/client";
import { prisma } from "../../db/prisma.js";
import { ApiError } from "../../utils/apiError.js";

export async function getDashboard(
  userId: string,
  householdId: string,
  from?: Date,
  to?: Date,
) {
  const membership = await prisma.householdMember.findUnique({
    where: { householdId_userId: { householdId, userId } },
  });

  if (!membership) throw new ApiError(404, "Household not found.");

  const household = await prisma.household.findUnique({
    where: { id: householdId },
    select: { id: true, name: true, currency: true },
  });

  if (!household) throw new ApiError(404, "Household not found.");

  const dateFilter =
    from || to
      ? {
          transactionDate: {
            ...(from ? { gte: from } : {}),
            ...(to ? { lte: to } : {}),
          },
        }
      : {};

  const accounts = await prisma.account.findMany({
    where: {
      householdId,
      isActive: true,
      ...dateFilter,
    },

    select: {
      id: true,
      name: true,
      type: true,
      currency: true,
      openingBalance: true,
      transactions: {
        where: dateFilter,
        select: { amount: true },
      },
    },

    orderBy: { createdAt: "asc" },
  });

  const accountSummaries = accounts.map((account) => {
    const transactionTotal = account.transactions.reduce(
      (sum, transaction) => sum.add(transaction.amount),
      new Prisma.Decimal(0),
    );

    return {
      id: account.id,
      name: account.name,
      type: account.type,
      currency: account.currency,
      balance: account.openingBalance.add(transactionTotal),
    };
  });

  const totals = accountSummaries.reduce(
    (result, account) => result.add(account.balance),
    new Prisma.Decimal(0),
  );

  const recentTransactions = await prisma.transaction.findMany({
    where: {
      householdId,
      ...dateFilter,
    },

    orderBy: [{ transactionDate: "desc" }, { createdAt: "desc" }],
    take: 10,

    include: {
      account: { select: { id: true, name: true } },
      category: { select: { id: true, name: true, icon: true, color: true } },
    },
  });

  const categoryTotals = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      householdId,
      ...dateFilter,
      categoryId: { not: null },
      ...dateFilter,
    },
    _sum: { amount: true },
  });

  const categoryIds = categoryTotals
    .map((item) => item.categoryId)
    .filter((id): id is string => Boolean(id));

  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, name: true, icon: true, color: true },
  });

  const categoryMap = new Map(
    categories.map((category) => [category.id, category]),
  );

  return {
    household,
    totalBalance: totals,
    accounts: accountSummaries,
    recentTransactions,
    categoryTotals: categoryTotals.map((item) => ({
      category: item.categoryId
        ? (categoryMap.get(item.categoryId) ?? null)
        : null,
      amount: item._sum.amount ?? new Prisma.Decimal(0),
    })),
  };
}
