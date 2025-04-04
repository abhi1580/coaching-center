import { check } from "express-validator";

export const createStudentValidator = [
  check("name", "Name is required").not().isEmpty(),
  check("email", "Please include a valid email").isEmail(),
  check("phone", "Phone number is required").not().isEmpty(),
  check("address", "Address is required").not().isEmpty(),
  check("parentName", "Parent name is required").not().isEmpty(),
  check("parentPhone", "Parent phone number is required").not().isEmpty(),
  check("classes", "Classes must be an array").optional().isArray(),
];

export const updateStudentValidator = [
  check("name", "Name is required").optional().not().isEmpty(),
  check("email", "Please include a valid email").optional().isEmail(),
  check("phone", "Phone number is required").optional().not().isEmpty(),
  check("address", "Address is required").optional().not().isEmpty(),
  check("parentName", "Parent name is required").optional().not().isEmpty(),
  check("parentPhone", "Parent phone number is required")
    .optional()
    .not()
    .isEmpty(),
  check("classes", "Classes must be an array").optional().isArray(),
  check("status", "Status must be either active or inactive")
    .optional()
    .isIn(["active", "inactive"]),
];
