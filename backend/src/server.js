import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import config from "./config/config.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import routes from "./routes/index.js";
import helmet from "helmet";
import limiter from "./middleware/rateLimiter.js";
import cookieParser from "cookie-parser";
import { doubleCsrf } from "csrf-csrf";

const app = express();

// Get current file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to database
connectDB();

// Basic middleware - cookie-parser must be first
app.use(cookieParser());

// Parse JSON bodies
app.use(express.json());

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: config.env === "production" ? undefined : false,
  })
);

// CORS configuration must be before other middleware
app.use(cors(config.corsOptions));

// Rate limiting for API endpoints
app.use(limiter);

// CSRF validation middleware
const csrfProtection = (req, res, next) => {
  // Skip CSRF check for GET requests, CSRF token endpoint, and create-admin endpoint
  if (
    req.method === "GET" ||
    req.path === "/api/auth/csrf-token" ||
    req.path === "/api/auth/create-admin"
  ) {
    return next();
  }

  const csrfToken = req.headers["x-csrf-token"];
  const cookieToken = req.cookies["X-CSRF-Token"];

  // Only log minimal info in development mode
  if (config.env === "development") {
    console.log(`CSRF check: ${req.method} ${req.path}`);
  }

  if (!csrfToken || !cookieToken || csrfToken !== cookieToken) {
    // Log minimal info about the failure
    console.error(`CSRF validation failed for ${req.method} ${req.path}`);
    
    return res.status(403).json({
      success: false,
      message: "Invalid CSRF token",
    });
  }

  next();
};

// Apply CSRF protection
app.use(csrfProtection);
console.log(`CSRF protection enabled in ${config.env} mode`);

// Serve static files from uploads directory
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), config.uploadPath))
);

// Logging middleware
if (config.env === "development") {
  app.use(morgan("dev"));
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
} else {
  // Production logging - only errors
  app.use(
    morgan("combined", {
      skip: (req, res) => res.statusCode < 400,
      stream: {
        write: (message) => console.error(message.trim()),
      },
    })
  );
}

// API routes
app.use("/api", routes);

// Serve static files in production
if (config.env === "production") {
  // Use absolute path to frontend build directory
  const buildPath = path.resolve(process.cwd(), "../frontend/dist");

  // Serve static files from the build directory
  app.use(express.static(buildPath));

  // Handle all other routes by serving index.html
  app.get("*", (req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
  });
}

// 404 handler for undefined routes
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server running in ${config.env} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! Shutting down...");
  if (config.env === "development") {
    console.error(err);
  } else {
    console.error(err.message);
  }
  process.exit(1);
});
