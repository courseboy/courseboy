import prisma from "../config/database.js";
import { NotFoundError, ForbiddenError } from "../utils/errors.js";
import { paginate, paginationMeta } from "../utils/response.js";

interface CreateCourseInput {
  name: string;
  description?: string;
  coverImg?: string;
  requiredPrivilegeId?: number;
  certificateTemplateUrl?: string;
}

interface UpdateCourseInput extends Partial<CreateCourseInput> {
  isPublished?: boolean;
}

interface CreateCategoryInput {
  name: string;
  orderIndex?: number;
}

interface UpdateCategoryInput {
  name?: string;
  orderIndex?: number;
}

export class CourseService {
  /**
   * Get all courses (admin) - including unpublished
   */
  async getAllForAdmin(page: number = 1, limit: number = 10) {
    const { skip, take } = paginate(page, limit);

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          requiredPrivilege: true,
          courseCategories: {
            orderBy: { orderIndex: "asc" },
            include: {
              lessons: {
                orderBy: { orderIndex: "asc" },
              },
              quizzes: {
                orderBy: { id: "asc" },
              },
            },
          },
          _count: {
            select: {
              lessons: true,
              courseFeedbacks: true,
            },
          },
        },
      }),
      prisma.course.count(),
    ]);

    // Calculate total duration for each course
    const formattedCourses = courses.map((course) => {
      const totalDuration = course.courseCategories.reduce((sum, cat) => {
        return (
          sum +
          cat.lessons.reduce((lessonSum, lesson) => {
            return lessonSum + (lesson.durationSeconds || 0);
          }, 0)
        );
      }, 0);

      return {
        id: course.id,
        name: course.name,
        description: course.description,
        coverImg: course.coverImg,
        isPublished: course.isPublished,
        requiredPrivilege: course.requiredPrivilege?.name,
        requiredPrivilegeId: course.requiredPrivilegeId,
        lessonsCount: course._count.lessons,
        categoriesCount: course.courseCategories.length,
        totalDurationSeconds: totalDuration,
        categories: course.courseCategories.map((cat) => ({
          id: cat.id,
          name: cat.name,
          orderIndex: cat.orderIndex,
          lessonsCount: cat.lessons.length,
          lessons: cat.lessons.map((lesson) => ({
            id: lesson.id,
            title: lesson.title,
            videoUrl: lesson.videoUrl,
            durationSeconds: lesson.durationSeconds,
            isFreePreview: lesson.isFreePreview,
            orderIndex: lesson.orderIndex,
          })),
          quizzes: cat.quizzes.map((quiz) => ({
            id: quiz.id,
            name: quiz.name,
            description: quiz.description,
            passingScore: quiz.passingScore,
            timeLimit: quiz.timeLimit,
          })),
        })),
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
      };
    });

    return {
      data: formattedCourses,
      meta: paginationMeta(total, page, limit),
    };
  }

  /**
   * Create category for a course (admin)
   */
  async createCategory(courseId: number, input: CreateCategoryInput) {
    // Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundError("Course not found");
    }

    // Get next order index if not provided
    let orderIndex = input.orderIndex;
    if (orderIndex === undefined) {
      const lastCategory = await prisma.courseCategory.findFirst({
        where: { courseId },
        orderBy: { orderIndex: "desc" },
      });
      orderIndex = (lastCategory?.orderIndex ?? 0) + 1;
    }

    const category = await prisma.courseCategory.create({
      data: {
        courseId,
        name: input.name,
        orderIndex,
      },
    });

    return category;
  }

  /**
   * Update category (admin)
   */
  async updateCategory(categoryId: number, input: UpdateCategoryInput) {
    const category = await prisma.courseCategory.update({
      where: { id: categoryId },
      data: input,
    });

    return category;
  }

  /**
   * Delete category (admin)
   */
  async deleteCategory(categoryId: number) {
    await prisma.courseCategory.delete({
      where: { id: categoryId },
    });

    return { message: "Category deleted successfully" };
  }

  /**
   * Reorder categories (admin)
   */
  async reorderCategories(courseId: number, categoryIds: number[]) {
    // Update order index for each category
    await Promise.all(
      categoryIds.map((id, index) =>
        prisma.courseCategory.update({
          where: { id },
          data: { orderIndex: index + 1 },
        })
      )
    );

    return { message: "Categories reordered successfully" };
  }

  /**
   * Reorder lessons in a category (admin)
   */
  async reorderLessons(categoryId: number, lessonIds: number[]) {
    // Update order index for each lesson
    await Promise.all(
      lessonIds.map((id, index) =>
        prisma.lesson.update({
          where: { id },
          data: { orderIndex: index + 1 },
        })
      )
    );

    return { message: "Lessons reordered successfully" };
  }

  /**
   * Get all published courses
   */
  async getPublishedCourses(page: number = 1, limit: number = 10) {
    const { skip, take } = paginate(page, limit);

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where: { isPublished: true },
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          requiredPrivilege: true,
          _count: {
            select: {
              lessons: true,
              courseFeedbacks: true,
            },
          },
        },
      }),
      prisma.course.count({ where: { isPublished: true } }),
    ]);

    // Get average ratings
    const courseIds = courses.map((c) => c.id);
    const ratings = await prisma.courseFeedback.groupBy({
      by: ["courseId"],
      where: { courseId: { in: courseIds } },
      _avg: { rating: true },
    });

    const ratingsMap = ratings.reduce((acc, r) => {
      acc[r.courseId] = r._avg.rating || 0;
      return acc;
    }, {} as Record<number, number>);

    const formattedCourses = courses.map((course) => ({
      id: course.id,
      name: course.name,
      description: course.description,
      coverImg: course.coverImg,
      requiredPrivilege: course.requiredPrivilege?.name,
      lessonsCount: course._count.lessons,
      feedbacksCount: course._count.courseFeedbacks,
      averageRating: ratingsMap[course.id] || 0,
      createdAt: course.createdAt,
    }));

    return {
      data: formattedCourses,
      meta: paginationMeta(total, page, limit),
    };
  }

  /**
   * Get course by ID with full details
   */
  async getById(courseId: number, userId?: number, userPrivileges?: string[]) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        requiredPrivilege: true,
        courseCategories: {
          orderBy: { orderIndex: "asc" },
          include: {
            lessons: {
              orderBy: { orderIndex: "asc" },
            },
            quizzes: true,
          },
        },
        _count: {
          select: {
            courseFeedbacks: true,
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundError("Course not found");
    }

    // Check access
    const hasAccess = this.checkCourseAccess(course, userPrivileges);

    // Get average rating
    const avgRating = await prisma.courseFeedback.aggregate({
      where: { courseId },
      _avg: { rating: true },
    });

    // Get user progress if logged in
    let userProgress = null;
    if (userId) {
      const accesses = await prisma.userAccess.findMany({
        where: {
          userId,
          lesson: { courseId },
        },
      });

      const totalLessons = course.courseCategories.reduce(
        (sum, cat) => sum + cat.lessons.length,
        0
      );
      const completedLessons = accesses.filter((a) => a.isCompleted).length;

      userProgress = {
        completedLessons,
        totalLessons,
        percentage:
          totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0,
      };
    }

    // Get user's quiz submissions if logged in
    let quizSubmissions: Record<
      number,
      {
        isCompleted: boolean;
        score: number;
        maxScore: number;
        percentage: number;
        passed: boolean;
      }
    > = {};
    if (userId) {
      const submissions = await prisma.quizSubmission.findMany({
        where: {
          userId,
          quiz: {
            courseCategory: {
              courseId,
            },
          },
        },
        select: {
          quizId: true,
          score: true,
          maxScore: true,
          percentage: true,
          passed: true,
        },
      });
      quizSubmissions = submissions.reduce((acc, sub) => {
        acc[sub.quizId] = {
          isCompleted: true,
          score: sub.score,
          maxScore: sub.maxScore,
          percentage: sub.percentage,
          passed: sub.passed,
        };
        return acc;
      }, {} as Record<number, { isCompleted: boolean; score: number; maxScore: number; percentage: number; passed: boolean }>);
    }

    return {
      id: course.id,
      name: course.name,
      description: course.description,
      coverImg: course.coverImg,
      isPublished: course.isPublished,
      requiredPrivilege: course.requiredPrivilege?.name,
      certificateTemplateUrl: course.certificateTemplateUrl,
      averageRating: avgRating._avg.rating || 0,
      feedbacksCount: course._count.courseFeedbacks,
      hasAccess,
      userProgress,
      categories: course.courseCategories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        orderIndex: cat.orderIndex,
        lessons: cat.lessons.map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          durationSeconds: lesson.durationSeconds,
          isFreePreview: lesson.isFreePreview,
          orderIndex: lesson.orderIndex,
          // Only show video URL if user has access or it's a free preview
          videoUrl: hasAccess || lesson.isFreePreview ? lesson.videoUrl : null,
        })),
        quizzes: cat.quizzes.map((quiz) => {
          const submission = quizSubmissions[quiz.id];
          return {
            id: quiz.id,
            name: quiz.name,
            description: quiz.description,
            passingScore: quiz.passingScore,
            timeLimit: quiz.timeLimit,
            isCompleted: submission?.isCompleted || false,
            hasPassed: submission?.passed || false,
            userSubmission: submission
              ? {
                  score: submission.score,
                  maxScore: submission.maxScore,
                  percentage: submission.percentage,
                  passed: submission.passed,
                }
              : null,
          };
        }),
      })),
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    };
  }

  /**
   * Create course (admin only)
   */
  async create(input: CreateCourseInput) {
    const course = await prisma.course.create({
      data: {
        ...input,
        isPublished: false,
      },
    });

    return course;
  }

  /**
   * Update course (admin only)
   */
  async update(courseId: number, input: UpdateCourseInput) {
    const course = await prisma.course.update({
      where: { id: courseId },
      data: input,
    });

    return course;
  }

  /**
   * Delete course (admin only)
   */
  async delete(courseId: number) {
    await prisma.course.delete({
      where: { id: courseId },
    });

    return { message: "Course deleted successfully" };
  }

  /**
   * Check if user has access to course based on privileges
   */
  private checkCourseAccess(
    course: { requiredPrivilege: { name: string } | null },
    userPrivileges?: string[]
  ): boolean {
    // No privilege required = public course
    if (!course.requiredPrivilege) {
      return true;
    }

    // Admin always has access
    if (userPrivileges?.includes("Admin")) {
      return true;
    }

    // Check if user has required privilege
    if (!userPrivileges) {
      return false;
    }

    // Privilege hierarchy: SuperVIP > VIP > Member
    const privilegeHierarchy: Record<string, number> = {
      Member: 1,
      VIP: 2,
      SuperVIP: 3,
      Admin: 4,
    };

    const requiredLevel =
      privilegeHierarchy[course.requiredPrivilege.name] || 0;
    const userMaxLevel = Math.max(
      ...userPrivileges.map((privilege) => privilegeHierarchy[privilege] || 0)
    );

    return userMaxLevel >= requiredLevel;
  }
}

export const courseService = new CourseService();
