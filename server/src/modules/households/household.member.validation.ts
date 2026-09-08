import { z } from "zod";

export const updateMemberRoleSchema = z.object({
  role: z.enum(["ADMIN", "MEMBER"]),
});

export const addMemberSchema = z.object({
  email: z.string().trim().email().max(254),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
});
