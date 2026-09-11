import crypto from "crypto";
import { prisma } from "../../db/prisma.js";

const REFRESH_TOKEN_BYTES = 48;

export const REFRESH_TOKEN_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000;

function generateRefreshToken(): string {
  return crypto.randomBytes(REFRESH_TOKEN_BYTES).toString("base64url");
}

function hashRefreshToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createRefreshToken(userId: string): Promise<{
  token: string;
  expiresAt: Date;
}> {
  const token = generateRefreshToken();
  const tokenHash = hashRefreshToken(token);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);

  await prisma.refreshToken.create({
    data: {
      tokenHash,
      userId,
      expiresAt,
    },
  });

  return {
    token,
    expiresAt,
  };
}

export async function rotateRefreshToken(token: string): Promise<{
  userId: string;
  token: string;
  expiresAt: Date;
}> {
  const tokenHash = hashRefreshToken(token);

  const existingToken = await prisma.refreshToken.findUnique({
    where: {
      tokenHash,
    },
  });

  if (!existingToken) {
    throw new Error("Invalid refresh token.");
  }

  if (existingToken.revokedAt) {
    throw new Error("Refresh token has already been used.");
  }

  if (existingToken.expiresAt <= new Date()) {
    throw new Error("Refresh token has expired.");
  }

  const newToken = generateRefreshToken();
  const newTokenHash = hashRefreshToken(newToken);
  const newExpiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);

  await prisma.$transaction([
    prisma.refreshToken.update({
      where: {
        id: existingToken.id,
      },
      data: {
        revokedAt: new Date(),
      },
    }),

    prisma.refreshToken.create({
      data: {
        tokenHash: newTokenHash,
        userId: existingToken.userId,
        expiresAt: newExpiresAt,
      },
    }),
  ]);

  return {
    userId: existingToken.userId,
    token: newToken,
    expiresAt: newExpiresAt,
  };
}

export async function revokeRefreshToken(token: string): Promise<void> {
  const tokenHash = hashRefreshToken(token);

  await prisma.refreshToken.updateMany({
    where: {
      tokenHash,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
}
