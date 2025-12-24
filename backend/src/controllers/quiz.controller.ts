import { Request, Response } from "express";
import { z } from "zod";
import { quizService } from "../services/quiz.service.js";
import { sendSuccess, sendCreated } from "../utils/response.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Validation schemas
export const createQuizSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Quiz name is required"),
    description: z.string().optional(),
    passingScore: z.number().int().min(0).max(100).optional(),
    timeLimit: z.number().int().positive().nullable().optional(),
  }),
  params: z.object({
    categoryId: z.string().regex(/^\d+$/, "Category ID must be a number"),
  }),
});

export const updateQuizSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    passingScore: z.number().int().min(0).max(100).optional(),
    timeLimit: z.number().int().positive().nullable().optional(),
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/, "Quiz ID must be a number"),
  }),
});

export const createQuestionSchema = z.object({
  body: z.object({
    questionText: z.string().min(1, "Question text is required"),
    questionType: z.enum(["multiple_choice", "true_false"]).optional(),
    options: z.array(z.string()).min(2, "At least 2 options required"),
    correctAnswer: z.number().int().min(0),
    points: z.number().int().positive().optional(),
    orderIndex: z.number().int().min(0).optional(),
  }),
  params: z.object({
    quizId: z.string().regex(/^\d+$/, "Quiz ID must be a number"),
  }),
});

export const updateQuestionSchema = z.object({
  body: z.object({
    questionText: z.string().min(1).optional(),
    questionType: z.enum(["multiple_choice", "true_false"]).optional(),
    options: z.array(z.string()).min(2).optional(),
    correctAnswer: z.number().int().min(0).optional(),
    points: z.number().int().positive().optional(),
    orderIndex: z.number().int().min(0).optional(),
  }),
  params: z.object({
    questionId: z.string().regex(/^\d+$/, "Question ID must be a number"),
  }),
});

export const submitQuizSchema = z.object({
  body: z.object({
    answers: z.record(z.string(), z.number()), // { "questionId": selectedOptionIndex }
    timeTaken: z.number().int().min(0).optional(),
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/, "Quiz ID must be a number"),
  }),
});

export const reorderQuestionsSchema = z.object({
  body: z.object({
    questionIds: z.array(z.number().int().positive()),
  }),
  params: z.object({
    quizId: z.string().regex(/^\d+$/, "Quiz ID must be a number"),
  }),
});

export const quizController = {
  /**
   * Create quiz for a category (admin)
   */
  create: asyncHandler(async (req: Request, res: Response) => {
    const categoryId = parseInt(req.params.categoryId);
    const quiz = await quizService.create({
      courseCategoryId: categoryId,
      ...req.body,
    });
    sendCreated(res, quiz, "Quiz created successfully");
  }),

  /**
   * Get quiz by ID (student - no correct answers)
   */
  getById: asyncHandler(async (req: Request, res: Response) => {
    const quizId = parseInt(req.params.id);
    const userId = req.user?.userId;
    const quiz = await quizService.getQuizWithStatus(quizId, userId);
    sendSuccess(res, quiz);
  }),

  /**
   * Get quiz by ID for admin (includes correct answers)
   */
  getByIdAdmin: asyncHandler(async (req: Request, res: Response) => {
    const quizId = parseInt(req.params.id);
    const quiz = await quizService.getByIdAdmin(quizId);
    sendSuccess(res, quiz);
  }),

  /**
   * Update quiz (admin)
   */
  update: asyncHandler(async (req: Request, res: Response) => {
    const quizId = parseInt(req.params.id);
    const quiz = await quizService.update(quizId, req.body);
    sendSuccess(res, quiz, "Quiz updated successfully");
  }),

  /**
   * Delete quiz (admin)
   */
  delete: asyncHandler(async (req: Request, res: Response) => {
    const quizId = parseInt(req.params.id);
    const result = await quizService.delete(quizId);
    sendSuccess(res, result);
  }),

  /**
   * Get quizzes by category
   */
  getByCategoryId: asyncHandler(async (req: Request, res: Response) => {
    const categoryId = parseInt(req.params.categoryId);
    const quizzes = await quizService.getByCategoryId(categoryId);
    sendSuccess(res, quizzes);
  }),

  // ============ Question Endpoints ============

  /**
   * Add question to quiz (admin)
   */
  createQuestion: asyncHandler(async (req: Request, res: Response) => {
    const quizId = parseInt(req.params.quizId);
    const question = await quizService.createQuestion({
      quizId,
      ...req.body,
    });
    sendCreated(res, question, "Question added successfully");
  }),

  /**
   * Update question (admin)
   */
  updateQuestion: asyncHandler(async (req: Request, res: Response) => {
    const questionId = parseInt(req.params.questionId);
    const question = await quizService.updateQuestion(questionId, req.body);
    sendSuccess(res, question, "Question updated successfully");
  }),

  /**
   * Delete question (admin)
   */
  deleteQuestion: asyncHandler(async (req: Request, res: Response) => {
    const questionId = parseInt(req.params.questionId);
    const result = await quizService.deleteQuestion(questionId);
    sendSuccess(res, result);
  }),

  /**
   * Reorder questions in a quiz (admin)
   */
  reorderQuestions: asyncHandler(async (req: Request, res: Response) => {
    const quizId = parseInt(req.params.quizId);
    const { questionIds } = req.body;
    const result = await quizService.reorderQuestions(quizId, questionIds);
    sendSuccess(res, result);
  }),

  // ============ Submission Endpoints ============

  /**
   * Submit quiz answers
   */
  submit: asyncHandler(async (req: Request, res: Response) => {
    const quizId = parseInt(req.params.id);
    const userId = req.user!.userId;

    // Convert string keys to numbers
    const answers: Record<number, number> = {};
    for (const [key, value] of Object.entries(req.body.answers)) {
      answers[parseInt(key)] = value as number;
    }

    const result = await quizService.submitQuiz(userId, quizId, {
      answers,
      timeTaken: req.body.timeTaken,
    });
    sendSuccess(res, result, "Quiz submitted successfully");
  }),

  /**
   * Get quiz results (after submission)
   */
  getResults: asyncHandler(async (req: Request, res: Response) => {
    const quizId = parseInt(req.params.id);
    const userId = req.user!.userId;

    const results = await quizService.getQuizResults(userId, quizId);
    sendSuccess(res, results);
  }),

  /**
   * Get user's quiz submissions for a course
   */
  getUserSubmissions: asyncHandler(async (req: Request, res: Response) => {
    const courseId = parseInt(req.params.courseId);
    const userId = req.user!.userId;

    const submissions = await quizService.getUserSubmissions(userId, courseId);
    sendSuccess(res, submissions);
  }),

  /**
   * Get all submissions for a quiz (admin)
   */
  getQuizSubmissions: asyncHandler(async (req: Request, res: Response) => {
    const quizId = parseInt(req.params.id);
    const submissions = await quizService.getQuizSubmissions(quizId);
    sendSuccess(res, submissions);
  }),
};
