import { Request, Response } from "express";
import { ApiError } from "../../utils/apiError.js";
import { getDashboard } from "./dashboard.service.js";

export async function get(req: Request, res: Response) {
  const householdId = req.params.householdId;
  if (typeof householdId !== "string") {
    throw new ApiError(400, "Invalid household ID.");
  }

  const from = typeof req.query.from === "string" ? new Date(req.query.from) : undefined;
  const to = typeof req.query.to === "string" ? new Date(req.query.to) : undefined;

  if ((from && Number.isNaN(from.getTime())) || (to && Number.isNaN(to.getTime()))) {
    throw new ApiError(400, "Invalid date filter.");
  }

  const dashboard = await getDashboard(req.user!.id, householdId, from, to);

  res.status(200).json({
    success: true,
    data: dashboard,
  });
}
