import { sendError } from '../utils/response/responseHandler.js';

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
  // Log the error for debugging
  console.error('ERROR:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(val => val.message);
    return sendError(res, 400, 'Validation Error', errors);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return sendError(res, 400, `Duplicate value for ${field}`, err.keyValue);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 401, 'Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 401, 'Token expired');
  }

  // Custom API error
  if (err instanceof ApiError) {
    return sendError(res, err.statusCode, err.message, err.errors);
  }

  // Default server error
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  return sendError(res, statusCode, err.message || 'Server Error', 
    process.env.NODE_ENV === 'production' ? null : err.stack);
}; 