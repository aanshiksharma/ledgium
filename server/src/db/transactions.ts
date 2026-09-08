import { Prisma } from "@prisma/client";
import { prisma } from "./prisma.js";

export const runInTransaction = async <T>(
  callback: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> => {
  return prisma.$transaction(callback);
};
