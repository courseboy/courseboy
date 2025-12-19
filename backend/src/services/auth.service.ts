import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/database.js";
import { config } from "../config/index.js";
import {
  UnauthorizedError,
  ConflictError,
  NotFoundError,
} from "../utils/errors.js";

interface RegisterInput {
  email: string;
  username: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface TokenPayload {
  userId: number;
  email: string;
  roles: string[];
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  /**
   * Register a new user
   */
  async register(input: RegisterInput) {
    // Check if user exists
    const existingUser = await prisma.appUser.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new ConflictError("Email already registered");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(input.password, config.bcryptRounds);

    // Create user with transaction
    const user = await prisma.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.appUser.create({
        data: {
          email: input.email,
          username: input.username,
        },
      });

      // Create user secret
      await tx.userSecret.create({
        data: {
          userId: newUser.id,
          passwordHash,
        },
      });

      // Assign default Member role
      const memberRole = await tx.role.findUnique({
        where: { name: "Member" },
      });

      if (memberRole) {
        await tx.userRole.create({
          data: {
            userId: newUser.id,
            roleId: memberRole.id,
          },
        });
      }

      return newUser;
    });

    // Generate tokens
    const tokens = this.generateTokens({
      userId: user.id,
      email: user.email,
      roles: ["Member"],
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      ...tokens,
    };
  }

  /**
   * Login user
   */
  async login(input: LoginInput) {
    // Find user with secret
    const user = await prisma.appUser.findUnique({
      where: { email: input.email },
      include: {
        userSecret: true,
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user || !user.userSecret?.passwordHash) {
      throw new UnauthorizedError("Invalid email or password");
    }

    if (!user.isActive) {
      throw new UnauthorizedError("Account is deactivated");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      input.password,
      user.userSecret.passwordHash
    );

    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Update last login
    await prisma.appUser.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Get roles
    const roles = user.userRoles.map((ur) => ur.role.name);

    // Generate tokens
    const tokens = this.generateTokens({
      userId: user.id,
      email: user.email,
      roles,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        roles,
      },
      ...tokens,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        config.jwt.refreshSecret
      ) as TokenPayload;

      // Verify user still exists and is active
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

      const roles = user.userRoles.map((ur) => ur.role.name);

      // Generate new tokens
      return this.generateTokens({
        userId: user.id,
        email: user.email,
        roles,
      });
    } catch (error) {
      throw new UnauthorizedError("Invalid refresh token");
    }
  }

  /**
   * Change password
   */
  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string
  ) {
    const userSecret = await prisma.userSecret.findUnique({
      where: { userId },
    });

    if (!userSecret?.passwordHash) {
      throw new NotFoundError("User not found");
    }

    // Verify old password
    const isValid = await bcrypt.compare(oldPassword, userSecret.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError("Current password is incorrect");
    }

    // Hash and update new password
    const newPasswordHash = await bcrypt.hash(newPassword, config.bcryptRounds);
    await prisma.userSecret.update({
      where: { userId },
      data: { passwordHash: newPasswordHash },
    });

    return { message: "Password changed successfully" };
  }

  /**
   * Generate JWT tokens
   */
  private generateTokens(payload: TokenPayload): AuthTokens {
    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    });

    return { accessToken, refreshToken };
  }
}

export const authService = new AuthService();
