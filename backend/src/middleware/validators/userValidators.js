import { check } from "express-validator";

export const createUserValidator = [
  check("name", "Name is required").not().isEmpty(),
  check("email", "Please include a valid email").isEmail(),
  check(
    "password",
    "Please enter a password with 6 or more characters"
  ).isLength({ min: 6 }),
  check("phone", "Phone number is required").not().isEmpty(),
  check("address", "Address is required").not().isEmpty(),
  check("role", "Role must be admin, teacher, or staff").isIn([
    "admin",
    "teacher",
    "staff",
  ]),
];

export const updateUserValidator = [
  check("name", "Name is required").not().isEmpty(),
  check("email", "Please include a valid email").isEmail(),
  check("phone", "Phone number is required").not().isEmpty(),
  check("address", "Address is required").not().isEmpty(),
  check("role", "Role must be admin, teacher, or staff").isIn([
    "admin",
    "teacher",
    "staff",
  ]),
];

export const updatePasswordValidator = [
  check(
    "password",
    "Please enter a password with 6 or more characters"
  ).isLength({ min: 6 }),
];
