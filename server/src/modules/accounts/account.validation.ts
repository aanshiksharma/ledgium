import { z } from "zod";

export const accountTypeSchema = z.enum([
  "BANK",
  "CASH",
  "CREDIT_CARD",
  "INVESTMENT",
  "OTHER",
]);

export const createAccountSchema = z.object({
  name: z.string().trim().min(1).max(100),
  type: accountTypeSchema,
  openingBalance: z.coerce.number().finite().min(-999999999999.99).max(999999999999.99).default(0),
  currency: z.string().trim().length(3).toUpperCase().optional(),
});

export const updateAccountSchema = createAccountSchema.partial();

export const accountIdSchema = z.object({
  id: z.string().uuid(),
});
