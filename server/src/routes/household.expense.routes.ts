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
import {
  create,
  getById,
  list,
  update,
} from "../modules/household-expenses/household-expense.controller.js";
import {
  createHouseholdExpenseSchema,
  listHouseholdExpensesSchema,
  updateHouseholdExpenseSchema,
} from "../modules/household-expenses/household-expense.validation.js";

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.post(
  "/",
  validateParams(householdIdParamsSchema),
  validateBody(createHouseholdExpenseSchema),
  create,
);

router.get(
  "/",
  validateParams(householdIdParamsSchema),
  validateQuery(listHouseholdExpensesSchema),
  list,
);

router.get(
  "/:id",
  validateParams(idParamsSchema),
  getById,
);

router.patch(
  "/:id",
  validateParams(idParamsSchema),
  validateBody(updateHouseholdExpenseSchema),
  update,
);

export default router;
