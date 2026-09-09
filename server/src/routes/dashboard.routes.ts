import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validateParams } from "../middleware/validate.middleware.js";
import { get } from "../modules/dashboard/dashboard.controller.js";
import { householdIdParamsSchema } from "../validation/params.validation.js";

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.get("/", validateParams(householdIdParamsSchema), get);

export default router;
