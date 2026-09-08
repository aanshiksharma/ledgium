import { prisma } from "../../db/prisma.js";
import { ApiError } from "../../utils/apiError.js";

async function assertHouseholdMember(userId: string, householdId: string) {
  const membership = await prisma.householdMember.findUnique({
    where: {
      householdId_userId: { householdId, userId },
    },
    select: { role: true },
  });

  if (!membership) {
    throw new ApiError(404, "Household not found.");
  }

  return membership;
}

export async function createAccount(
  userId: string,
  householdId: string,
  input: {
    name: string;
    type: "BANK" | "CASH" | "CREDIT_CARD" | "INVESTMENT" | "OTHER";
    openingBalance?: number;
    currency?: string;
  },
) {
  const household = await prisma.household.findFirst({
    where: {
      id: householdId,
      members: { some: { userId } },
    },
    select: { currency: true },
  });

  if (!household) throw new ApiError(404, "Household not found.");

  return prisma.account.create({
    data: {
      householdId,
      name: input.name.trim(),
      type: input.type,
      openingBalance: input.openingBalance ?? 0,
      currency: (input.currency ?? household.currency).trim().toUpperCase(),
    },
  });
}

export async function listAccounts(userId: string, householdId: string) {
  await assertHouseholdMember(userId, householdId);

  return prisma.account.findMany({
    where: { householdId },
    orderBy: [{ isActive: "desc" }, { createdAt: "asc" }],
    include: {
      _count: { select: { transactions: true } },
    },
  });
}

export async function getAccount(
  userId: string,
  householdId: string,
  accountId: string,
) {
  await assertHouseholdMember(userId, householdId);

  const account = await prisma.account.findFirst({
    where: { id: accountId, householdId },
    include: {
      _count: { select: { transactions: true } },
    },
  });

  if (!account) throw new ApiError(404, "Account not found.");
  return account;
}

export async function updateAccount(
  userId: string,
  householdId: string,
  accountId: string,
  input: {
    name?: string;
    type?: "BANK" | "CASH" | "CREDIT_CARD" | "INVESTMENT" | "OTHER";
    openingBalance?: number;
    currency?: string;
  },
) {
  const membership = await assertHouseholdMember(userId, householdId);

  if (membership.role === "MEMBER") {
    throw new ApiError(403, "You do not have permission to modify accounts.");
  }

  const account = await prisma.account.findFirst({
    where: { id: accountId, householdId },
  });

  if (!account) throw new ApiError(404, "Account not found.");

  if (input.openingBalance !== undefined) {
    const transactionCount = await prisma.transaction.count({
      where: {
        accountId: account.id,
      },
    });

    if (transactionCount > 0) {
      throw new ApiError(
        409,
        "Opening balance cannot be changed after transactions have been recorded.",
      );
    }
  }

  return prisma.account.update({
    where: { id: accountId },
    data: {
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.type !== undefined ? { type: input.type } : {}),
      ...(input.openingBalance !== undefined
        ? { openingBalance: input.openingBalance }
        : {}),
      ...(input.currency !== undefined
        ? { currency: input.currency.trim().toUpperCase() }
        : {}),
    },
  });
}

export async function setAccountActive(
  userId: string,
  householdId: string,
  accountId: string,
  isActive: boolean,
) {
  const membership = await assertHouseholdMember(userId, householdId);

  if (membership.role === "MEMBER") {
    throw new ApiError(403, "You do not have permission to modify accounts.");
  }

  const account = await prisma.account.findFirst({
    where: { id: accountId, householdId },
  });

  if (!account) throw new ApiError(404, "Account not found.");

  return prisma.account.update({
    where: { id: accountId },
    data: { isActive },
  });
}
