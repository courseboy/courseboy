// Quiz Service - Custom Quiz System
import prisma from "../config/database.js";
import { NotFoundError, BadRequestError } from "../utils/errors.js";

interface CreateQuizInput {
  courseCategoryId: number;
  name: string;
  description?: string;
  passingScore?: number;
  timeLimit?: number | null;
}

interface UpdateQuizInput {
  name?: string;
  description?: string;
  passingScore?: number;
  timeLimit?: number | null;
}

interface CreateQuestionInput {
  quizId: number;
  questionText: string;
  questionType?: string;
  options: string[];
  correctAnswer: number;
  points?: number;
  orderIndex?: number;
}

interface UpdateQuestionInput {
  questionText?: string;
  questionType?: string;
  options?: string[];
  correctAnswer?: number;
  points?: number;
  orderIndex?: number;
}

interface SubmitQuizInput {
  answers: Record<number, number>; // { questionId: selectedOptionIndex }
  timeTaken?: number;
}

export class QuizService {
  /**
   * Create a quiz for a category
   */
  async create(input: CreateQuizInput) {
    // Verify category exists
    const category = await prisma.courseCategory.findUnique({
      where: { id: input.courseCategoryId },
    });

    if (!category) {
      throw new NotFoundError("Category not found");
    }

    const quiz = await prisma.quiz.create({
      data: {
        courseCategoryId: input.courseCategoryId,
        name: input.name,
        description: input.description,
        passingScore: input.passingScore ?? 70,
        timeLimit: input.timeLimit,
      },
    });

    return quiz;
  }

  /**
   * Get quiz by ID with questions
   */
  async getById(quizId: number, includeCorrectAnswers = false) {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        courseCategory: {
          include: {
            course: true,
          },
        },
        questions: {
          orderBy: { orderIndex: "asc" },
        },
        _count: {
          select: {
            quizSubmissions: true,
          },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundError("Quiz not found");
    }

    // If not including correct answers, remove them from questions
    if (!includeCorrectAnswers) {
      return {
        ...quiz,
        questions: quiz.questions.map(({ correctAnswer, ...q }) => q),
      };
    }

    return quiz;
  }

  /**
   * Get quiz for admin (includes correct answers)
   */
  async getByIdAdmin(quizId: number) {
    return this.getById(quizId, true);
  }

  /**
   * Update a quiz
   */
  async update(quizId: number, input: UpdateQuizInput) {
    const quiz = await prisma.quiz.update({
      where: { id: quizId },
      data: input,
    });

    return quiz;
  }

  /**
   * Delete a quiz
   */
  async delete(quizId: number) {
    await prisma.quiz.delete({
      where: { id: quizId },
    });

    return { success: true, message: "Quiz deleted successfully" };
  }

  /**
   * Get quizzes by category
   */
  async getByCategoryId(categoryId: number) {
    const quizzes = await prisma.quiz.findMany({
      where: { courseCategoryId: categoryId },
      include: {
        _count: {
          select: {
            questions: true,
            quizSubmissions: true,
          },
        },
      },
    });

    return quizzes;
  }

  // ============ Question Management ============

  /**
   * Add a question to a quiz
   */
  async createQuestion(input: CreateQuestionInput) {
    // Verify quiz exists
    const quiz = await prisma.quiz.findUnique({
      where: { id: input.quizId },
    });

    if (!quiz) {
      throw new NotFoundError("Quiz not found");
    }

    // Validate options array
    if (!input.options || input.options.length < 2) {
      throw new BadRequestError("At least 2 options are required");
    }

    // Validate correct answer index
    if (
      input.correctAnswer < 0 ||
      input.correctAnswer >= input.options.length
    ) {
      throw new BadRequestError("Correct answer index is out of range");
    }

    // Get max order index for this quiz
    const maxOrderIndex = await prisma.quizQuestion.aggregate({
      where: { quizId: input.quizId },
      _max: { orderIndex: true },
    });

    const question = await prisma.quizQuestion.create({
      data: {
        quizId: input.quizId,
        questionText: input.questionText,
        questionType: input.questionType ?? "multiple_choice",
        options: input.options,
        correctAnswer: input.correctAnswer,
        points: input.points ?? 1,
        orderIndex:
          input.orderIndex ?? (maxOrderIndex._max.orderIndex ?? 0) + 1,
      },
    });

    return question;
  }

