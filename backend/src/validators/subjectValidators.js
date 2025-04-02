import { body } from "express-validator";

export const createSubjectValidator = [
  body("name").trim().notEmpty().withMessage("Subject name is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("duration").trim().notEmpty().withMessage("Duration is required"),
  body("status")
    .optional()
    .isIn(["active", "inactive"])
    .withMessage("Status must be either 'active' or 'inactive'"),
];

export const updateSubjectValidator = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Subject name is required"),
  body("description")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Description is required"),
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
