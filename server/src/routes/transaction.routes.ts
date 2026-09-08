import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validateBody as validate } from "../middleware/validate.middleware.js";
import {
  create,
  list,
  getById,
  update,
  remove,
  transfer,
  removeTransfer,
} from "../modules/transactions/transaction.controller.js";
import {
  createTransactionSchema,
  updateTransactionSchema,
} from "../modules/transactions/transaction.validation.js";
import { z } from "zod";

const transferSchema = z.object({
  fromAccountId: z.string().uuid(),
  toAccountId: z.string().uuid(),
  amount: z.coerce.number().finite().positive(),
  description: z.string().trim().max(255).optional(),
  transactionDate: z.coerce.date(),
  notes: z.string().trim().max(10000).nullable().optional(),
});

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.post("/", validate(createTransactionSchema), create);
router.get("/", list);
router.get("/:id", getById);
router.patch("/:id", validate(updateTransactionSchema), update);
router.delete("/:id", remove);
router.post("/transfers", validate(transferSchema), transfer);
router.delete("/transfers/:transferId", removeTransfer);

export default router;
