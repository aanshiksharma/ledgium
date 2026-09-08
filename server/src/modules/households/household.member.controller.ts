import { Request, Response } from "express";
import { ApiError } from "../../utils/apiError.js";
import {
  addMember,
  listMembers,
  removeMember,
  updateMemberRole,
} from "./household.member.service.js";

function householdId(req: Request) {
  const value = req.params.householdId;
  if (typeof value !== "string") throw new ApiError(400, "Invalid household ID.");
  return value;
}

function memberUserId(req: Request) {
  const value = req.params.userId;
  if (typeof value !== "string") throw new ApiError(400, "Invalid member ID.");
  return value;
}

export async function list(req: Request, res: Response) {
  const members = await listMembers(req.user!.id, householdId(req));
  res.status(200).json({ success: true, data: { members } });
}

export async function add(req: Request, res: Response) {
  const member = await addMember(
    req.user!.id,
    householdId(req),
    req.body.email,
    req.body.role,
  );
  res.status(201).json({ success: true, data: { member } });
}

export async function updateRole(req: Request, res: Response) {
  const member = await updateMemberRole(
    req.user!.id,
    householdId(req),
    memberUserId(req),
    req.body.role,
  );
  res.status(200).json({ success: true, data: { member } });
}

export async function remove(req: Request, res: Response) {
  await removeMember(req.user!.id, householdId(req), memberUserId(req));
  res.status(204).send();
}
