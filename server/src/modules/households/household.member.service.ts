import { prisma } from "../../db/prisma.js";
import { ApiError } from "../../utils/apiError.js";

async function getMembership(userId: string, householdId: string) {
  const membership = await prisma.householdMember.findUnique({
    where: { householdId_userId: { householdId, userId } },
  });

  if (!membership) throw new ApiError(404, "Household not found.");
  return membership;
}

function canManageMembers(role: "OWNER" | "ADMIN" | "MEMBER") {
  return role === "OWNER" || role === "ADMIN";
}

export async function listMembers(userId: string, householdId: string) {
  await getMembership(userId, householdId);

  return prisma.householdMember.findMany({
    where: { householdId },
    orderBy: { joinedAt: "asc" },
    include: {
      user: {
        select: { id: true, name: true, email: true, imageUrl: true },
      },
    },
  });
}

export async function addMember(
  userId: string,
  householdId: string,
  email: string,
  role: "ADMIN" | "MEMBER",
) {
  const actor = await getMembership(userId, householdId);

  if (!canManageMembers(actor.role)) {
    throw new ApiError(403, "You do not have permission to manage household members.");
  }

  if (actor.role === "ADMIN" && role === "ADMIN") {
    throw new ApiError(403, "Only the household owner can create another admin.");
  }

  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: { id: true, name: true, email: true, imageUrl: true },
  });

  if (!user) throw new ApiError(404, "User with this email does not exist.");

  try {
    return await prisma.householdMember.create({
      data: { householdId, userId: user.id, role },
      include: {
        user: { select: { id: true, name: true, email: true, imageUrl: true } },
      },
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      throw new ApiError(409, "User is already a household member.");
    }
    throw error;
  }
}

export async function updateMemberRole(
  userId: string,
  householdId: string,
  memberUserId: string,
  role: "ADMIN" | "MEMBER",
) {
  const actor = await getMembership(userId, householdId);

  if (actor.role !== "OWNER") {
    throw new ApiError(403, "Only the household owner can change member roles.");
  }

  const target = await prisma.householdMember.findUnique({
    where: { householdId_userId: { householdId, userId: memberUserId } },
  });

  if (!target) throw new ApiError(404, "Household member not found.");

  return prisma.householdMember.update({
    where: { id: target.id },
    data: { role },
    include: {
      user: { select: { id: true, name: true, email: true, imageUrl: true } },
    },
  });
}

export async function removeMember(
  userId: string,
  householdId: string,
  memberUserId: string,
) {
  const actor = await getMembership(userId, householdId);

  if (!canManageMembers(actor.role)) {
    throw new ApiError(403, "You do not have permission to manage household members.");
  }

  const target = await prisma.householdMember.findUnique({
    where: { householdId_userId: { householdId, userId: memberUserId } },
  });

  if (!target) throw new ApiError(404, "Household member not found.");

  if (target.role === "OWNER") {
    throw new ApiError(409, "The household owner cannot be removed.");
  }

  if (actor.role === "ADMIN" && target.role === "ADMIN") {
    throw new ApiError(403, "An admin cannot remove another admin.");
  }

  await prisma.householdMember.delete({ where: { id: target.id } });
}
