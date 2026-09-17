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
  openingBalance: z.coerce.number().finite().min(-1000000, "Opening balance cannot be less than -1,000,000.00.").max(1000000, "Opening balance cannot exceed 1,000,000.00.").default(0),
  currency: z.string().trim().length(3).toUpperCase().optional(),
});

export const updateAccountSchema = createAccountSchema.partial();

export const accountIdSchema = z.object({
  id: z.string().uuid(),
});
