import express from "express";
import {
  login,
  getMe,
  forgotPassword,
  resetPassword,
  createUser,
  createAdmin,
  logout,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  createAdminValidator,
} from "../middleware/validators/authValidators.js";

const router = express.Router();

// Public routes
router.post("/login", loginValidator, validate, login);
router.post(
  "/forgot-password",
  forgotPasswordValidator,
  validate,
  forgotPassword
);
router.post("/reset-password", resetPasswordValidator, validate, resetPassword);
router.post("/create-admin", createAdminValidator, validate, createAdmin);

// Protected routes
router.get("/me", protect, getMe);

// Admin-only routes
router.post("/create-user", protect, createUser);
router.post("/logout", protect, logout);

export default router;
