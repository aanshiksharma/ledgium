import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { validateBody as validate } from "../middleware/validate.middleware";
import {
  list,
  add,
  updateRole,
  remove,
} from "../modules/households/household.member.controller";
import {
  addMemberSchema,
  updateMemberRoleSchema,
} from "../modules/households/household.member.validation";

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.get("/", list);
router.post("/", validate(addMemberSchema), add);
router.patch("/:userId", validate(updateMemberRoleSchema), updateRole);
router.delete("/:userId", remove);

export default router;
