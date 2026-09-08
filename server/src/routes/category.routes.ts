import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validateBody as validate } from "../middleware/validate.middleware.js";
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

router.post("/", validate(createCategorySchema), create);
router.get("/", list);
router.get("/:id", getById);
router.patch("/:id", validate(updateCategorySchema), update);
router.delete("/:id", remove);

export default router;
