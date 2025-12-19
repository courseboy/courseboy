import { Router } from "express";
import {
  userController,
  updateUserSchema,
} from "../controllers/user.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validateZod } from "../middleware/validate.js";

const router = Router();

// User routes (authenticated)
router.get("/profile", authenticate, userController.getProfile);
router.patch(
  "/profile",
  authenticate,
  validateZod(updateUserSchema),
  userController.updateProfile
);
router.get("/progress", authenticate, userController.getProgress);

// Admin routes
router.get("/", authenticate, authorize("Admin"), userController.getAllUsers);

router.get(
  "/:id",
  authenticate,
  authorize("Admin"),
  userController.getUserById
);

router.patch(
  "/:id/deactivate",
  authenticate,
  authorize("Admin"),
  userController.deactivateUser
);

router.patch(
  "/:id/activate",
  authenticate,
  authorize("Admin"),
  userController.activateUser
);

router.post(
  "/:id/roles",
  authenticate,
  authorize("Admin"),
  userController.assignRole
);

router.delete(
  "/:id/roles/:roleId",
  authenticate,
  authorize("Admin"),
  userController.removeRole
);

export default router;
