import { z } from "zod";

const uuid = z.string().uuid();

const money = z
  .coerce.number()
  .finite()
  .positive()
  .max(1000000, "Amount cannot exceed 1,000,000.00.")
  .refine((value) => Number.isInteger(Math.round(value * 100)), {
    message: "Amount can have at most two decimal places.",
  });

const participantSchema = z.object({
  userId: uuid,
  shareAmount: money,
  sharePercentage: z.coerce.number().finite().min(0).max(100).optional(),
});

const payerSchema = z.object({
  userId: uuid,
  paidAmount: money,
});

const householdExpenseDataSchema = z
  .object({
    description: z.string().trim().min(1).max(255),
    categoryId: uuid,
    totalAmount: money,
    expenseDate: z.coerce.date(),
    notes: z.string().trim().max(10000).nullable().optional(),
    payers: z.array(payerSchema).length(1, "Exactly one payer is required."),
    participants: z.array(participantSchema).min(1),
  })
  .superRefine((data, ctx) => {
    const payerIds = data.payers.map((payer) => payer.userId);
    const participantIds = data.participants.map(
      (participant) => participant.userId,
    );

    if (new Set(payerIds).size !== payerIds.length) {
      ctx.addIssue({
        code: "custom",
        path: ["payers"],
        message: "Each payer can appear only once.",
      });
    }

    if (new Set(participantIds).size !== participantIds.length) {
      ctx.addIssue({
        code: "custom",
        path: ["participants"],
        message: "Each participant can appear only once.",
      });
    }

    const payerTotal = data.payers.reduce(
      (sum, payer) => sum + payer.paidAmount,
      0,
    );

    const participantTotal = data.participants.reduce(
      (sum, participant) => sum + participant.shareAmount,
      0,
    );

    if (Math.abs(payerTotal - data.totalAmount) > 0.005) {
      ctx.addIssue({
        code: "custom",
        path: ["payers"],
        message: "The payer amount must equal the total expense amount.",
      });
    }

    if (Math.abs(participantTotal - data.totalAmount) > 0.005) {
      ctx.addIssue({
        code: "custom",
        path: ["participants"],
        message: "Participant obligations must equal the total expense amount.",
      });
    }

    const hasPercentage = data.participants.some(
      (participant) => participant.sharePercentage !== undefined,
    );

    if (hasPercentage) {
      const percentageTotal = data.participants.reduce(
        (sum, participant) => sum + (participant.sharePercentage ?? 0),
        0,
      );

      if (Math.abs(percentageTotal - 100) > 0.005) {
        ctx.addIssue({
          code: "custom",
          path: ["participants"],
          message: "Participant percentages must add up to 100.",
        });
      }
    }
  });

export const createHouseholdExpenseSchema = householdExpenseDataSchema;
export const updateHouseholdExpenseSchema = householdExpenseDataSchema;

export const listHouseholdExpensesSchema = z
  .object({
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
    limit: z.coerce.number().int().min(1).max(100).default(50),
    offset: z.coerce.number().int().min(0).default(0),
  })
  .refine(
    (data) =>
      data.from === undefined ||
      data.to === undefined ||
      data.from <= data.to,
    {
      message: "`from` date cannot be after `to` date.",
      path: ["to"],
    },
  );
