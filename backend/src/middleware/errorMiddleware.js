import { sendError } from "../utils/responseUtil.js";

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(message, statusCode, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Not found error handler - for 404 routes
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Global error handler
 */
export const errorHandler = (err, req, res, next) => {
  // Set default status code and message
  let statusCode = err.statusCode || 500;
  let message = err.message || "Server Error";
  let errors = err.errors || null;

  // Log the error for debugging
  if (process.env.NODE_ENV === "development") {
    console.error("ERROR:", err);
  } else {
    // In production, log minimal error info
    console.error(`[${statusCode}] ${message}`);
  }

  // Handle specific error types
  if (err.name === "CastError") {
    message = "Resource not found";
    statusCode = 404;
  }

  if (err.name === "ValidationError") {
    const validationErrors = Object.values(err.errors).map(
      (val) => val.message
    );
    message = "Validation Error";
    errors = validationErrors;
    statusCode = 400;
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value for ${field}`;
    errors = err.keyValue;
    statusCode = 400;
  }

  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  // Custom API error
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  }

  // In production, don't send stack traces or detailed errors
  if (process.env.NODE_ENV === "production") {
    return res.status(statusCode).json({
      success: false,
      message: message,
      ...(errors && {
        errors: Array.isArray(errors) ? errors : ["An error occurred"],
      }),
    });
  }

  // In development, include stack trace
  return res.status(statusCode).json({
    success: false,
    message: message,
    ...(errors && { errors }),
    stack: err.stack,
  });
};

// Export default for compatibility with imports from error.js
export default errorHandler;
