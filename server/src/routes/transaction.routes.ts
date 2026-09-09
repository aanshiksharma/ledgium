import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  validateBody,
  validateParams,
} from "../middleware/validate.middleware.js";

import {
  householdIdParamsSchema,
  idParamsSchema,
  transferParamsSchema,
} from "../validation/params.validation.js";

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

router.post(
  "/",
  validateParams(householdIdParamsSchema),
  validateBody(createTransactionSchema),
  create,
);

router.get("/", validateParams(householdIdParamsSchema), list);

router.get("/:id", validateParams(idParamsSchema), getById);

router.patch(
  "/:id",
  validateParams(idParamsSchema),
  validateBody(updateTransactionSchema),
  update,
);

router.delete("/:id", validateParams(idParamsSchema), remove);

router.post(
  "/transfers",
  validateParams(householdIdParamsSchema),
  validateBody(transferSchema),
  transfer,
);

router.delete(
  "/transfers/:transferId",
  validateParams(transferParamsSchema),
  removeTransfer,
);

export default router;
