import { check } from "express-validator";

export const standardValidator = [
  check("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  check("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10, max: 500 })
    .withMessage("Description must be between 10 and 500 characters"),

  check("subjects")
    .optional()
    .isArray()
    .withMessage("Subjects must be an array")
    .notEmpty()
    .withMessage("At least one subject is required"),
];

export const updateStandardValidator = [
  check("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Name cannot be empty")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  check("description")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Description cannot be empty")
    .isLength({ min: 10, max: 500 })
    .withMessage("Description must be between 10 and 500 characters"),

  check("subjects")
    .optional()
    .isArray()
    .withMessage("Subjects must be an array")
    .notEmpty()
    .withMessage("At least one subject is required"),
]; 