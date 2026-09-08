import { prisma } from "../../db/prisma.js";
import { runInTransaction } from "../../db/transactions.js";
import { ApiError } from "../../utils/apiError.js";
import { DEFAULT_CATEGORIES, DEFAULT_CURRENCY } from "./household.defaults.js";

export interface CreateHouseholdInput {
  name: string;
  currency?: string;
}

export async function createHousehold(
  userId: string,
  input: CreateHouseholdInput,
) {
  const name = input.name.trim();
  const currency = (input.currency ?? DEFAULT_CURRENCY).trim().toUpperCase();

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  return runInTransaction(async (tx) => {
    const household = await tx.household.create({
      data: {
        name,
        currency,

        members: {
          create: {
            userId,
            role: "OWNER",
          },
        },

        categories: {
          create: DEFAULT_CATEGORIES.map((category) => ({
            name: category.name,
            icon: category.icon,
            type: "EXPENSE",
            isDefault: true,
          })),
        },
      },

      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                imageUrl: true,
              },
            },
          },
        },

        categories: true,
      },
    });

    return household;
  });
}

export async function getUserHouseholds(userId: string) {
  return prisma.household.findMany({
    where: {
      members: {
        some: {
          userId,
        },
      },
    },

    include: {
      members: {
        where: {
          userId,
        },
        select: {
          role: true,
          joinedAt: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getHouseholdById(userId: string, householdId: string) {
  const household = await prisma.household.findFirst({
    where: {
      id: householdId,

      members: {
        some: {
          userId,
        },
      },
    },

    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              imageUrl: true,
            },
          },
        },
      },

      categories: {
        orderBy: {
          name: "asc",
        },
      },

      accounts: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!household) {
    throw new ApiError(404, "Household not found.");
  }

  return household;
}
