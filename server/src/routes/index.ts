import { Router } from "express";
import authRoutes from "./auth.routes.js";
import householdRoutes from "./household.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/households", householdRoutes);

export default router;
