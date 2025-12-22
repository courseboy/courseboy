import { Router } from "express";
import {
  courseController,
  createCourseSchema,
  updateCourseSchema,
  createCategorySchema,
  updateCategorySchema,
  reorderCategoriesSchema,
  reorderLessonsSchema,
} from "../controllers/course.controller.js";
import { authenticate, authorize, optionalAuth } from "../middleware/auth.js";
import { validateZod } from "../middleware/validate.js";

const router = Router();

// Admin routes (must be before /:id to avoid conflicts)
router.get(
  "/admin/all",
  authenticate,
  authorize("Admin"),
  courseController.getAllForAdmin
);

// Category routes (admin) - must be before /:id
router.post(
  "/:courseId/categories",
  authenticate,
  authorize("Admin"),
  validateZod(createCategorySchema),
  courseController.createCategory
);

router.put(
  "/:courseId/categories/reorder",
  authenticate,
  authorize("Admin"),
  validateZod(reorderCategoriesSchema),
  courseController.reorderCategories
);

router.patch(
  "/categories/:categoryId",
  authenticate,
  authorize("Admin"),
  validateZod(updateCategorySchema),
  courseController.updateCategory
);

router.delete(
  "/categories/:categoryId",
  authenticate,
  authorize("Admin"),
  courseController.deleteCategory
);

router.put(
  "/categories/:categoryId/lessons/reorder",
  authenticate,
  authorize("Admin"),
  validateZod(reorderLessonsSchema),
  courseController.reorderLessons
);

// Public routes (with optional auth for personalized content)
router.get("/", optionalAuth, courseController.getAll);

// Course CRUD routes
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

// This must be LAST because /:id is a catch-all pattern
router.get("/:id", optionalAuth, courseController.getById);

export default router;
