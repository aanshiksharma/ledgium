import { z } from "zod";

export const listHouseholdDebtsSchema = z.object({
  status: z
    .enum(["OPEN", "PARTIALLY_SETTLED", "SETTLED", "CANCELLED"])
    .optional(),
  userId: z.string().uuid().optional(),
  activeOnly: z.coerce.boolean().default(true),
  limit: z.coerce.number().int().min(1).max(100).default(100),
  offset: z.coerce.number().int().min(0).default(0),
});

export const listHouseholdSettlementsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(100),
  offset: z.coerce.number().int().min(0).default(0),
});

export const createSettlementSchema = z
  .object({
    debtorId: z.string().uuid(),
    creditorId: z.string().uuid(),
    allocations: z
      .array(
        z.object({
          debtId: z.string().uuid(),
          amount: z.coerce
            .number()
            .finite()
            .positive()
            .max(1000000, "Amount cannot exceed 1,000,000.00.")
            .optional(),
        }),
      )
      .min(1)
      .max(100, "A settlement can include at most 100 debts."),
    settledAt: z.coerce.date(),
    notes: z.string().trim().max(10000).nullable().optional(),
  })
  .superRefine((data, ctx) => {
    const hasAllocations = data.allocations !== undefined;

    const ids = data.allocations.map((item) => item.debtId);
    if (new Set(ids).size !== ids.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Each debt can appear only once in 'allocations'.",
        path: ["allocations"],
      });
    }
  });
