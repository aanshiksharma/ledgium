import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

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
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      error: "Authentication required.",
    });

    return;
  }

  const token = authorization.slice(7);

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
