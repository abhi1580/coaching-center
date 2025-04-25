/**
 * Utility functions for standardized API responses
 */

/**
 * Send success response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {object|array} data - Response data
 * @param {object} meta - Additional metadata
 */
export const sendSuccess = (
  res,
  statusCode = 200,
  message = "Success",
  data = null,
  meta = {}
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...meta,
  });
};

/**
 * Send error response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {object} error - Error details
 */
export const sendError = (
  res,
  statusCode = 500,
  message = "Server Error",
  error = null
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: error?.message || error,
  });
};

/**
 * Send created response (201)
 * @param {object} res - Express response object
 * @param {string} message - Success message
 * @param {object} data - Created resource data
 */
export const sendCreated = (
  res,
  message = "Resource created successfully",
  data = null
) => {
  return sendSuccess(res, 201, message, data);
};

/**
 * Send not found response (404)
 * @param {object} res - Express response object
 * @param {string} message - Not found message
 */
export const sendNotFound = (
  res,
  message = "Resource not found",
) => {
  return sendError(res, 404, message);
};

/**
 * Send bad request response (400)
 * @param {object} res - Express response object
 * @param {string} message - Bad request message
 * @param {object} error - Error details
 */
export const sendBadRequest = (
  res,
  message = "Bad request",
  error = null
) => {
  return sendError(res, 400, message, error);
};

/**
 * Send unauthorized response (401)
 * @param {object} res - Express response object
 * @param {string} message - Unauthorized message
 */
export const sendUnauthorized = (
  res,
  message = "Unauthorized access",
) => {
  return sendError(res, 401, message);
};

/**
 * Send forbidden response (403)
 * @param {object} res - Express response object
 * @param {string} message - Forbidden message
 */
export const sendForbidden = (
  res,
  message = "Forbidden access",
) => {
  return sendError(res, 403, message);
}; 