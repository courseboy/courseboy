import { Router } from "express";
import {
  authController,
  registerSchema,
  loginSchema,
  changePasswordSchema,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.js";
import { validateZod } from "../middleware/validate.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = Router();

// Public routes
router.post(
  "/register",
  authLimiter,
  validateZod(registerSchema),
  authController.register
);

router.post(
  "/login",
  authLimiter,
  validateZod(loginSchema),
  authController.login
);

router.post("/refresh", authController.refreshToken);

// Protected routes
router.post("/logout", authenticate, authController.logout);

router.patch(
  "/change-password",
  authenticate,
  validateZod(changePasswordSchema),
  authController.changePassword
);

router.get("/me", authenticate, authController.me);

export default router;
