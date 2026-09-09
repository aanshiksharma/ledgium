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
    where: {
      householdId_userId: { householdId, userId },
    },
  });

  if (!membership) {
    throw new ApiError(404, "Household not found.");
  }

  const household = await prisma.household.findUnique({
    where: { id: householdId },
    select: {
      id: true,
      name: true,
      currency: true,
    },
  });

  if (!household) {
    throw new ApiError(404, "Household not found.");
  }

  const dateFilter =
    from || to
      ? {
          transactionDate: {
            ...(from ? { gte: from } : {}),
            ...(to ? { lte: to } : {}),
          },
        }
      : {};

  /*
   * Current balances are independent of the selected reporting period.
   *
   * current balance =
   *   opening balance
   *   + all historical transactions
   */
  const accounts = await prisma.account.findMany({
    where: {
      householdId,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      type: true,
      currency: true,
      openingBalance: true,
      transactions: {
        select: {
          amount: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const accountSummaries = accounts.map((account) => {
    const currentBalance = account.transactions.reduce(
      (sum, transaction) => sum.add(transaction.amount),
      new Prisma.Decimal(0),
    );

    return {
      id: account.id,
      name: account.name,
      type: account.type,
      currency: account.currency,
      balance: account.openingBalance.add(currentBalance),
    };
  });

  const totalBalance = accountSummaries.reduce(
    (sum, account) => sum.add(account.balance),
    new Prisma.Decimal(0),
  );

  /*
   * Reporting-period activity is calculated separately from
   * current balances.
   */
  const periodTransactions = await prisma.transaction.findMany({
    where: {
      householdId,
      ...dateFilter,
    },
    select: {
      amount: true,
    },
  });

  const periodActivity = periodTransactions.reduce(
    (result, transaction) => {
      if (transaction.amount.greaterThan(0)) {
        result.inflow = result.inflow.add(transaction.amount);
      } else if (transaction.amount.lessThan(0)) {
        result.outflow = result.outflow.add(transaction.amount.abs());
      }

      return result;
    },
    {
      inflow: new Prisma.Decimal(0),
      outflow: new Prisma.Decimal(0),
    },
  );

  const netChange = periodActivity.inflow.sub(periodActivity.outflow);

  const recentTransactions = await prisma.transaction.findMany({
    where: {
      householdId,
      ...dateFilter,
    },
    orderBy: [{ transactionDate: "desc" }, { createdAt: "desc" }],
    take: 10,
    include: {
      account: {
        select: {
          id: true,
          name: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          icon: true,
          color: true,
        },
      },
    },
  });

  const categoryTotals = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      householdId,
      ...dateFilter,
      categoryId: {
        not: null,
      },
    },
    _sum: {
      amount: true,
    },
  });

  const categoryIds = categoryTotals
    .map((item) => item.categoryId)
    .filter((id): id is string => Boolean(id));

  const categories = await prisma.category.findMany({
    where: {
      id: {
        in: categoryIds,
      },
    },
    select: {
      id: true,
      name: true,
      icon: true,
      color: true,
    },
  });

  const categoryMap = new Map(
    categories.map((category) => [category.id, category]),
  );

  return {
    household,

    totalBalance,

    periodActivity: {
      inflow: periodActivity.inflow,
      outflow: periodActivity.outflow,
      netChange,
    },

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
