import { Router } from "express";
import {
  register,
  login,
  googleLogin,
  me,
} from "../modules/auth/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { validateBody as validate } from "../middleware/validate.middleware";
import {
  registerSchema,
  loginSchema,
  googleLoginSchema,
} from "../modules/auth/auth.validation.js";

const router = Router();

router.post("/register", validate(registerSchema), register);

router.post("/login", validate(loginSchema), login);

router.post("/google", validate(googleLoginSchema), googleLogin);

router.get("/me", requireAuth, me);

export default router;
