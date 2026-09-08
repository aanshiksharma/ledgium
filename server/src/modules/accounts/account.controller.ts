import { Request, Response } from "express";
import { ApiError } from "../../utils/apiError.js";
import {
  createAccount,
  getAccount,
  listAccounts,
  setAccountActive,
  updateAccount,
} from "./account.service.js";

function householdId(req: Request) {
  const value = req.params.householdId;
  if (typeof value !== "string") throw new ApiError(400, "Invalid household ID.");
  return value;
}

function accountId(req: Request) {
  const value = req.params.id;
  if (typeof value !== "string") throw new ApiError(400, "Invalid account ID.");
  return value;
}

export async function create(req: Request, res: Response) {
  const account = await createAccount(req.user!.id, householdId(req), req.body);
  res.status(201).json({ success: true, data: { account } });
}

export async function list(req: Request, res: Response) {
  const accounts = await listAccounts(req.user!.id, householdId(req));
  res.status(200).json({ success: true, data: { accounts } });
}

export async function getById(req: Request, res: Response) {
  const account = await getAccount(req.user!.id, householdId(req), accountId(req));
  res.status(200).json({ success: true, data: { account } });
}

export async function update(req: Request, res: Response) {
  const account = await updateAccount(
    req.user!.id,
    householdId(req),
    accountId(req),
    req.body,
  );
  res.status(200).json({ success: true, data: { account } });
}

export async function archive(req: Request, res: Response) {
  const account = await setAccountActive(
    req.user!.id,
    householdId(req),
    accountId(req),
    false,
  );
  res.status(200).json({ success: true, data: { account } });
}

export async function restore(req: Request, res: Response) {
  const account = await setAccountActive(
    req.user!.id,
    householdId(req),
    accountId(req),
    true,
  );
  res.status(200).json({ success: true, data: { account } });
}
