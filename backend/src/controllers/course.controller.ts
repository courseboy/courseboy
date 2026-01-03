import { Request, Response } from "express";
import { z } from "zod";
import { courseService } from "../services/course.service.js";
import { sendSuccess, sendCreated } from "../utils/response.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Validation schemas
export const createCourseSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Course name is required"),
    description: z.string().optional(),
    coverImg: z.string().url().optional(),
    requiredPrivilegeId: z.number().int().positive().optional(),
    certificateTemplateUrl: z.string().url().optional(),
  }),
});

export const updateCourseSchema = z.object({
  params: z.object({
    id: z.coerce.number(),
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    coverImg: z.string().url().optional(),
    requiredPrivilegeId: z.number().int().positive().optional().nullable(),
    certificateTemplateUrl: z.string().url().optional().nullable(),
    isPublished: z.boolean().optional(),
  }),
});

export const createCategorySchema = z.object({
  params: z.object({
    courseId: z.coerce.number(),
  }),
  body: z.object({
    name: z.string().min(1, "Category name is required"),
    orderIndex: z.number().int().positive().optional(),
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({
    categoryId: z.coerce.number(),
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    orderIndex: z.number().int().positive().optional(),
  }),
});

export const reorderCategoriesSchema = z.object({
  params: z.object({
    courseId: z.coerce.number(),
  }),
  body: z.object({
    categoryIds: z.array(z.number().int().positive()),
  }),
});

export const reorderLessonsSchema = z.object({
  params: z.object({
    categoryId: z.coerce.number(),
  }),
  body: z.object({
    lessonIds: z.array(z.number().int().positive()),
  }),
});

export const courseController = {
  /**
   * Get all published courses (public)
   */
  getAll: asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await courseService.getPublishedCourses(page, limit);
    sendSuccess(res, result.data, undefined, 200, result.meta);
  }),

  /**
   * Get all courses for admin (including unpublished)
   */
  getAllForAdmin: asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const result = await courseService.getAllForAdmin(page, limit);
    sendSuccess(res, result.data, undefined, 200, result.meta);
  }),

  /**
   * Get course by ID
   */
  getById: asyncHandler(async (req: Request, res: Response) => {
    const courseId = parseInt(req.params.id);
    const userId = req.user?.userId;
    const userPrivileges = req.user?.privileges;

    const course = await courseService.getById(
      courseId,
      userId,
      userPrivileges
    );
    sendSuccess(res, course);
  }),

  /**
   * Create course (admin)
   */
  create: asyncHandler(async (req: Request, res: Response) => {
    const course = await courseService.create(req.body);
    sendCreated(res, course, "Course created successfully");
  }),

  /**
   * Update course (admin)
   */
  update: asyncHandler(async (req: Request, res: Response) => {
    const courseId = parseInt(req.params.id);
    const course = await courseService.update(courseId, req.body);
    sendSuccess(res, course, "Course updated successfully");
  }),

  /**
   * Delete course (admin)
   */
  delete: asyncHandler(async (req: Request, res: Response) => {
    const courseId = parseInt(req.params.id);
    const result = await courseService.delete(courseId);
    sendSuccess(res, result);
  }),

  /**
   * Create category for a course (admin)
   */
  createCategory: asyncHandler(async (req: Request, res: Response) => {
    const courseId = parseInt(req.params.courseId);
    const category = await courseService.createCategory(courseId, req.body);
    sendCreated(res, category, "Category created successfully");
  }),

  /**
   * Update category (admin)
   */
  updateCategory: asyncHandler(async (req: Request, res: Response) => {
    const categoryId = parseInt(req.params.categoryId);
    const category = await courseService.updateCategory(categoryId, req.body);
    sendSuccess(res, category, "Category updated successfully");
  }),

  /**
   * Delete category (admin)
   */
  deleteCategory: asyncHandler(async (req: Request, res: Response) => {
    const categoryId = parseInt(req.params.categoryId);
    const result = await courseService.deleteCategory(categoryId);
    sendSuccess(res, result);
  }),

  /**
   * Reorder categories in a course (admin)
   */
  reorderCategories: asyncHandler(async (req: Request, res: Response) => {
    const courseId = parseInt(req.params.courseId);
    const { categoryIds } = req.body;
    const result = await courseService.reorderCategories(courseId, categoryIds);
    sendSuccess(res, result);
  }),

  /**
   * Reorder lessons in a category (admin)
   */
  reorderLessons: asyncHandler(async (req: Request, res: Response) => {
    const categoryId = parseInt(req.params.categoryId);
    const { lessonIds } = req.body;
    const result = await courseService.reorderLessons(categoryId, lessonIds);
    sendSuccess(res, result);
  }),
};
