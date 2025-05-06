import { check } from "express-validator";

export const createStudentValidator = [
  check("name", "Name is required").not().isEmpty(),
  check("email", "Please include a valid email").isEmail(),
  check("phone", "Phone number is required").not().isEmpty(),
  check("address", "Address is required").not().isEmpty(),
  check("parentName", "Parent name is required").not().isEmpty(),
  check("parentPhone", "Parent phone number is required").not().isEmpty(),
  check("classes", "Classes must be an array").optional().isArray(),
  check("password", "Password is required and must be at least 6 characters")
    .isLength({ min: 6 })
    .not()
    .isEmpty(),
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
  // Password is optional for updates
  check("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];
