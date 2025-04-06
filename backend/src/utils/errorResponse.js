/**
 * Utility for standardized error responses
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {String} message - Error message
 * @param {Object|null} details - Additional error details
 * @returns {Object} Response object
 */
export const errorResponse = (res, statusCode, message, details = null) => {
  const response = {
    success: false,
    message: message || "An error occurred",
  };

  if (details) {
    response.details = details;
  }

  return res.status(statusCode).json(response);
};

/**
 * Utility for standardized success responses
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {String} message - Success message
 * @param {Object|null} data - Response data
 * @returns {Object} Response object
 */
export const successResponse = (res, statusCode, message, data = null) => {
  const response = {
    success: true,
    message,
  };

  if (data) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};
