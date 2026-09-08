import { z } from "zod";

const dateSchema = z.coerce.date();

export const createTransactionSchema = z.object({
  accountId: z.string().uuid(),
  categoryId: z.string().uuid().nullable().optional(),
  amount: z.coerce
    .number()
    .finite()
    .refine((value) => value !== 0, "Amount cannot be zero."),
  description: z.string().trim().min(1).max(255),
  transactionDate: dateSchema,
  notes: z.string().trim().max(10000).nullable().optional(),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export const listTransactionsSchema = z
  .object({
    accountId: z.string().uuid().optional(),
    categoryId: z.string().uuid().optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
    limit: z.coerce.number().int().min(1).max(100).default(50),
    offset: z.coerce.number().int().min(0).default(0),
  })
  .refine(
    (data) =>
      data.from === undefined || data.to === undefined || data.from <= data.to,
    {
      message: "`from` date cannot be after `to` date.",
      path: ["to"],
    },
  );
