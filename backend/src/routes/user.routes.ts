import { Router } from "express";
import {
  userController,
  updateUserSchema,
  createUserSchema,
  adminUpdateUserSchema,
  updatePrivilegesSchema,
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
  "/privileges",
  authenticate,
  authorize("Admin"),
  userController.getAllPrivileges
);

router.post(
  "/",
  authenticate,
  authorize("Admin"),
  validateZod(createUserSchema),
  userController.createUser
);

router.get(
  "/:id",
  authenticate,
  authorize("Admin"),
  userController.getUserById
);

router.patch(
  "/:id",
  authenticate,
  authorize("Admin"),
  validateZod(adminUpdateUserSchema),
  userController.adminUpdateUser
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
  "/:id/privileges",
  authenticate,
  authorize("Admin"),
  userController.assignPrivilege
);

router.put(
  "/:id/privileges",
  authenticate,
  authorize("Admin"),
  validateZod(updatePrivilegesSchema),
  userController.updateUserPrivileges
);

router.delete(
  "/:id/privileges/:privilegeId",
  authenticate,
  authorize("Admin"),
  userController.removePrivilege
);

export default router;
