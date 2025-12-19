import prisma from "../config/database.js";
import { NotFoundError, ForbiddenError } from "../utils/errors.js";

interface UpdateProgressInput {
  watchedSeconds: number;
  isCompleted?: boolean;
}

export class LessonService {
  /**
   * Get lesson by ID
   */
  async getById(lessonId: number, userId?: number, userRoles?: string[]) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: {
          include: {
            requiredRole: true,
          },
        },
        courseCategory: true,
      },
    });

    if (!lesson) {
      throw new NotFoundError("Lesson not found");
    }

    // Check access
    const hasAccess = this.checkLessonAccess(lesson, userRoles);

    if (!hasAccess && !lesson.isFreePreview) {
      throw new ForbiddenError("You do not have access to this lesson");
    }

    // Get user progress if logged in
    let userProgress = null;
    if (userId) {
      const access = await prisma.userAccess.findUnique({
        where: {
          userId_lessonId: {
            userId,
            lessonId,
          },
        },
      });

      if (access) {
        userProgress = {
          watchedSeconds: access.watchedSeconds,
          isCompleted: access.isCompleted,
          lastAccessAt: access.lastAccessAt,
        };
      }
    }

    // Update global last watch date
    await prisma.lesson.update({
      where: { id: lessonId },
      data: { lastWatchDate: new Date() },
    });

    return {
      id: lesson.id,
      title: lesson.title,
      videoUrl: lesson.videoUrl,
      durationSeconds: lesson.durationSeconds,
      isFreePreview: lesson.isFreePreview,
      orderIndex: lesson.orderIndex,
      courseName: lesson.course.name,
      categoryName: lesson.courseCategory?.name,
      userProgress,
    };
  }

  /**
   * Update lesson progress
   */
  async updateProgress(
    lessonId: number,
    userId: number,
    input: UpdateProgressInput
  ) {
    // Verify lesson exists
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundError("Lesson not found");
    }

    // Upsert user access
    const access = await prisma.userAccess.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      update: {
        watchedSeconds: input.watchedSeconds,
        isCompleted: input.isCompleted ?? false,
        lastAccessAt: new Date(),
      },
      create: {
        userId,
        lessonId,
        watchedSeconds: input.watchedSeconds,
        isCompleted: input.isCompleted ?? false,
      },
    });

    return {
      lessonId: access.lessonId,
      watchedSeconds: access.watchedSeconds,
      isCompleted: access.isCompleted,
      lastAccessAt: access.lastAccessAt,
    };
  }

  /**
   * Get lessons by course category
   */
  async getByCategoryId(categoryId: number) {
    const lessons = await prisma.lesson.findMany({
      where: { courseCategoryId: categoryId },
      orderBy: { orderIndex: "asc" },
    });

    return lessons;
  }

  /**
   * Create lesson (admin only)
   */
  async create(
    courseId: number,
    categoryId: number,
    data: {
      title: string;
      videoUrl?: string;
      durationSeconds?: number;
      isFreePreview?: boolean;
    }
  ) {
    // Get next order index
    const lastLesson = await prisma.lesson.findFirst({
      where: { courseCategoryId: categoryId },
      orderBy: { orderIndex: "desc" },
    });

    const lesson = await prisma.lesson.create({
      data: {
        courseId,
        courseCategoryId: categoryId,
        title: data.title,
        videoUrl: data.videoUrl,
        durationSeconds: data.durationSeconds,
        isFreePreview: data.isFreePreview ?? false,
        orderIndex: (lastLesson?.orderIndex ?? 0) + 1,
      },
    });

    return lesson;
  }

  /**
   * Update lesson (admin only)
   */
  async update(
    lessonId: number,
    data: {
      title?: string;
      videoUrl?: string;
      durationSeconds?: number;
      isFreePreview?: boolean;
      orderIndex?: number;
    }
  ) {
    const lesson = await prisma.lesson.update({
      where: { id: lessonId },
      data,
    });

    return lesson;
  }

  /**
   * Delete lesson (admin only)
   */
  async delete(lessonId: number) {
    await prisma.lesson.delete({
      where: { id: lessonId },
    });

    return { message: "Lesson deleted successfully" };
  }

  /**
   * Check if user has access to lesson
   */
  private checkLessonAccess(
    lesson: {
      isFreePreview: boolean;
      course: { requiredRole: { name: string } | null };
    },
    userRoles?: string[]
  ): boolean {
    // Free preview always accessible
    if (lesson.isFreePreview) {
      return true;
    }

    // No role required
    if (!lesson.course.requiredRole) {
      return true;
    }

    // Admin always has access
    if (userRoles?.includes("Admin")) {
      return true;
    }

    if (!userRoles) {
      return false;
    }

    // Role hierarchy check
    const roleHierarchy: Record<string, number> = {
      Member: 1,
      VIP: 2,
      SuperVIP: 3,
      Admin: 4,
    };

    const requiredLevel = roleHierarchy[lesson.course.requiredRole.name] || 0;
    const userMaxLevel = Math.max(
      ...userRoles.map((role) => roleHierarchy[role] || 0)
    );

    return userMaxLevel >= requiredLevel;
  }
}

export const lessonService = new LessonService();
