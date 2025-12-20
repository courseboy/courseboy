import { Request, Response } from "express";
import { z } from "zod";
import { userService } from "../services/user.service.js";
import { sendSuccess } from "../utils/response.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Validation schemas
export const updateUserSchema = z.object({
  body: z.object({
    username: z.string().min(3).optional(),
    email: z.string().email().optional(),
  }),
});

export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email(),
    username: z.string().min(3).optional(),
    password: z.string().min(6),
    privilegeIds: z.array(z.number()).optional(),
  }),
});

export const adminUpdateUserSchema = z.object({
  body: z.object({
    username: z.string().min(3).optional(),
    email: z.string().email().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updatePrivilegesSchema = z.object({
  body: z.object({
    privilegeIds: z.array(z.number()),
  }),
});

export const userController = {
  /**
   * Get current user profile
   */
  getProfile: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const user = await userService.getById(userId);
    sendSuccess(res, user);
  }),

  /**
   * Update current user profile
   */
  updateProfile: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const user = await userService.update(userId, req.body);
    sendSuccess(res, user, "Profile updated successfully");
  }),

  /**
   * Get user progress
   */
  getProgress: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const progress = await userService.getUserProgress(userId);
    sendSuccess(res, progress);
  }),

  // Admin endpoints
  /**
   * Get all users (admin)
   */
  getAllUsers: asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await userService.getAll(page, limit);
    sendSuccess(res, result.data, undefined, 200, result.meta);
  }),

  /**
   * Get user by ID (admin)
   */
  getUserById: asyncHandler(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    const user = await userService.getById(userId);
    sendSuccess(res, user);
  }),

  /**
   * Deactivate user (admin)
   */
  deactivateUser: asyncHandler(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    const result = await userService.deactivate(userId);
    sendSuccess(res, result);
  }),

  /**
   * Activate user (admin)
   */
  activateUser: asyncHandler(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    const result = await userService.activate(userId);
    sendSuccess(res, result);
  }),

  /**
   * Assign privilege to user (admin)
   */
  assignPrivilege: asyncHandler(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    const privilegeId = parseInt(req.body.privilegeId);
    const result = await userService.assignPrivilege(userId, privilegeId);
    sendSuccess(res, result);
  }),

  /**
   * Remove privilege from user (admin)
   */
  removePrivilege: asyncHandler(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    const privilegeId = parseInt(req.params.privilegeId);
    const result = await userService.removePrivilege(userId, privilegeId);
    sendSuccess(res, result);
  }),

  /**
   * Create user (admin)
   */
  createUser: asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.create(req.body);
    sendSuccess(res, user, "User created successfully", 201);
  }),

  /**
   * Get all privileges (admin)
   */
  getAllPrivileges: asyncHandler(async (_req: Request, res: Response) => {
    const privileges = await userService.getAllPrivileges();
    sendSuccess(res, privileges);
  }),

  /**
   * Update user privileges (admin)
   */
  updateUserPrivileges: asyncHandler(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    const { privilegeIds } = req.body;
    const user = await userService.updateUserPrivileges(userId, privilegeIds);
    sendSuccess(res, user, "User privileges updated successfully");
  }),

  /**
   * Admin update user (admin)
   */
  adminUpdateUser: asyncHandler(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    const user = await userService.adminUpdate(userId, req.body);
    sendSuccess(res, user, "User updated successfully");
  }),
};
