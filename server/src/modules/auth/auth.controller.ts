import { Request, Response } from "express";
import {
  registerUser,
  loginUser,
  loginWithGoogle,
  getUserById,
} from "./auth.service.js";

export async function register(req: Request, res: Response): Promise<void> {
  const { name, email, password } = req.body;

  const result = await registerUser(name, email, password);

  res.status(201).json({
    success: true,
    data: result,
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  const result = await loginUser(email, password);

  res.status(200).json({
    success: true,
    data: result,
  });
}

export async function googleLogin(req: Request, res: Response): Promise<void> {
  const { credential } = req.body;

  const result = await loginWithGoogle(credential);

  res.status(200).json({
    success: true,
    data: result,
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
