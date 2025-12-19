import { Router } from "express";
import {
  lessonController,
  createLessonSchema,
  updateLessonSchema,
  updateProgressSchema,
} from "../controllers/lesson.controller.js";
import { authenticate, authorize, optionalAuth } from "../middleware/auth.js";
import { validateZod } from "../middleware/validate.js";

const router = Router();

// Public routes (with optional auth)
router.get("/:id", optionalAuth, lessonController.getById);

// User routes
router.patch(
  "/:id/progress",
  authenticate,
  validateZod(updateProgressSchema),
  lessonController.updateProgress
);

// Admin routes
router.post(
  "/courses/:courseId/categories/:categoryId/lessons",
  authenticate,
  authorize("Admin"),
  validateZod(createLessonSchema),
  lessonController.create
);

router.patch(
  "/:id",
  authenticate,
  authorize("Admin"),
  validateZod(updateLessonSchema),
  lessonController.update
);

router.delete(
  "/:id",
  authenticate,
  authorize("Admin"),
  lessonController.delete
);

export default router;
