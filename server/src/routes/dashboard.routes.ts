import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { get } from "../modules/dashboard/dashboard.controller.js";

const router = Router({ mergeParams: true });

router.use(requireAuth);
router.get("/", get);

export default router;
