import { prisma } from "../../db/prisma.js";
import { ApiError } from "../../utils/apiError.js";

async function assertMembership(userId: string, householdId: string) {
  const membership = await prisma.householdMember.findUnique({
    where: { householdId_userId: { householdId, userId } },
  });

  if (!membership) throw new ApiError(404, "Household not found.");
  return membership;
}

async function assertParent(
  householdId: string,
  parentId: string | null | undefined,
  categoryId?: string,
) {
  if (!parentId) return;

  if (parentId === categoryId) {
    throw new ApiError(400, "A category cannot be its own parent.");
  }

  const parent = await prisma.category.findFirst({
    where: { id: parentId, householdId },
    select: { id: true },
  });

  if (!parent) throw new ApiError(400, "Parent category not found.");
}

async function assertNoCategoryCycle(
  householdId: string,
  categoryId: string,
  parentId: string | null | undefined,
) {
  if (!parentId) return;

  let currentParentId: string | null = parentId;

  while (currentParentId) {
    if (currentParentId === categoryId) {
      throw new ApiError(
        400,
        "A category cannot become an ancestor of itself.",
      );
    }

    const parent: { parentId: string | null } | null =
      await prisma.category.findFirst({
        where: {
          id: currentParentId,
          householdId,
        },
        select: {
          parentId: true,
        },
      });

    if (!parent) {
      throw new ApiError(400, "Parent category not found.");
    }

    currentParentId = parent.parentId;
  }
}

export async function createCategory(
  userId: string,
  householdId: string,
  input: {
    name: string;
    icon?: string;
    color?: string;
    parentId?: string | null;
  },
) {
  const membership = await assertMembership(userId, householdId);

  if (membership.role === "MEMBER") {
    throw new ApiError(403, "You do not have permission to modify categories.");
  }

  await assertParent(householdId, input.parentId);

  try {
    return await prisma.category.create({
      data: {
        householdId,
        name: input.name.trim(),
        ...(input.icon !== undefined ? { icon: input.icon.trim() } : {}),
        ...(input.color !== undefined ? { color: input.color.trim() } : {}),
        parentId: input.parentId ?? null,
      },
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      throw new ApiError(409, "A category with this name already exists.");
    }
    throw error;
  }
}

export async function listCategories(userId: string, householdId: string) {
  await assertMembership(userId, householdId);

  return prisma.category.findMany({
    where: { householdId },
    orderBy: { name: "asc" },
    include: {
      children: {
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          icon: true,
          color: true,
          parentId: true,
          isDefault: true,
        },
      },
    },
  });
}

export async function getCategory(
  userId: string,
  householdId: string,
  categoryId: string,
) {
  await assertMembership(userId, householdId);

  const category = await prisma.category.findFirst({
    where: { id: categoryId, householdId },
    include: { children: true },
  });

  if (!category) throw new ApiError(404, "Category not found.");
  return category;
}

export async function updateCategory(
  userId: string,
  householdId: string,
  categoryId: string,
  input: {
    name?: string;
    icon?: string;
    color?: string;
    parentId?: string | null;
  },
) {
  const membership = await assertMembership(userId, householdId);

  if (membership.role === "MEMBER") {
    throw new ApiError(403, "You do not have permission to modify categories.");
  }

  const category = await prisma.category.findFirst({
    where: { id: categoryId, householdId },
  });

  if (!category) throw new ApiError(404, "Category not found.");

  await assertParent(householdId, input.parentId, categoryId);

  if (input.parentId !== undefined) {
    await assertNoCategoryCycle(householdId, categoryId, input.parentId);
  }

  try {
    return await prisma.category.update({
      where: { id: categoryId },
      data: {
        ...(input.name !== undefined ? { name: input.name.trim() } : {}),
        ...(input.icon !== undefined
          ? { icon: input.icon?.trim() || null }
          : {}),
        ...(input.color !== undefined
          ? { color: input.color?.trim() || null }
          : {}),
        ...(input.parentId !== undefined ? { parentId: input.parentId } : {}),
      },
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      throw new ApiError(409, "A category with this name already exists.");
    }
    throw error;
  }
}

export async function deleteCategory(
  userId: string,
  householdId: string,
  categoryId: string,
) {
  const membership = await assertMembership(userId, householdId);

  if (membership.role === "MEMBER") {
    throw new ApiError(403, "You do not have permission to modify categories.");
  }

  const category = await prisma.category.findFirst({
    where: { id: categoryId, householdId },
    include: { _count: { select: { transactions: true, children: true } } },
  });

  if (!category) throw new ApiError(404, "Category not found.");

  if (category._count.transactions > 0) {
    throw new ApiError(409, "Cannot delete a category used by transactions.");
  }

  if (category._count.children > 0) {
    throw new ApiError(409, "Cannot delete a category with child categories.");
  }

  await prisma.category.delete({ where: { id: categoryId } });
}
