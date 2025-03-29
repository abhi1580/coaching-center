import { check } from "express-validator";

export const loginValidator = [
  check("email", "Please include a valid email").isEmail(),
  check("password", "Password is required").exists(),
];

export const forgotPasswordValidator = [
  check("email", "Please include a valid email").isEmail(),
];

export const resetPasswordValidator = [
  check(
    "password",
    "Please enter a password with 6 or more characters"
  ).isLength({
    min: 6,
  }),
];
