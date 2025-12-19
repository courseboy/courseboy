import app from "./app.js";
import { config } from "./config/index.js";
import { logger } from "./config/logger.js";
import prisma from "./config/database.js";

const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info("✅ Database connected successfully");

    // Start server
    app.listen(config.port, () => {
      logger.info(`🚀 Server running on port ${config.port}`);
      logger.info(`📍 Environment: ${config.nodeEnv}`);
      logger.info(
        `🔗 API URL: http://localhost:${config.port}${config.apiPrefix}`
      );
    });
  } catch (error) {
    logger.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (error) => {
  logger.error("Unhandled Rejection:", error);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received. Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received. Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
