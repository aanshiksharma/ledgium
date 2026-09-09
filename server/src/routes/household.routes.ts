import { Router } from "express";

import { requireAuth } from "../middleware/auth.middleware.js";
import {
  validateBody,
  validateParams,
} from "../middleware/validate.middleware.js";

import {
  create,
  list,
  getById,
} from "../modules/households/household.controller.js";

import { createHouseholdSchema } from "../modules/households/household.validation.js";
import { idParamsSchema } from "../validation/params.validation.js";

const router = Router();

router.use(requireAuth);

router.post("/", validateBody(createHouseholdSchema), create);
router.get("/", list);
router.get(
  "/:id",
  validateParams(idParamsSchema.omit({ householdId: true })),
  getById,
);

export default router;
