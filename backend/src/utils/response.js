export const successResponse = (
  res,
  data,
  message = "Success",
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (
  res,
  message = "Error occurred",
  statusCode = 500,
  errors = null
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

export const validationError = (res, errors) => {
  return res.status(422).json({
    success: false,
    message: "Validation failed",
    errors,
  });
};

export const notFoundError = (res, message = "Resource not found") => {
  return res.status(404).json({
    success: false,
    message,
  });
};

export const unauthorizedError = (res, message = "Unauthorized access") => {
  return res.status(401).json({
    success: false,
    message,
  });
};

export const forbiddenError = (res, message = "Forbidden access") => {
  return res.status(403).json({
    success: false,
    message,
  });
};