  /**
   * Update a question
   */
  async updateQuestion(questionId: number, input: UpdateQuestionInput) {
    const existingQuestion = await prisma.quizQuestion.findUnique({
      where: { id: questionId },
    });

    if (!existingQuestion) {
      throw new NotFoundError("Question not found");
    }

    // If options are being updated, validate correct answer
    if (input.options) {
      const correctAnswer =
        input.correctAnswer ?? existingQuestion.correctAnswer;
      if (correctAnswer < 0 || correctAnswer >= input.options.length) {
        throw new BadRequestError("Correct answer index is out of range");
      }
    }

    const question = await prisma.quizQuestion.update({
      where: { id: questionId },
      data: input,
    });

    return question;
  }

  /**
   * Delete a question
   */
  async deleteQuestion(questionId: number) {
    await prisma.quizQuestion.delete({
      where: { id: questionId },
    });

    return { success: true, message: "Question deleted successfully" };
  }

  /**
   * Reorder questions in a quiz
   */
  async reorderQuestions(quizId: number, questionIds: number[]) {
    const updates = questionIds.map((questionId, index) =>
      prisma.quizQuestion.update({
        where: { id: questionId },
        data: { orderIndex: index },
      })
    );

    await prisma.$transaction(updates);

    return { success: true, message: "Questions reordered successfully" };
  }

  // ============ Quiz Submissions ============

