import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validateBody as validate } from "../middleware/validate.middleware.js";
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

router.post("/", validate(createAccountSchema), create);
router.get("/", list);
router.post("/:id/archive", archive);
router.post("/:id/restore", restore);
router.get("/:id", getById);
router.patch("/:id", validate(updateAccountSchema), update);

export default router;
