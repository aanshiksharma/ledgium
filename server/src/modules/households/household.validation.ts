import { z } from "zod";

export const createHouseholdSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Household name must contain at least 2 characters.")
    .max(100, "Household name cannot exceed 100 characters."),

  currency: z
    .string()
    .trim()
    .length(3, "Currency must be a 3-letter ISO currency code.")
    .toUpperCase()
    .default("INR"),
});
