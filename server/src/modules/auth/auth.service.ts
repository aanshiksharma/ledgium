import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "../../db/prisma.js";
import { ApiError } from "../../utils/apiError.js";
import { env } from "../../config/env.js";
import { AuthUser, AuthResponse } from "./auth.types.js";
import jwt from "jsonwebtoken";
import { StringValue } from "ms";

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

function createToken(user: AuthUser): string {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as StringValue },
  );
}

function createAuthResponse(user: AuthUser): AuthResponse {
  return {
    user,
    token: createToken(user),
  };
}

export async function registerUser(
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
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

  const sanitizedUser = sanitizeUser(user);

  return createAuthResponse(sanitizedUser);
}

export async function loginUser(
  email: string,
  password: string,
): Promise<AuthResponse> {
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

  const sanitizedUser = sanitizeUser(user);

  return createAuthResponse(sanitizedUser);
}

export async function loginWithGoogle(
  credential: string,
): Promise<AuthResponse> {
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

  const sanitizedUser = sanitizeUser(user);

  return createAuthResponse(sanitizedUser);
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
