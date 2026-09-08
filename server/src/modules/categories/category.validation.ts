import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().trim().min(1).max(100),
  icon: z.string().trim().max(50).optional(),
  color: z.string().trim().max(20).optional(),
  parentId: z.string().uuid().nullable().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();
