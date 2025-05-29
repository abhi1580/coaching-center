import { validationError } from "../utils/responseUtil.js";
import { validationResult } from "express-validator";

// Basic validation using express-validator
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((error) => ({
        msg: error.msg,
        param: error.param,
        value: error.value,
      })),
    });
  }
  next();
};

// Alias for backward compatibility with validateRequest.js
export const validateRequest = validate;

// Validate query parameters using Joi schema
export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path[0],
        message: detail.message,
      }));
      return validationError(res, "Invalid query parameters", 422, errors);
    }

    next();
  };
};

// Validate route parameters using Joi schema
export const validateParams = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path[0],
        message: detail.message,
      }));
      return validationError(res, "Invalid route parameters", 422, errors);
    }

    next();
  };
};
