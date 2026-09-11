import { Request, Response } from "express";

import {
  registerUser,
  loginUser,
  loginWithGoogle,
  getUserById,
  refreshSession,
  revokeRefreshToken,
} from "./auth.service.js";

import { setAuthCookies, clearAuthCookies } from "./auth.cookies.js";

import { REFRESH_TOKEN_COOKIE_NAME } from "../../config/constants.js";

export async function register(req: Request, res: Response): Promise<void> {
  const { name, email, password } = req.body;

  const result = await registerUser(name, email, password);

  setAuthCookies(res, result.accessToken, result.refreshToken);

  res.status(201).json({
    success: true,
    data: {
      user: result.user,
    },
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  const result = await loginUser(email, password);

  setAuthCookies(res, result.accessToken, result.refreshToken);

  res.status(200).json({
    success: true,
    data: {
      user: result.user,
    },
  });
}

export async function googleLogin(req: Request, res: Response): Promise<void> {
  const { credential } = req.body;

  const result = await loginWithGoogle(credential);

  setAuthCookies(res, result.accessToken, result.refreshToken);

  res.status(200).json({
    success: true,
    data: {
      user: result.user,
    },
  });
}

export async function me(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: "Authentication required.",
    });

    return;
  }

  const user = await getUserById(req.user.id);

  res.status(200).json({
    success: true,
    data: {
      user,
    },
  });
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];

  if (!refreshToken) {
    res.status(401).json({
      success: false,
      error: "Refresh token required.",
    });

    return;
  }

  const result = await refreshSession(refreshToken);

  setAuthCookies(res, result.accessToken, result.refreshToken);

  res.status(200).json({
    success: true,
    data: {
      user: result.user,
    },
  });
}

export async function logout(req: Request, res: Response): Promise<void> {
  const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];

  if (refreshToken) {
    await revokeRefreshToken(refreshToken);
  }

  clearAuthCookies(res);

  res.status(200).json({
    success: true,
    data: null,
  });
}
