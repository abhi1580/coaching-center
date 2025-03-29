import { check } from "express-validator";

export const createStaffValidator = [
  check("name", "Name is required").not().isEmpty(),
  check("email", "Please include a valid email").isEmail(),
  check(
    "password",
    "Please enter a password with 6 or more characters"
  ).isLength({
    min: 6,
  }),
  check("phone", "Phone number is required").not().isEmpty(),
  check("address", "Address is required").not().isEmpty(),
  check("department", "Department is required").isIn([
    "administration",
    "accounts",
    "reception",
    "other",
  ]),
  check("designation", "Designation is required").not().isEmpty(),
  check("joiningDate", "Joining date is required").isISO8601(),
  check("salary", "Salary must be a positive number").isFloat({ min: 0 }),
];

export const updateStaffValidator = [
  check("name", "Name is required").optional().not().isEmpty(),
  check("email", "Please include a valid email").optional().isEmail(),
  check("phone", "Phone number is required").optional().not().isEmpty(),
  check("address", "Address is required").optional().not().isEmpty(),
  check("department", "Department is required")
    .optional()
    .isIn(["administration", "accounts", "reception", "other"]),
  check("designation", "Designation is required").optional().not().isEmpty(),
  check("joiningDate", "Joining date is required").optional().isISO8601(),
  check("salary", "Salary must be a positive number")
    .optional()
    .isFloat({ min: 0 }),
  check("status", "Status must be active or inactive")
    .optional()
    .isIn(["active", "inactive"]),
];
