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
    requiredRoleId: z.number().int().positive().optional(),
    certificateTemplateUrl: z.string().url().optional(),
  }),
});

export const updateCourseSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    coverImg: z.string().url().optional(),
    requiredRoleId: z.number().int().positive().optional().nullable(),
    certificateTemplateUrl: z.string().url().optional().nullable(),
    isPublished: z.boolean().optional(),
  }),
});

export const courseController = {
  /**
   * Get all published courses
   */
  getAll: asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await courseService.getPublishedCourses(page, limit);
    sendSuccess(res, result.data, undefined, 200, result.meta);
  }),

  /**
   * Get course by ID
   */
  getById: asyncHandler(async (req: Request, res: Response) => {
    const courseId = parseInt(req.params.id);
    const userId = req.user?.userId;
    const userRoles = req.user?.roles;

    const course = await courseService.getById(courseId, userId, userRoles);
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
};
