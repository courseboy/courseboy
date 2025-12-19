import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "4000", 10),
  apiPrefix: process.env.API_PREFIX || "/api/v1",

  // Database
  databaseUrl: process.env.DATABASE_URL!,

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || "fallback-secret-change-me",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "fallback-refresh-secret",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  },

  // Security
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || "12", 10),

  // CORS
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || "100", 10),
  },

  // Redis
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",

  // Flags
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
} as const;
