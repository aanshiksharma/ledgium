import { Request, Response } from "express";
import { ApiError } from "../../utils/apiError.js";
import {
  createHouseholdExpense,
  getHouseholdExpense,
  listHouseholdExpenses,
  updateHouseholdExpense,
} from "./household-expense.service.js";

function householdId(req: Request) {
  const value = req.params.householdId;
  if (typeof value !== "string") {
    throw new ApiError(400, "Invalid household ID.");
  }
  return value;
}

function expenseId(req: Request) {
  const value = req.params.id;
  if (typeof value !== "string") {
    throw new ApiError(400, "Invalid expense ID.");
  }
  return value;
}

export async function create(req: Request, res: Response) {
  const expense = await createHouseholdExpense(
    req.user!.id,
    householdId(req),
    req.body,
  );

  res.status(201).json({ success: true, data: { expense } });
}

export async function list(req: Request, res: Response) {
  const expenses = await listHouseholdExpenses(
    req.user!.id,
    householdId(req),
    {
      ...(req.query.from ? { from: new Date(String(req.query.from)) } : {}),
      ...(req.query.to ? { to: new Date(String(req.query.to)) } : {}),
      limit: Number(req.query.limit ?? 50),
      offset: Number(req.query.offset ?? 0),
    },
  );

  res.status(200).json({ success: true, data: expenses });
}

export async function getById(req: Request, res: Response) {
  const expense = await getHouseholdExpense(
    req.user!.id,
    householdId(req),
    expenseId(req),
  );

  res.status(200).json({ success: true, data: { expense } });
}

export async function update(req: Request, res: Response) {
  const expense = await updateHouseholdExpense(
    req.user!.id,
    householdId(req),
    expenseId(req),
    req.body,
  );

  res.status(200).json({ success: true, data: { expense } });
}
