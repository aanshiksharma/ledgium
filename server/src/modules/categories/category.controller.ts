import { Request, Response } from "express";
import { ApiError } from "../../utils/apiError.js";
import {
  createCategory,
  deleteCategory,
  getCategory,
  listCategories,
  updateCategory,
} from "./category.service.js";

function householdId(req: Request) {
  const value = req.params.householdId;
  if (typeof value !== "string") throw new ApiError(400, "Invalid household ID.");
  return value;
}

function categoryId(req: Request) {
  const value = req.params.id;
  if (typeof value !== "string") throw new ApiError(400, "Invalid category ID.");
  return value;
}

export async function create(req: Request, res: Response) {
  const category = await createCategory(req.user!.id, householdId(req), req.body);
  res.status(201).json({ success: true, data: { category } });
}

export async function list(req: Request, res: Response) {
  const categories = await listCategories(req.user!.id, householdId(req));
  res.status(200).json({ success: true, data: { categories } });
}

export async function getById(req: Request, res: Response) {
  const category = await getCategory(req.user!.id, householdId(req), categoryId(req));
  res.status(200).json({ success: true, data: { category } });
}

export async function update(req: Request, res: Response) {
  const category = await updateCategory(
    req.user!.id,
    householdId(req),
    categoryId(req),
    req.body,
  );
  res.status(200).json({ success: true, data: { category } });
}

export async function remove(req: Request, res: Response) {
  await deleteCategory(req.user!.id, householdId(req), categoryId(req));
  res.status(204).send();
}
