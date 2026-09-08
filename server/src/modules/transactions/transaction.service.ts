import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "../../db/prisma.js";
import { ApiError } from "../../utils/apiError.js";

async function assertMembership(userId: string, householdId: string) {
  const membership = await prisma.householdMember.findUnique({
    where: { householdId_userId: { householdId, userId } },
  });

  if (!membership) throw new ApiError(404, "Household not found.");
  return membership;
}

async function assertAccount(householdId: string, accountId: string) {
  const account = await prisma.account.findFirst({
    where: { id: accountId, householdId, isActive: true },
    select: { id: true },
  });

  if (!account) throw new ApiError(400, "Active account not found.");
}

async function assertCategory(householdId: string, categoryId: string | null | undefined) {
  if (!categoryId) return;

  const category = await prisma.category.findFirst({
    where: { id: categoryId, householdId },
    select: { id: true },
  });

  if (!category) throw new ApiError(400, "Category not found.");
}

function normalizeDate(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export async function createTransaction(
  userId: string,
  householdId: string,
  input: {
    accountId: string;
    categoryId?: string | null;
    amount: number;
    description: string;
    transactionDate: Date;
    notes?: string | null;
  },
) {
  await assertMembership(userId, householdId);
  await assertAccount(householdId, input.accountId);
  await assertCategory(householdId, input.categoryId);

  return prisma.transaction.create({
    data: {
      householdId,
      accountId: input.accountId,
      categoryId: input.categoryId ?? null,
      createdBy: userId,
      amount: new Prisma.Decimal(input.amount),
      description: input.description.trim(),
      transactionDate: normalizeDate(input.transactionDate),
      notes: input.notes?.trim() || null,
    },
    include: {
      account: true,
      category: true,
      creator: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function listTransactions(
  userId: string,
  householdId: string,
  filters: {
    accountId?: string;
    categoryId?: string;
    from?: Date;
    to?: Date;
    limit: number;
    offset: number;
  },
) {
  await assertMembership(userId, householdId);

  const where: Prisma.TransactionWhereInput = {
    householdId,
    ...(filters.accountId ? { accountId: filters.accountId } : {}),
    ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
    ...(filters.from || filters.to
      ? {
          transactionDate: {
            ...(filters.from ? { gte: normalizeDate(filters.from) } : {}),
            ...(filters.to ? { lte: normalizeDate(filters.to) } : {}),
          },
        }
      : {}),
  };

  const [transactions, total] = await prisma.$transaction([
    prisma.transaction.findMany({
      where,
      orderBy: [{ transactionDate: "desc" }, { createdAt: "desc" }],
      skip: filters.offset,
      take: filters.limit,
      include: {
        account: { select: { id: true, name: true, type: true, currency: true } },
        category: { select: { id: true, name: true, icon: true, color: true } },
      },
    }),
    prisma.transaction.count({ where }),
  ]);

  return { transactions, total };
}

export async function getTransaction(
  userId: string,
  householdId: string,
  transactionId: string,
) {
  await assertMembership(userId, householdId);

  const transaction = await prisma.transaction.findFirst({
    where: { id: transactionId, householdId },
    include: {
      account: true,
      category: true,
      creator: { select: { id: true, name: true, email: true } },
    },
  });

  if (!transaction) throw new ApiError(404, "Transaction not found.");
  return transaction;
}

export async function updateTransaction(
  userId: string,
  householdId: string,
  transactionId: string,
  input: {
    accountId?: string;
    categoryId?: string | null;
    amount?: number;
    description?: string;
    transactionDate?: Date;
    notes?: string | null;
  },
) {
  await assertMembership(userId, householdId);

  const existing = await prisma.transaction.findFirst({
    where: { id: transactionId, householdId },
  });

  if (!existing) throw new ApiError(404, "Transaction not found.");

  if (existing.transferId) {
    throw new ApiError(409, "Transfer transactions must be modified through the transfer operation.");
  }

  if (input.accountId !== undefined) {
    await assertAccount(householdId, input.accountId);
  }

  if (input.categoryId !== undefined) {
    await assertCategory(householdId, input.categoryId);
  }

  return prisma.transaction.update({
    where: { id: transactionId },
    data: {
      ...(input.accountId !== undefined ? { accountId: input.accountId } : {}),
      ...(input.categoryId !== undefined ? { categoryId: input.categoryId } : {}),
      ...(input.amount !== undefined ? { amount: new Prisma.Decimal(input.amount) } : {}),
      ...(input.description !== undefined ? { description: input.description.trim() } : {}),
      ...(input.transactionDate !== undefined
        ? { transactionDate: normalizeDate(input.transactionDate) }
        : {}),
      ...(input.notes !== undefined ? { notes: input.notes?.trim() || null } : {}),
    },
    include: {
      account: true,
      category: true,
    },
  });
}

export async function deleteTransaction(
  userId: string,
  householdId: string,
  transactionId: string,
) {
  await assertMembership(userId, householdId);

  const existing = await prisma.transaction.findFirst({
    where: { id: transactionId, householdId },
  });

  if (!existing) throw new ApiError(404, "Transaction not found.");

  if (existing.transferId) {
    throw new ApiError(409, "Transfer transactions must be deleted through the transfer operation.");
  }

  await prisma.transaction.delete({ where: { id: transactionId } });
}

export async function createTransfer(
  userId: string,
  householdId: string,
  input: {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    description?: string;
    transactionDate: Date;
    notes?: string | null;
  },
) {
  await assertMembership(userId, householdId);

  if (input.fromAccountId === input.toAccountId) {
    throw new ApiError(400, "Source and destination accounts must be different.");
  }

  if (input.amount <= 0) {
    throw new ApiError(400, "Transfer amount must be greater than zero.");
  }

  await assertAccount(householdId, input.fromAccountId);
  await assertAccount(householdId, input.toAccountId);

  const transferId = randomUUID();
  const date = normalizeDate(input.transactionDate);

  return prisma.$transaction(async (tx) => {
    const outgoing = await tx.transaction.create({
      data: {
        householdId,
        accountId: input.fromAccountId,
        createdBy: userId,
        transferId,
        amount: new Prisma.Decimal(-input.amount),
        description: input.description?.trim() || "Transfer",
        transactionDate: date,
        notes: input.notes?.trim() || null,
      },
    });

    const incoming = await tx.transaction.create({
      data: {
        householdId,
        accountId: input.toAccountId,
        createdBy: userId,
        transferId,
        amount: new Prisma.Decimal(input.amount),
        description: input.description?.trim() || "Transfer",
        transactionDate: date,
        notes: input.notes?.trim() || null,
      },
    });

    return { transferId, outgoing, incoming };
  });
}

export async function deleteTransfer(
  userId: string,
  householdId: string,
  transferId: string,
) {
  await assertMembership(userId, householdId);

  const count = await prisma.transaction.count({
    where: { householdId, transferId },
  });

  if (count !== 2) throw new ApiError(404, "Transfer not found.");

  await prisma.transaction.deleteMany({
    where: { householdId, transferId },
  });
}
