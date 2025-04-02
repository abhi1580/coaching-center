import { body } from "express-validator";

export const createSubjectValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Subject name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Subject name must be between 2 and 100 characters"),
  
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),
  
  body("duration")
    .trim()
    .notEmpty()
    .withMessage("Duration is required"),
  
  body("status")
    .optional()
    .isIn(["active", "inactive"])
    .withMessage("Status must be either 'active' or 'inactive'"),
];

export const updateSubjectValidator = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Subject name must be between 2 and 100 characters"),
  
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),
  
  body("duration")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Duration is required"),
  
  body("status")
    .optional()
    .isIn(["active", "inactive"])
    .withMessage("Status must be either 'active' or 'inactive'"),
];
