import { Router } from "express";
import {
  quizController,
  createQuizSchema,
  updateQuizSchema,
  createQuestionSchema,
  updateQuestionSchema,
  submitQuizSchema,
  reorderQuestionsSchema,
} from "../controllers/quiz.controller.js";
import { authenticate, authorize, optionalAuth } from "../middleware/auth.js";
import { validateZod } from "../middleware/validate.js";

const router = Router();

// ============ Public/Student Routes ============

// Get quiz (no correct answers for students)
router.get("/:id", optionalAuth, quizController.getById);

// Submit quiz answers
router.post(
  "/:id/submit",
  authenticate,
  validateZod(submitQuizSchema),
  quizController.submit
);

// Get quiz results (after submission)
router.get("/:id/results", authenticate, quizController.getResults);

// Get user's submissions for a course
router.get(
  "/course/:courseId/submissions",
  authenticate,
  quizController.getUserSubmissions
);

// ============ Admin Routes ============

// Get quiz analytics overview
router.get(
  "/analytics/overview",
  authenticate,
  authorize("Admin"),
  quizController.getAnalyticsOverview
);

// Get question-level analytics for a quiz
router.get(
  "/:id/analytics",
  authenticate,
  authorize("Admin"),
  quizController.getQuestionAnalytics
);

// Create quiz for a category
router.post(
  "/category/:categoryId",
  authenticate,
  authorize("Admin"),
  validateZod(createQuizSchema),
  quizController.create
);

// Get quizzes by category
router.get(
  "/category/:categoryId",
  authenticate,
  authorize("Admin"),
  quizController.getByCategoryId
);

// Get quiz with correct answers (admin)
router.get(
  "/:id/admin",
  authenticate,
  authorize("Admin"),
  quizController.getByIdAdmin
);

// Update quiz
router.patch(
  "/:id",
  authenticate,
  authorize("Admin"),
  validateZod(updateQuizSchema),
  quizController.update
);

// Delete quiz
router.delete("/:id", authenticate, authorize("Admin"), quizController.delete);

// Get all submissions for a quiz (admin)
router.get(
  "/:id/submissions",
  authenticate,
  authorize("Admin"),
  quizController.getQuizSubmissions
);

// ============ Question Routes (Admin) ============

// Add question to quiz
router.post(
  "/:quizId/questions",
  authenticate,
  authorize("Admin"),
  validateZod(createQuestionSchema),
  quizController.createQuestion
);

// Update question
router.patch(
  "/questions/:questionId",
  authenticate,
  authorize("Admin"),
  validateZod(updateQuestionSchema),
  quizController.updateQuestion
);

// Delete question
router.delete(
  "/questions/:questionId",
  authenticate,
  authorize("Admin"),
  quizController.deleteQuestion
);

// Reorder questions
router.post(
  "/:quizId/questions/reorder",
  authenticate,
  authorize("Admin"),
  validateZod(reorderQuestionsSchema),
  quizController.reorderQuestions
);

export default router;
