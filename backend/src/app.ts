import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import hpp from "hpp";

import { config } from "./config/index.js";
import routes from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { apiLimiter } from "./middleware/rateLimiter.js";

const app = express();

// Security middleware
app.use(helmet()); // Set security headers
app.use(hpp()); // Prevent HTTP Parameter Pollution

// CORS configuration
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parsing
app.use(express.json({ limit: "10kb" })); // Limit body size
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// Logging
if (config.isDevelopment) {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Rate limiting
app.use(config.apiPrefix, apiLimiter);

// Trust proxy (for rate limiting behind reverse proxy)
app.set("trust proxy", 1);

// API routes
app.use(config.apiPrefix, routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
