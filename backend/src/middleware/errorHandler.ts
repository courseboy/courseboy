import { Request, Response, NextFunction } from "express";
import { AppError, ValidationError } from "../utils/errors.js";
import { sendError } from "../utils/response.js";
import logger from "../config/logger.js";
import { config } from "../config/index.js";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  // Log the error
  logger.error(err.message, {
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Handle known errors
  if (err instanceof ValidationError) {
    return sendError(res, err.message, err.statusCode, err.errors);
  }

  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode);
  }

  // Handle Prisma errors
  if (err.name === "PrismaClientKnownRequestError") {
    const prismaError = err as { code: string; meta?: { target?: string[] } };

    if (prismaError.code === "P2002") {
      const field = prismaError.meta?.target?.[0] || "field";
      return sendError(res, `${field} already exists`, 409);
    }

    if (prismaError.code === "P2025") {
      return sendError(res, "Record not found", 404);
    }
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    return sendError(res, "Invalid token", 401);
  }

  if (err.name === "TokenExpiredError") {
    return sendError(res, "Token expired", 401);
  }

  // Default error response
  const message = config.isDevelopment ? err.message : "Something went wrong";

  return sendError(res, message, 500);
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  return sendError(res, `Route ${req.originalUrl} not found`, 404);
};
