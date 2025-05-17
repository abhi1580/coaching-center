import { check } from "express-validator";

export const createTeacherValidator = [
  check("name")
    .not().isEmpty().withMessage("Name is required")
    .isLength({ min: 3, max: 50 }).withMessage("Name must be between 3-50 characters"),
  check("email")
    .not().isEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please include a valid email")
    .matches(/@[^.]*\./).withMessage("Email must include a valid domain (e.g. @example.com)")
    .normalizeEmail(),
  check("phone")
    .not().isEmpty().withMessage("Phone number is required")
    .matches(/^[0-9]{10}$/).withMessage("Phone number must be exactly 10 digits"),
  check("gender")
    .isIn(["male", "female", "other"]).withMessage("Gender must be male, female, or other"),
  check("address")
    .not().isEmpty().withMessage("Address is required")
    .isLength({ min: 5, max: 200 }).withMessage("Address must be between 5-200 characters"),
  check("subjects")
    .isArray({ min: 1 }).withMessage("At least one subject is required"),
  check("qualification")
    .not().isEmpty().withMessage("Qualification is required")
    .isLength({ min: 2, max: 100 }).withMessage("Qualification must be between 2-100 characters"),
  check("experience")
    .isFloat({ min: 0, max: 50 }).withMessage("Experience must be a non-negative number up to 50 years"),
  check("joiningDate")
    .isISO8601().withMessage("Joining date must be a valid date"),
  check("salary")
    .isFloat({ min: 0 }).withMessage("Salary must be a positive number"),
  check("status")
    .optional()
    .isIn(["active", "inactive"]).withMessage("Status must be active or inactive"),
];

export const updateTeacherValidator = [
  check("name")
    .optional()
    .isLength({ min: 3, max: 50 }).withMessage("Name must be between 3-50 characters"),
  check("email")
    .optional()
    .isEmail().withMessage("Please include a valid email")
    .matches(/@[^.]*\./).withMessage("Email must include a valid domain (e.g. @example.com)")
    .normalizeEmail(),
  check("phone")
    .optional()
    .matches(/^[0-9]{10}$/).withMessage("Phone number must be exactly 10 digits"),
  check("gender")
    .optional()
    .isIn(["male", "female", "other"]).withMessage("Gender must be male, female, or other"),
  check("address")
    .optional()
    .isLength({ min: 5, max: 200 }).withMessage("Address must be between 5-200 characters"),
  check("subjects")
    .optional()
    .isArray({ min: 1 }).withMessage("At least one subject is required"),
  check("qualification")
    .optional()
    .isLength({ min: 2, max: 100 }).withMessage("Qualification must be between 2-100 characters"),
  check("experience")
    .optional()
    .isFloat({ min: 0, max: 50 }).withMessage("Experience must be a non-negative number up to 50 years"),
  check("joiningDate")
    .optional()
    .isISO8601().withMessage("Joining date must be a valid date"),
  check("salary")
    .optional()
    .isFloat({ min: 0 }).withMessage("Salary must be a positive number"),
  check("status")
    .optional()
    .isIn(["active", "inactive"]).withMessage("Status must be active or inactive"),
  check("password")
    .optional()
    .isLength({ min: 6, max: 30 }).withMessage("Password must be between 6-30 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage("Password must contain at least one uppercase letter, one lowercase letter, and one number"),
]; 