import prisma from "../config/database.js";
import { NotFoundError } from "../utils/errors.js";
import { paginate, paginationMeta } from "../utils/response.js";

interface UpdateUserInput {
  username?: string;
  email?: string;
}

export class UserService {
  /**
   * Get user by ID
   */
  async getById(userId: number) {
    const user = await prisma.appUser.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: true,
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
      roles: user.userRoles.map((ur) => ur.role.name),
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
          userRoles: {
            include: {
              role: true,
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
      roles: user.userRoles.map((ur) => ur.role.name),
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
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      roles: user.userRoles.map((ur) => ur.role.name),
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
   * Assign role to user
   */
  async assignRole(userId: number, roleId: number) {
    await prisma.userRole.create({
      data: {
        userId,
        roleId,
      },
    });

    return { message: "Role assigned successfully" };
  }

  /**
   * Remove role from user
   */
  async removeRole(userId: number, roleId: number) {
    await prisma.userRole.deleteMany({
      where: {
        userId,
        roleId,
      },
    });

    return { message: "Role removed successfully" };
  }

  /**
   * Get user's enrolled courses progress
   */
  async getUserProgress(userId: number) {
    const progress = await prisma.userAccess.findMany({
      where: { userId },
      include: {
        lesson: {
          include: {
            course: true,
          },
        },
      },
    });

    // Group by course
    const courseProgress = progress.reduce((acc, access) => {
      const courseId = access.lesson.courseId;
      if (!acc[courseId]) {
        acc[courseId] = {
          courseId,
          courseName: access.lesson.course.name,
          completedLessons: 0,
          totalWatchedSeconds: 0,
        };
      }
      if (access.isCompleted) {
        acc[courseId].completedLessons++;
      }
      acc[courseId].totalWatchedSeconds += access.watchedSeconds;
      return acc;
    }, {} as Record<number, { courseId: number; courseName: string | null; completedLessons: number; totalWatchedSeconds: number }>);

    return Object.values(courseProgress);
  }
}

export const userService = new UserService();
