import rateLimit from "express-rate-limit";
import { config } from "../config/index.js";
import { sendError } from "../utils/response.js";

/**
 * General API rate limiter
 */
export const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: "Too many requests, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(res, "Too many requests, please try again later", 429);
  },
});

/**
 * Stricter rate limiter for auth endpoints
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: "Too many login attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (_req, res) => {
    sendError(res, "Too many login attempts, please try again later", 429);
  },
});

/**
 * Rate limiter for password reset
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts
  message: "Too many password reset attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(
      res,
      "Too many password reset attempts, please try again later",
      429
    );
  },
});
