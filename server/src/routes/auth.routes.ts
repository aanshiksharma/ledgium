import { Router } from "express";

import {
  register,
  login,
  googleLogin,
  me,
  refresh,
  logout,
} from "../modules/auth/auth.controller.js";

import { requireAuth } from "../middleware/auth.middleware.js";
import { validateBody as validate } from "../middleware/validate.middleware.js";

import {
  registerSchema,
  loginSchema,
  googleLoginSchema,
} from "../modules/auth/auth.validation.js";

const router = Router();

router.post("/register", validate(registerSchema), register);

router.post("/login", validate(loginSchema), login);

router.post("/google", validate(googleLoginSchema), googleLogin);

router.post("/refresh", refresh);

router.post("/logout", logout);

router.get("/me", requireAuth, me);

export default router;
