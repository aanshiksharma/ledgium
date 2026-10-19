import { Router } from "express";
import authRoutes from "./auth.routes";
import householdRoutes from "./household.routes";
import categoryRoutes from "./category.routes";
import dashboardRoutes from "./dashboard.routes";
import memberRoutes from "./household.member.routes.js";
import householdExpenseRoutes from "./household.expense.routes.js";
import debtRoutes from "./debt.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/households", householdRoutes);
router.use("/households/:householdId/categories", categoryRoutes);
router.use("/households/:householdId/dashboard", dashboardRoutes);
router.use("/households/:householdId/members", memberRoutes);
router.use("/households/:householdId/expenses", householdExpenseRoutes);
router.use("/households/:householdId/debts", debtRoutes);

export default router;
