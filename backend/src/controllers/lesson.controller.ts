import { Request, Response } from "express";
import { z } from "zod";
import { lessonService } from "../services/lesson.service.js";
import { sendSuccess, sendCreated } from "../utils/response.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { UnauthorizedError } from "../utils/errors.js";

// Validation schemas
export const createLessonSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Lesson title is required"),
    videoUrl: z.string().url().optional(),
    durationSeconds: z.number().int().positive().optional(),
    isFreePreview: z.boolean().optional(),
  }),
  params: z.object({
    courseId: z.coerce.number(),
    categoryId: z.coerce.number(),
  }),
});

export const updateLessonSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    videoUrl: z.string().url().optional().nullable(),
    durationSeconds: z.number().int().positive().optional().nullable(),
    isFreePreview: z.boolean().optional(),
    orderIndex: z.number().int().positive().optional(),
  }),
  params: z.object({
    id: z.coerce.number(),
  }),
});

export const updateProgressSchema = z.object({
  body: z.object({
    watchedSeconds: z.number().int().min(0),
    isCompleted: z.boolean().optional(),
  }),
  params: z.object({
    id: z.coerce.number(),
  }),
});

export const lessonController = {
  /**
   * Get lesson by ID
   */
  getById: asyncHandler(async (req: Request, res: Response) => {
    const lessonId = parseInt(req.params.id);
    const userId = req.user?.userId;
    const userPrivileges = req.user?.privileges;

    const lesson = await lessonService.getById(
      lessonId,
      userId,
      userPrivileges
    );
    sendSuccess(res, lesson);
  }),

  /**
   * Update lesson progress
   */
  updateProgress: asyncHandler(async (req: Request, res: Response) => {
    const lessonId = parseInt(req.params.id);

    if (!req.user) {
      throw new UnauthorizedError(
        "User must be authenticated to track progress"
      );
    }

    const userId = req.user.userId;

    const progress = await lessonService.updateProgress(
      lessonId,
      userId,
      req.body
    );
    sendSuccess(res, progress);
  }),

  /**
   * Create lesson (admin)
   */
  create: asyncHandler(async (req: Request, res: Response) => {
    const courseId = parseInt(req.params.courseId);
    const categoryId = parseInt(req.params.categoryId);

    const lesson = await lessonService.create(courseId, categoryId, req.body);
    sendCreated(res, lesson, "Lesson created successfully");
  }),

  /**
   * Update lesson (admin)
   */
  update: asyncHandler(async (req: Request, res: Response) => {
    const lessonId = parseInt(req.params.id);
    const lesson = await lessonService.update(lessonId, req.body);
    sendSuccess(res, lesson, "Lesson updated successfully");
  }),

  /**
   * Delete lesson (admin)
   */
  delete: asyncHandler(async (req: Request, res: Response) => {
    const lessonId = parseInt(req.params.id);
    const result = await lessonService.delete(lessonId);
    sendSuccess(res, result);
  }),
};
