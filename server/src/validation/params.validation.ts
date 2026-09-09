import { z } from "zod";

export const householdIdParamsSchema = z.object({
  householdId: z.string().uuid(),
});

export const idParamsSchema = z.object({
  householdId: z.string().uuid(),
  id: z.string().uuid(),
});

export const transferParamsSchema = z.object({
  householdId: z.string().uuid(),
  transferId: z.string().uuid(),
});

export const memberParamsSchema = z.object({
  householdId: z.string().uuid(),
  userId: z.string().uuid(),
});
