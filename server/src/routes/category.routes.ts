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
  remove,
} from "../modules/categories/category.controller.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../modules/categories/category.validation.js";

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.post(
  "/",
  validateParams(householdIdParamsSchema),
  validateBody(createCategorySchema),
  create,
);

router.get("/", validateParams(householdIdParamsSchema), list);
router.get("/:id", validateParams(idParamsSchema), getById);

router.patch(
  "/:id",
  validateParams(idParamsSchema),
  validateBody(updateCategorySchema),
  update,
);

router.delete("/:id", validateParams(idParamsSchema), remove);

export default router;
