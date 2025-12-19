import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import prisma from "../config/database.js";
import { UnauthorizedError, ForbiddenError } from "../utils/errors.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export interface JwtPayload {
  userId: number;
  email: string;
  roles: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Middleware to verify JWT token and attach user to request
 */
export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    // Get token from header or cookie
    let token: string | undefined;

    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new UnauthorizedError("Access token required");
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

      // Check if user exists and is active
      const user = await prisma.appUser.findUnique({
        where: { id: decoded.userId },
        include: {
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedError("User not found or inactive");
      }

      // Attach user info to request
      req.user = {
        userId: user.id,
        email: user.email,
        roles: user.userRoles.map((ur) => ur.role.name),
      };

      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError("Invalid token");
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError("Token expired");
      }
      throw error;
    }
  }
);

/**
 * Middleware to check if user has required role(s)
 */
export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));

    if (!hasRole) {
      throw new ForbiddenError("Insufficient permissions");
    }

    next();
  };
};

/**
 * Optional authentication - doesn't throw if no token
 */
export const optionalAuth = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
        const user = await prisma.appUser.findUnique({
          where: { id: decoded.userId },
          include: {
            userRoles: {
              include: {
                role: true,
              },
            },
          },
        });

        if (user && user.isActive) {
          req.user = {
            userId: user.id,
            email: user.email,
            roles: user.userRoles.map((ur) => ur.role.name),
          };
        }
      } catch {
        // Token invalid, continue without user
      }
    }

    next();
  }
);
