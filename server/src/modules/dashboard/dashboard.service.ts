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

  const expenseDateFilter =
    from || to
      ? {
          expenseDate: {
            ...(from ? { gte: from } : {}),
            ...(to ? { lte: to } : {}),
          },
        }
      : {};

  const householdExpenses = await prisma.householdExpense.findMany({
    where: { householdId, ...expenseDateFilter },
    select: { id: true, totalAmount: true },
  });
  const sharedExpenseTotal = householdExpenses.reduce(
    (sum, expense) => sum.add(expense.totalAmount),
    new Prisma.Decimal(0),
  );

  const debtDateFilter =
    from || to
      ? {
          householdExpense: {
            householdId,
            expenseDate: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          },
        }
      : { householdExpense: { householdId } };

  const [userOwedDebts, userReceivableDebts] = await prisma.$transaction([
    prisma.debt.findMany({
      where: {
        sourceType: "HOUSEHOLD",
        isActive: true,
        debtorId: userId,
        ...debtDateFilter,
      },
      select: { remainingAmount: true },
    }),
    prisma.debt.findMany({
      where: {
        sourceType: "HOUSEHOLD",
        isActive: true,
        creditorId: userId,
        ...debtDateFilter,
      },
      select: { remainingAmount: true },
    }),
  ]);

  const amountOwed = userOwedDebts.reduce(
    (sum, debt) => sum.add(debt.remainingAmount),
    new Prisma.Decimal(0),
  );
  const amountReceivable = userReceivableDebts.reduce(
    (sum, debt) => sum.add(debt.remainingAmount),
    new Prisma.Decimal(0),
  );

  return {
    household,
    sharedExpenses: {
      total: sharedExpenseTotal,
      count: householdExpenses.length,
      currency: household.currency,
    },
    householdDebts: {
      amountOwed,
      amountReceivable,
      openCount: userOwedDebts.length + userReceivableDebts.length,
      currency: household.currency,
    },
  };
}
