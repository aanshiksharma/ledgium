import { Router } from "express";

import { requireAuth } from "../middleware/auth.middleware.js";
import { validateBody as validate } from "../middleware/validate.middleware.js";

import {
  create,
  list,
  getById,
} from "../modules/households/household.controller.js";

import { createHouseholdSchema } from "../modules/households/household.validation.js";

const router = Router();

router.use(requireAuth);

router.post("/", validate(createHouseholdSchema), create);

router.get("/", list);

router.get("/:id", getById);

export default router;
