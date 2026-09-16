import { Request, Response } from "express";
import { ApiError } from "../../utils/apiError.js";
import {
  createDebtSettlement,
  getHouseholdDebt,
  listHouseholdDebtSummary,
  listHouseholdDebts,
  listHouseholdSettlements,
} from "./debt.service.js";

function householdId(req: Request) {
  const value = req.params.householdId;
  if (typeof value !== "string") throw new ApiError(400, "Invalid household ID.");
  return value;
}

function debtId(req: Request) {
  const value = req.params.id;
  if (typeof value !== "string") throw new ApiError(400, "Invalid debt ID.");
  return value;
}

export async function list(req: Request, res: Response) {
  const query = req.query as unknown as {
    status?: "OPEN" | "PARTIALLY_SETTLED" | "SETTLED" | "CANCELLED";
    userId?: string;
    limit: number;
    offset: number;
  };

  const debts = await listHouseholdDebts(req.user!.id, householdId(req), query);
  res.status(200).json({ success: true, data: debts });
}

export async function summary(req: Request, res: Response) {
  const data = await listHouseholdDebtSummary(req.user!.id, householdId(req));
  res.status(200).json({ success: true, data });
}

export async function settlements(req: Request, res: Response) {
  const query = req.query as unknown as { limit: number; offset: number };
  const data = await listHouseholdSettlements(req.user!.id, householdId(req), query);
  res.status(200).json({ success: true, data });
}

export async function getById(req: Request, res: Response) {
  const debt = await getHouseholdDebt(req.user!.id, householdId(req), debtId(req));
  res.status(200).json({ success: true, data: { debt } });
}

export async function settle(req: Request, res: Response) {
  const result = await createDebtSettlement(
    req.user!.id,
    householdId(req),
    debtId(req),
    req.body,
  );
  res.status(201).json({ success: true, data: result });
}
