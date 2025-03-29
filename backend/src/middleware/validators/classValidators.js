import { check } from "express-validator";

export const createClassValidator = [
  check("name", "Name is required").not().isEmpty(),
  check("subject", "Subject is required").not().isEmpty(),
  check("teacher", "Teacher ID is required").isMongoId(),
  check("schedule", "Schedule is required").not().isEmpty(),
  check("capacity", "Capacity must be a positive number")
    .isInt({ min: 1 })
    .not()
    .isEmpty(),
  check("startDate", "Start date is required").isISO8601().toDate(),
  check("endDate", "End date is required").isISO8601().toDate(),
  check("fees", "Fees must be a positive number")
    .isFloat({ min: 0 })
    .not()
    .isEmpty(),
];

export const updateClassValidator = [
  check("name", "Name is required").optional().not().isEmpty(),
  check("subject", "Subject is required").optional().not().isEmpty(),
  check("teacher", "Teacher ID is required").optional().isMongoId(),
  check("schedule", "Schedule is required").optional().not().isEmpty(),
  check("capacity", "Capacity must be a positive number")
    .optional()
    .isInt({ min: 1 }),
  check("startDate", "Start date is required").optional().isISO8601().toDate(),
  check("endDate", "End date is required").optional().isISO8601().toDate(),
  check("fees", "Fees must be a positive number")
    .optional()
    .isFloat({ min: 0 }),
  check("status", "Status must be active, inactive, or completed")
    .optional()
    .isIn(["active", "inactive", "completed"]),
];

export const addStudentValidator = [
  check("studentId", "Student ID is required").isMongoId(),
];