  /**
   * Submit quiz answers and calculate score
   */
  async submitQuiz(userId: number, quizId: number, input: SubmitQuizInput) {
    // Get quiz with questions
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: true,
      },
    });

    if (!quiz) {
      throw new NotFoundError("Quiz not found");
    }

    if (quiz.questions.length === 0) {
      throw new BadRequestError("Quiz has no questions");
    }

    // Calculate score
    let score = 0;
    let maxScore = 0;

    for (const question of quiz.questions) {
      maxScore += question.points;
      const userAnswer = input.answers[question.id];
      if (userAnswer === question.correctAnswer) {
        score += question.points;
      }
    }

    // Calculate percentage
    const percentage = Math.round((score / maxScore) * 100);
    const passed = percentage >= quiz.passingScore;

    // Check if already submitted
    const existingSubmission = await prisma.quizSubmission.findFirst({
      where: {
        userId,
        quizId,
      },
    });

    if (existingSubmission) {
      // Update existing submission if new score is higher
      if (score > existingSubmission.score) {
        const submission = await prisma.quizSubmission.update({
          where: { id: existingSubmission.id },
          data: {
            score,
            maxScore,
            percentage,
            passed,
            answers: input.answers,
            timeTaken: input.timeTaken,
            submittedAt: new Date(),
          },
        });

        return {
          submission,
          isNewRecord: true,
          questionsTotal: quiz.questions.length,
          questionsCorrect: quiz.questions.filter(
            (q) => input.answers[q.id] === q.correctAnswer
          ).length,
        };
      }

      return {
        submission: existingSubmission,
        isNewRecord: false,
        message: "Previous score was higher",
        questionsTotal: quiz.questions.length,
        questionsCorrect: quiz.questions.filter(
          (q) => input.answers[q.id] === q.correctAnswer
        ).length,
      };
    }

    // Create new submission
    const submission = await prisma.quizSubmission.create({
      data: {
        userId,
        quizId,
        score,
        maxScore,
        percentage,
        passed,
        answers: input.answers,
        timeTaken: input.timeTaken,
        submittedAt: new Date(),
      },
    });

    return {
      submission,
      isNewRecord: true,
      questionsTotal: quiz.questions.length,
      questionsCorrect: quiz.questions.filter(
        (q) => input.answers[q.id] === q.correctAnswer
      ).length,
    };
  }

  /**
   * Get user's quiz submissions for a course
   */
  async getUserSubmissions(userId: number, courseId: number) {
    const submissions = await prisma.quizSubmission.findMany({
      where: {
        userId,
        quiz: {
          courseCategory: {
            courseId,
          },
        },
      },
      include: {
        quiz: {
          select: {
            id: true,
            name: true,
            passingScore: true,
            courseCategoryId: true,
          },
        },
      },
    });

    return submissions;
  }

  /**
   * Check if user has completed a quiz
   */
  async hasCompleted(userId: number, quizId: number) {
    const submission = await prisma.quizSubmission.findFirst({
      where: {
        userId,
        quizId,
      },
    });

    return !!submission;
  }

  /**
   * Get quiz with user's submission status (for learn page)
   */
  async getQuizWithStatus(quizId: number, userId?: number) {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        courseCategory: {
          include: {
            course: true,
          },
        },
        questions: {
          orderBy: { orderIndex: "asc" },
          select: {
            id: true,
            questionText: true,
            questionType: true,
            options: true,
            points: true,
            orderIndex: true,
            // Note: correctAnswer NOT included for students
          },
        },
        _count: {
          select: {
            questions: true,
          },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundError("Quiz not found");
    }

    let userSubmission = null;
    if (userId) {
      userSubmission = await prisma.quizSubmission.findFirst({
        where: {
          userId,
          quizId,
        },
      });
    }

    return {
      ...quiz,
      userSubmission,
      isCompleted: !!userSubmission,
      hasPassed: userSubmission?.passed ?? false,
    };
  }

  /**
   * Get quiz results with correct answers (after submission)
   */
  async getQuizResults(userId: number, quizId: number) {
    const submission = await prisma.quizSubmission.findFirst({
      where: {
        userId,
        quizId,
      },
    });

    if (!submission) {
      throw new NotFoundError("No submission found for this quiz");
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundError("Quiz not found");
    }

    const userAnswers = submission.answers as Record<string, number>;

    // Add user's answer and whether it was correct to each question
    const questionsWithResults = quiz.questions.map((question) => ({
      ...question,
      userAnswer: userAnswers[question.id.toString()] ?? null,
      isCorrect: userAnswers[question.id.toString()] === question.correctAnswer,
    }));

    return {
      quiz: {
        id: quiz.id,
        name: quiz.name,
        description: quiz.description,
        passingScore: quiz.passingScore,
      },
      submission: {
        score: submission.score,
        maxScore: submission.maxScore,
        percentage: submission.percentage,
        passed: submission.passed,
        timeTaken: submission.timeTaken,
        submittedAt: submission.submittedAt,
      },
      questions: questionsWithResults,
    };
  }

  /**
   * Get all submissions for a quiz (admin)
   */
  async getQuizSubmissions(quizId: number) {
    const submissions = await prisma.quizSubmission.findMany({
      where: { quizId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
      orderBy: { submittedAt: "desc" },
    });

    return submissions;
  }

  /**
   * Get quiz analytics overview (admin)
   */
  async getAnalyticsOverview(courseId?: number, quizId?: number) {
    // Build where clause
    let whereClause = {};
    if (quizId) {
      whereClause = { quizId };
    } else if (courseId) {
      whereClause = {
        quiz: {
          courseCategory: {
            courseId,
          },
        },
      };
    }

    // Get all submissions
    const submissions = await prisma.quizSubmission.findMany({
      where: whereClause,
      select: {
        id: true,
        score: true,
        maxScore: true,
        percentage: true,
        passed: true,
        timeTaken: true,
        submittedAt: true,
        quiz: {
          select: {
            id: true,
            name: true,
            passingScore: true,
            courseCategory: {
              select: {
                course: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
      orderBy: { submittedAt: "desc" },
    });

    // Calculate stats
    const totalAttempts = submissions.length;
    const passedCount = submissions.filter((s) => s.passed).length;
    const passRate =
      totalAttempts > 0 ? Math.round((passedCount / totalAttempts) * 100) : 0;
    const avgScore =
      totalAttempts > 0
        ? Math.round(
            submissions.reduce((sum, s) => sum + s.percentage, 0) /
              totalAttempts
          )
        : 0;
    const avgTimeTaken =
      totalAttempts > 0
        ? Math.round(
            submissions
              .filter((s) => s.timeTaken)
              .reduce((sum, s) => sum + (s.timeTaken || 0), 0) /
              submissions.filter((s) => s.timeTaken).length || 0
          )
        : 0;

    // Score distribution (buckets: 0-20, 21-40, 41-60, 61-80, 81-100)
    const scoreDistribution = [
      { range: "0-20", count: 0 },
      { range: "21-40", count: 0 },
      { range: "41-60", count: 0 },
      { range: "61-80", count: 0 },
      { range: "81-100", count: 0 },
    ];
    submissions.forEach((s) => {
      if (s.percentage <= 20) scoreDistribution[0].count++;
      else if (s.percentage <= 40) scoreDistribution[1].count++;
      else if (s.percentage <= 60) scoreDistribution[2].count++;
      else if (s.percentage <= 80) scoreDistribution[3].count++;
      else scoreDistribution[4].count++;
    });

    // Recent submissions (last 10)
    const recentSubmissions = submissions.slice(0, 10).map((s) => ({
      id: s.id,
      user: s.user,
      quiz: {
        id: s.quiz.id,
        name: s.quiz.name,
      },
      course: s.quiz.courseCategory.course,
      score: s.score,
      maxScore: s.maxScore,
      percentage: s.percentage,
      passed: s.passed,
      timeTaken: s.timeTaken,
      submittedAt: s.submittedAt,
    }));

    // Quiz performance summary
    const quizStats: Record<
      number,
      {
        name: string;
        attempts: number;
        passed: number;
        totalPercentage: number;
      }
    > = {};
    submissions.forEach((s) => {
      if (!quizStats[s.quiz.id]) {
        quizStats[s.quiz.id] = {
          name: s.quiz.name,
          attempts: 0,
          passed: 0,
          totalPercentage: 0,
        };
      }
      quizStats[s.quiz.id].attempts++;
      if (s.passed) quizStats[s.quiz.id].passed++;
      quizStats[s.quiz.id].totalPercentage += s.percentage;
    });

    const quizPerformance = Object.entries(quizStats)
      .map(([id, stats]) => ({
        id: parseInt(id),
        name: stats.name,
        attempts: stats.attempts,
        passRate: Math.round((stats.passed / stats.attempts) * 100),
        avgScore: Math.round(stats.totalPercentage / stats.attempts),
      }))
      .sort((a, b) => b.attempts - a.attempts);

    // Struggling users (users with failed attempts)
    const userStats: Record<
      number,
      {
        user: { id: number; email: string; username: string | null };
        failed: number;
        total: number;
        totalPercentage: number;
      }
    > = {};
    submissions.forEach((s) => {
      if (!userStats[s.user.id]) {
        userStats[s.user.id] = {
          user: s.user,
          failed: 0,
          total: 0,
          totalPercentage: 0,
        };
      }
      userStats[s.user.id].total++;
      if (!s.passed) userStats[s.user.id].failed++;
      userStats[s.user.id].totalPercentage += s.percentage;
    });

    const strugglingUsers = Object.values(userStats)
      .filter((u) => u.failed > 0)
      .map((u) => ({
        user: u.user,
        failedQuizzes: u.failed,
        totalAttempts: u.total,
        avgScore: Math.round(u.totalPercentage / u.total),
      }))
      .sort((a, b) => b.failedQuizzes - a.failedQuizzes)
      .slice(0, 10);

    return {
      stats: {
        totalAttempts,
        passRate,
        avgScore,
        avgTimeTaken,
        passedCount,
        failedCount: totalAttempts - passedCount,
      },
      scoreDistribution,
      recentSubmissions,
      quizPerformance,
      strugglingUsers,
    };
  }

  /**
   * Get question-level analytics for a specific quiz (admin)
   */
  async getQuestionAnalytics(quizId: number) {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundError("Quiz not found");
    }

    const submissions = await prisma.quizSubmission.findMany({
      where: { quizId },
      select: {
        answers: true,
      },
    });

    // Analyze each question
    const questionAnalytics = quiz.questions.map((question) => {
      let correctCount = 0;
      const optionCounts: Record<number, number> = {};

      // Initialize option counts
      question.options.forEach((_, index) => {
        optionCounts[index] = 0;
      });

      // Count answers
      submissions.forEach((submission) => {
        const answers = submission.answers as Record<string, number> | null;
        if (answers && answers[question.id] !== undefined) {
          const selectedOption = answers[question.id];
          optionCounts[selectedOption] =
            (optionCounts[selectedOption] || 0) + 1;
          if (selectedOption === question.correctAnswer) {
            correctCount++;
          }
        }
      });

      const totalAnswers = submissions.length;
      const correctPercentage =
        totalAnswers > 0 ? Math.round((correctCount / totalAnswers) * 100) : 0;

      // Find most common wrong answer
      let mostCommonWrong: {
        option: string;
        count: number;
        percentage: number;
      } | null = null;
      Object.entries(optionCounts).forEach(([index, count]) => {
        const idx = parseInt(index);
        if (idx !== question.correctAnswer && count > 0) {
          const percentage = Math.round((count / totalAnswers) * 100);
          if (!mostCommonWrong || count > mostCommonWrong.count) {
            mostCommonWrong = {
              option: question.options[idx],
              count,
              percentage,
            };
          }
        }
      });

      return {
        id: question.id,
        questionText: question.questionText,
        questionType: question.questionType,
        options: question.options,
        correctAnswer: question.correctAnswer,
        points: question.points,
        totalAnswers,
        correctCount,
        correctPercentage,
        optionDistribution: Object.entries(optionCounts).map(
          ([index, count]) => ({
            optionIndex: parseInt(index),
            optionText: question.options[parseInt(index)],
            count,
            percentage:
              totalAnswers > 0 ? Math.round((count / totalAnswers) * 100) : 0,
            isCorrect: parseInt(index) === question.correctAnswer,
          })
        ),
        mostCommonWrong,
        difficulty:
          correctPercentage >= 80
            ? "easy"
            : correctPercentage >= 50
            ? "medium"
            : "hard",
      };
    });

    return {
      quiz: {
        id: quiz.id,
        name: quiz.name,
        passingScore: quiz.passingScore,
      },
      totalSubmissions: submissions.length,
      questions: questionAnalytics,
    };
  }
}

export const quizService = new QuizService();
