import { Router } from "express";
import {
  courseController,
  createCourseSchema,
  updateCourseSchema,
} from "../controllers/course.controller.js";
import { authenticate, authorize, optionalAuth } from "../middleware/auth.js";
import { validateZod } from "../middleware/validate.js";

const router = Router();

// Public routes (with optional auth for personalized content)
router.get("/", optionalAuth, courseController.getAll);
router.get("/:id", optionalAuth, courseController.getById);

// Admin routes
router.post(
  "/",
  authenticate,
  authorize("Admin"),
  validateZod(createCourseSchema),
  courseController.create
);

router.patch(
  "/:id",
  authenticate,
  authorize("Admin"),
  validateZod(updateCourseSchema),
  courseController.update
);

router.delete(
  "/:id",
  authenticate,
  authorize("Admin"),
  courseController.delete
);

export default router;
