import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import { ACCESS_TOKEN_COOKIE_NAME } from "../config/constants.js";

interface JwtPayload {
  sub: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const token = req.cookies?.[ACCESS_TOKEN_COOKIE_NAME];

  if (!token) {
    res.status(401).json({
      success: false,
      error: "Authentication required.",
    });

    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    if (!decoded.sub || !decoded.email) {
      throw new Error("Invalid token payload.");
    }

    req.user = {
      id: decoded.sub,
      email: decoded.email,
    };

    next();
  } catch {
    res.status(401).json({
      success: false,
      error: "Invalid or expired authentication token.",
    });
  }
}
