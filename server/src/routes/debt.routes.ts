import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validate.middleware.js";
import { householdIdParamsSchema, idParamsSchema } from "../validation/params.validation.js";
import { getById, list, settle, settlements, summary } from "../modules/debts/debt.controller.js";
import {
  createSettlementSchema,
  listHouseholdDebtsSchema,
  listHouseholdSettlementsSchema,
} from "../modules/debts/debt.validation.js";

const router = Router({ mergeParams: true });
router.use(requireAuth);

router.get("/summary", validateParams(householdIdParamsSchema), summary);
router.get(
  "/settlements",
  validateParams(householdIdParamsSchema),
  validateQuery(listHouseholdSettlementsSchema),
  settlements,
);
router.post(
  "/settlements",
  validateParams(householdIdParamsSchema),
  validateBody(createSettlementSchema),
  settle,
);
router.get(
  "/",
  validateParams(householdIdParamsSchema),
  validateQuery(listHouseholdDebtsSchema),
  list,
);
router.get("/:id", validateParams(idParamsSchema), getById);

export default router;
