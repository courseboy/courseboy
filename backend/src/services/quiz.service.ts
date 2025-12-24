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
}

export const quizService = new QuizService();
