import { Request, Response } from "express";
import {
  createHousehold,
  getHouseholdById,
  getUserHouseholds,
} from "./household.service.js";
import { ApiError } from "../../utils/apiError.js";

export async function create(req: Request, res: Response): Promise<void> {
  const household = await createHousehold(req.user!.id, req.body);

  res.status(201).json({
    success: true,
    data: {
      household,
    },
  });
}

export async function list(req: Request, res: Response): Promise<void> {
  const households = await getUserHouseholds(req.user!.id);

  res.status(200).json({
    success: true,
    data: {
      households,
    },
  });
}

export async function getById(req: Request, res: Response): Promise<void> {
  const householdId = req.params.id;

  if (typeof householdId !== "string") {
    throw new ApiError(400, "Invalid household ID.");
  }

  const household = await getHouseholdById(req.user!.id, householdId);

  res.status(200).json({
    success: true,
    data: {
      household,
    },
  });
}
