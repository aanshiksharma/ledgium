import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validate.middleware.js";
import {
  householdIdParamsSchema,
  idParamsSchema,
} from "../validation/params.validation.js";
import { getById, list, settle } from "../modules/debts/debt.controller.js";
import {
  createSettlementSchema,
  listHouseholdDebtsSchema,
} from "../modules/debts/debt.validation.js";

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.get(
  "/",
  validateParams(householdIdParamsSchema),
  validateQuery(listHouseholdDebtsSchema),
  list,
);

router.get("/:id", validateParams(idParamsSchema), getById);

router.post(
  "/:id/settlements",
  validateParams(idParamsSchema),
  validateBody(createSettlementSchema),
  settle,
);

export default router;
