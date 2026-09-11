import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import type { StringValue } from "ms";

import { prisma } from "../../db/prisma.js";
import { ApiError } from "../../utils/apiError.js";
import { env } from "../../config/env.js";
import { AuthResponse, AuthUser } from "./auth.types.js";

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

const SALT_ROUNDS = 12;

function sanitizeUser(user: {
  id: string;
  name: string;
  email: string;
  imageUrl: string | null;
  createdAt: Date;
}): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    imageUrl: user.imageUrl,
    createdAt: user.createdAt,
  };
}

function createAccessToken(user: AuthUser): string {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
    },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN as StringValue,
    },
  );
}

function generateRefreshToken(): string {
  return crypto.randomBytes(48).toString("base64url");
}

function hashRefreshToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function getRefreshTokenExpiry(): Date {
  const expiresAt = new Date();

  expiresAt.setDate(expiresAt.getDate() + env.REFRESH_TOKEN_EXPIRES_IN_DAYS);

  return expiresAt;
}

async function createRefreshToken(userId: string): Promise<string> {
  const token = generateRefreshToken();

  await prisma.refreshToken.create({
    data: {
      tokenHash: hashRefreshToken(token),
      userId,
      expiresAt: getRefreshTokenExpiry(),
    },
  });

  return token;
}

async function createAuthSession(user: AuthUser): Promise<{
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}> {
  const accessToken = createAccessToken(user);
  const refreshToken = await createRefreshToken(user.id);

  return {
    user,
    accessToken,
    refreshToken,
  };
}

export async function registerUser(
  name: string,
  email: string,
  password: string,
): Promise<
  AuthResponse & {
    accessToken: string;
    refreshToken: string;
  }
> {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (existingUser) {
    throw new ApiError(409, "An account with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
    },
  });

  return createAuthSession(sanitizeUser(user));
}

export async function loginUser(
  email: string,
  password: string,
): Promise<
  AuthResponse & {
    accessToken: string;
    refreshToken: string;
  }
> {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (!user || !user.passwordHash) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    throw new ApiError(401, "Invalid email or password.");
  }

  return createAuthSession(sanitizeUser(user));
}

export async function loginWithGoogle(credential: string): Promise<
  AuthResponse & {
    accessToken: string;
    refreshToken: string;
  }
> {
  let payload;

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: env.GOOGLE_CLIENT_ID,
    });

    payload = ticket.getPayload();
  } catch {
    throw new ApiError(401, "Invalid Google credential.");
  }

  if (!payload) {
    throw new ApiError(401, "Invalid Google credential.");
  }

  const googleId = payload.sub;
  const email = payload.email?.trim().toLowerCase();
  const name = payload.name?.trim();
  const imageUrl = payload.picture ?? null;

  if (!googleId || !email) {
    throw new ApiError(
      400,
      "Google account did not provide the required information.",
    );
  }

  let user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (user) {
    if (user.googleId !== googleId || user.imageUrl !== imageUrl) {
      user = await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          googleId,
          imageUrl,
          ...(name ? { name } : {}),
        },
      });
    }
  } else {
    user = await prisma.user.create({
      data: {
        name: name || "User",
        email,
        googleId,
        imageUrl,
      },
    });
  }

  return createAuthSession(sanitizeUser(user));
}

export async function refreshSession(refreshToken: string): Promise<{
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}> {
  const tokenHash = hashRefreshToken(refreshToken);

  return prisma.$transaction(async (tx) => {
    const storedToken = await tx.refreshToken.findUnique({
      where: {
        tokenHash,
      },
      include: {
        user: true,
      },
    });

    if (
      !storedToken ||
      storedToken.revokedAt !== null ||
      storedToken.expiresAt <= new Date()
    ) {
      throw new ApiError(401, "Invalid or expired refresh token.");
    }

    const revoked = await tx.refreshToken.updateMany({
      where: {
        id: storedToken.id,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    if (revoked.count !== 1) {
      throw new ApiError(401, "Invalid or expired refresh token.");
    }

    const user = sanitizeUser(storedToken.user);
    const accessToken = createAccessToken(user);
    const newRefreshToken = generateRefreshToken();

    await tx.refreshToken.create({
      data: {
        tokenHash: hashRefreshToken(newRefreshToken),
        userId: user.id,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    return {
      user,
      accessToken,
      refreshToken: newRefreshToken,
    };
  });
}

export async function revokeRefreshToken(refreshToken: string): Promise<void> {
  const tokenHash = hashRefreshToken(refreshToken);

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

export async function getUserById(userId: string): Promise<AuthUser> {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  return sanitizeUser(user);
}
