import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import courseRoutes from "./course.routes.js";
import lessonRoutes from "./lesson.routes.js";

const router = Router();

// Health check
router.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/courses", courseRoutes);
router.use("/lessons", lessonRoutes);

export default router;
