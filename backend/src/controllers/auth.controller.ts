import { Request, Response } from "express";
import { z } from "zod";
import { authService } from "../services/auth.service.js";
import { sendSuccess, sendCreated } from "../utils/response.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { config } from "../config/index.js";

// Validation schemas
export const registerSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain uppercase, lowercase, and number"
      ),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain uppercase, lowercase, and number"
      ),
  }),
});

// Cookie options
const cookieOptions = {
  httpOnly: true,
  secure: config.isProduction,
  sameSite: config.isProduction ? ("none" as const) : ("lax" as const),
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/",
};

export const authController = {
  /**
   * Register new user
   */
  register: asyncHandler(async (req: Request, res: Response) => {
    const { email, username, password } = req.body;

    const result = await authService.register({ email, username, password });

    // Set cookies
    res.cookie("accessToken", result.accessToken, cookieOptions);
    res.cookie("refreshToken", result.refreshToken, {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    sendCreated(res, result, "Registration successful");
  }),

  /**
   * Login user
   */
  login: asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const result = await authService.login({ email, password });

    // Set cookies
    res.cookie("accessToken", result.accessToken, cookieOptions);
    res.cookie("refreshToken", result.refreshToken, {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    sendSuccess(res, result, "Login successful");
  }),

  /**
   * Logout user
   */
  logout: asyncHandler(async (_req: Request, res: Response) => {
    // Clear cookies with same options as when they were set
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: config.isProduction ? ("none" as const) : ("lax" as const),
      path: "/",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: config.isProduction ? ("none" as const) : ("lax" as const),
      path: "/",
    });

    sendSuccess(res, null, "Logout successful");
  }),

  /**
   * Refresh access token
   */
  refreshToken: asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    const tokens = await authService.refreshToken(refreshToken);

    // Set new cookies
    res.cookie("accessToken", tokens.accessToken, cookieOptions);
    res.cookie("refreshToken", tokens.refreshToken, {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    sendSuccess(res, tokens, "Token refreshed");
  }),

  /**
   * Change password
   */
  changePassword: asyncHandler(async (req: Request, res: Response) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user!.userId;

    const result = await authService.changePassword(
      userId,
      oldPassword,
      newPassword
    );

    sendSuccess(res, result);
  }),

  /**
   * Get current user
   */
  me: asyncHandler(async (req: Request, res: Response) => {
    sendSuccess(res, req.user);
  }),
};
