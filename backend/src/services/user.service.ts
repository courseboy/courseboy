import prisma from "../config/database.js";
import bcrypt from "bcryptjs";
import { config } from "../config/index.js";
import { NotFoundError, ConflictError } from "../utils/errors.js";
import { paginate, paginationMeta } from "../utils/response.js";

interface UpdateUserInput {
  username?: string;
  email?: string;
}

interface CreateUserInput {
  email: string;
  username?: string;
  password: string;
  privilegeIds?: number[];
}

export class UserService {
  /**
   * Create a new user (Admin only)
   */
  async create(input: CreateUserInput) {
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
          username: input.username || null,
        },
      });

      // Create user secret
      await tx.userSecret.create({
        data: {
          userId: newUser.id,
          passwordHash,
        },
      });

      // Assign privileges if provided, otherwise assign Member
      const privilegeIdsToAssign = input.privilegeIds?.length
        ? input.privilegeIds
        : [];

      // If no privileges specified, assign Member by default
      if (privilegeIdsToAssign.length === 0) {
        const memberPrivilege = await tx.privilege.findUnique({
          where: { name: "Member" },
        });
        if (memberPrivilege) {
          privilegeIdsToAssign.push(memberPrivilege.id);
        }
      }

      // Assign all privileges
      for (const privilegeId of privilegeIdsToAssign) {
        await tx.userPrivilege.create({
          data: {
            userId: newUser.id,
            privilegeId,
          },
        });
      }

      return newUser;
    });

    // Fetch user with privileges
    return this.getById(user.id);
  }

  /**
   * Get user by ID
   */
  async getById(userId: number) {
    const user = await prisma.appUser.findUnique({
      where: { id: userId },
      include: {
        userPrivileges: {
          include: {
            privilege: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      isActive: user.isActive,
      privileges: user.userPrivileges.map((up) => up.privilege.name),
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    };
  }

  /**
   * Get all users (admin only)
   */
  async getAll(page: number = 1, limit: number = 10) {
    const { skip, take } = paginate(page, limit);

    const [users, total] = await Promise.all([
      prisma.appUser.findMany({
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          userPrivileges: {
            include: {
              privilege: true,
            },
          },
        },
      }),
      prisma.appUser.count(),
    ]);

    const formattedUsers = users.map((user) => ({
      id: user.id,
      email: user.email,
      username: user.username,
      isActive: user.isActive,
      privileges: user.userPrivileges.map((up) => up.privilege.name),
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    }));

    return {
      data: formattedUsers,
      meta: paginationMeta(total, page, limit),
    };
  }

  /**
   * Update user
   */
  async update(userId: number, input: UpdateUserInput) {
    const user = await prisma.appUser.update({
      where: { id: userId },
      data: input,
      include: {
        userPrivileges: {
          include: {
            privilege: true,
          },
        },
      },
    });

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      privileges: user.userPrivileges.map((up) => up.privilege.name),
    };
  }

  /**
   * Deactivate user (soft delete)
   */
  async deactivate(userId: number) {
    await prisma.appUser.update({
      where: { id: userId },
      data: { isActive: false },
    });

    return { message: "User deactivated successfully" };
  }

  /**
   * Activate user
   */
  async activate(userId: number) {
    await prisma.appUser.update({
      where: { id: userId },
      data: { isActive: true },
    });

    return { message: "User activated successfully" };
  }

  /**
   * Assign privilege to user
   */
  async assignPrivilege(userId: number, privilegeId: number) {
    await prisma.userPrivilege.create({
      data: {
        userId,
        privilegeId,
      },
    });

    return { message: "Privilege assigned successfully" };
  }

  /**
   * Remove privilege from user
   */
  async removePrivilege(userId: number, privilegeId: number) {
    await prisma.userPrivilege.deleteMany({
      where: {
        userId,
        privilegeId,
      },
    });

    return { message: "Privilege removed successfully" };
  }

  /**
   * Get user's courses based on their privileges and progress
   */
  async getUserProgress(userId: number) {
    // Get user's privileges
    const userPrivileges = await prisma.userPrivilege.findMany({
      where: { userId },
      include: { privilege: true },
    });

    const privilegeIds = userPrivileges.map((up) => up.privilegeId);

    // Get all courses the user has access to (via privileges or no privilege required)
    const accessibleCourses = await prisma.course.findMany({
      where: {
        isPublished: true,
        OR: [
          { requiredPrivilegeId: null }, // No privilege required
          { requiredPrivilegeId: { in: privilegeIds } }, // User has required privilege
        ],
      },
      include: {
        _count: {
          select: { lessons: true },
        },
      },
    });

    // Get user's watch progress for all lessons
    const userAccess = await prisma.userAccess.findMany({
      where: { userId },
      include: {
        lesson: true,
      },
    });

    // Group progress by course
    const progressByCourse = userAccess.reduce((acc, access) => {
      const courseId = access.lesson.courseId;
      if (!acc[courseId]) {
        acc[courseId] = {
          completedLessons: 0,
          totalWatchedSeconds: 0,
        };
      }
      if (access.isCompleted) {
        acc[courseId].completedLessons++;
      }
      acc[courseId].totalWatchedSeconds += access.watchedSeconds;
      return acc;
    }, {} as Record<number, { completedLessons: number; totalWatchedSeconds: number }>);

    // Combine course info with progress
    const result = accessibleCourses.map((course) => {
      const progress = progressByCourse[course.id] || {
        completedLessons: 0,
        totalWatchedSeconds: 0,
      };
      const totalLessons = course._count.lessons;
      const percentage =
        totalLessons > 0
          ? Math.round((progress.completedLessons / totalLessons) * 100)
          : 0;

      return {
        courseId: course.id,
        courseName: course.name,
        coverImg: course.coverImg,
        description: course.description,
        completedLessons: progress.completedLessons,
        totalLessons,
        totalWatchedSeconds: progress.totalWatchedSeconds,
        percentage,
        isNew: progress.completedLessons === 0,
      };
    });

    return result;
  }

  /**
   * Get all privileges
   */
  async getAllPrivileges() {
    const privileges = await prisma.privilege.findMany({
      orderBy: { name: "asc" },
    });

    return privileges;
  }

  /**
   * Update user privileges (replace all)
   */
  async updateUserPrivileges(userId: number, privilegeIds: number[]) {
    // First, remove all existing privileges
    await prisma.userPrivilege.deleteMany({
      where: { userId },
    });

    // Then add new privileges
    for (const privilegeId of privilegeIds) {
      await prisma.userPrivilege.create({
        data: {
          userId,
          privilegeId,
        },
      });
    }

    return this.getById(userId);
  }

  /**
   * Update user by admin
   */
  async adminUpdate(
    userId: number,
    input: { username?: string; email?: string; isActive?: boolean }
  ) {
    const user = await prisma.appUser.update({
      where: { id: userId },
      data: input,
    });

    return this.getById(user.id);
  }
}

export const userService = new UserService();
