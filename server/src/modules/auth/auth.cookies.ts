import type { Response } from "express";

import {
  ACCESS_TOKEN_COOKIE_NAME,
  API_PREFIX,
  REFRESH_TOKEN_COOKIE_NAME,
} from "../../config/constants.js";
import { env } from "../../config/env.js";

const isProduction = env.NODE_ENV === "production";

const accessCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? ("none" as const) : ("lax" as const),
  path: API_PREFIX,
  maxAge: 60 * 60 * 1000,
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? ("none" as const) : ("lax" as const),
  path: `${API_PREFIX}/auth`,
  maxAge: env.REFRESH_TOKEN_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000,
};

export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
): void {
  res.cookie(ACCESS_TOKEN_COOKIE_NAME, accessToken, accessCookieOptions);

  res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, refreshCookieOptions);
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie(ACCESS_TOKEN_COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? ("none" as const) : ("lax" as const),
    path: API_PREFIX,
  });

  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? ("none" as const) : ("lax" as const),
    path: `${API_PREFIX}/auth`,
  });
}
