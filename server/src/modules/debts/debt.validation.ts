import { z } from "zod";

export const listHouseholdDebtsSchema = z.object({
  status: z.enum(["OPEN", "PARTIALLY_SETTLED", "SETTLED", "CANCELLED"]).optional(),
  userId: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(100),
  offset: z.coerce.number().int().min(0).default(0),
});

export const createSettlementSchema = z.object({
  amount: z.coerce.number().finite().positive(),
  settledAt: z.coerce.date(),
  notes: z.string().trim().max(10000).nullable().optional(),
});
