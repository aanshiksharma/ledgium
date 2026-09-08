import { Request, Response } from "express";
import { ZodError } from "zod";
import { ApiError } from "../../utils/apiError.js";
import { listTransactionsSchema } from "./transaction.validation.js";
import {
  createTransaction,
  createTransfer,
  deleteTransaction,
  deleteTransfer,
  getTransaction,
  listTransactions,
  updateTransaction,
} from "./transaction.service.js";

function householdId(req: Request) {
  const value = req.params.householdId;
  if (typeof value !== "string")
    throw new ApiError(400, "Invalid household ID.");
  return value;
}

function transactionId(req: Request) {
  const value = req.params.id;
  if (typeof value !== "string")
    throw new ApiError(400, "Invalid transaction ID.");
  return value;
}

export async function create(req: Request, res: Response) {
  const transaction = await createTransaction(
    req.user!.id,
    householdId(req),
    req.body,
  );
  res.status(201).json({ success: true, data: { transaction } });
}

export async function list(req: Request, res: Response) {
  let filters;

  try {
    filters = listTransactionsSchema.parse(req.query);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ApiError(400, "Invalid transaction filters.");
    }

    throw error;
  }

  const result = await listTransactions(req.user!.id, householdId(req), {
    limit: filters.limit,
    offset: filters.offset,
    ...(filters.accountId !== undefined
      ? { accountId: filters.accountId }
      : {}),
    ...(filters.categoryId !== undefined
      ? { categoryId: filters.categoryId }
      : {}),
    ...(filters.from !== undefined ? { from: filters.from } : {}),
    ...(filters.to !== undefined ? { to: filters.to } : {}),
  });
  res.status(200).json({ success: true, data: result });
}

export async function getById(req: Request, res: Response) {
  const transaction = await getTransaction(
    req.user!.id,
    householdId(req),
    transactionId(req),
  );
  res.status(200).json({ success: true, data: { transaction } });
}

export async function update(req: Request, res: Response) {
  const transaction = await updateTransaction(
    req.user!.id,
    householdId(req),
    transactionId(req),
    req.body,
  );
  res.status(200).json({ success: true, data: { transaction } });
}

export async function remove(req: Request, res: Response) {
  await deleteTransaction(req.user!.id, householdId(req), transactionId(req));
  res.status(204).send();
}

export async function transfer(req: Request, res: Response) {
  const result = await createTransfer(req.user!.id, householdId(req), req.body);
  res.status(201).json({ success: true, data: result });
}

export async function removeTransfer(req: Request, res: Response) {
  const value = req.params.transferId;
  if (typeof value !== "string")
    throw new ApiError(400, "Invalid transfer ID.");

  await deleteTransfer(req.user!.id, householdId(req), value);
  res.status(204).send();
}
