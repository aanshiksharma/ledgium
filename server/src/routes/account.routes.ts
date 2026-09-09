import { Router } from "express";

import { requireAuth } from "../middleware/auth.middleware.js";
import {
  validateBody,
  validateParams,
} from "../middleware/validate.middleware.js";

import {
  householdIdParamsSchema,
  idParamsSchema,
} from "../validation/params.validation.js";

import {
  create,
  list,
  getById,
  update,
  archive,
  restore,
} from "../modules/accounts/account.controller.js";
import {
  createAccountSchema,
  updateAccountSchema,
} from "../modules/accounts/account.validation.js";

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.post("/", validateBody(createAccountSchema), create);
router.get("/", validateParams(householdIdParamsSchema), list);
router.post("/:id/archive", validateParams(idParamsSchema), archive);
router.post("/:id/restore", validateParams(idParamsSchema), restore);
router.get("/:id", validateParams(idParamsSchema), getById);

router.patch(
  "/:id",
  validateParams(idParamsSchema),
  validateBody(updateAccountSchema),
  update,
);

export default router;
