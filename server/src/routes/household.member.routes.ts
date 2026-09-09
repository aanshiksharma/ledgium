import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  validateBody,
  validateParams,
} from "../middleware/validate.middleware.js";

import {
  list,
  add,
  updateRole,
  remove,
} from "../modules/households/household.member.controller.js";

import {
  addMemberSchema,
  updateMemberRoleSchema,
} from "../modules/households/household.member.validation.js";

import {
  householdIdParamsSchema,
  memberParamsSchema,
} from "../validation/params.validation.js";

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.get("/", validateParams(householdIdParamsSchema), list);

router.post(
  "/",
  validateParams(householdIdParamsSchema),
  validateBody(addMemberSchema),
  add,
);

router.patch(
  "/:userId",
  validateParams(memberParamsSchema),
  validateBody(updateMemberRoleSchema),
  updateRole,
);

router.delete("/:userId", validateParams(memberParamsSchema), remove);

export default router;
