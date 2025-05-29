import express from "express";
import {
  login,
  getMe,
  forgotPassword,
  resetPassword,
  createUser,
  createAdmin,
  logout,
  changePassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import {
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  createAdminValidator,
  changePasswordValidator,
} from "../validators/authValidators.js";
import crypto from "crypto";

const router = express.Router();

// Function to generate CSRF token
const generateCsrfToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Public routes
router.post("/login", loginValidator, validate, login);
router.post(
  "/forgot-password",
  forgotPasswordValidator,
  validate,
  forgotPassword
);
router.post("/reset-password", resetPasswordValidator, validate, resetPassword);

// Special route for creating admin - doesn't require auth for first admin
router.post("/create-admin", createAdminValidator, validate, createAdmin);

// Protected routes
router.get("/me", protect, getMe);
router.post(
  "/change-password",
  protect,
  changePasswordValidator,
  validate,
  changePassword
);

// Admin-only routes
router.post("/create-user", protect, createUser);
router.post("/logout", protect, logout);

// CSRF token endpoint
router.get("/csrf-token", (req, res) => {
  try {
    console.log("CSRF token endpoint called");
    
    // Generate a new token
    const token = generateCsrfToken();
    console.log("Generated new CSRF token:", token);
    
    // Set cookie with explicit options
    res.cookie("X-CSRF-Token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });
    
    // Send token in response
    res.json({
      success: true,
      token: token
    });
  } catch (error) {
    console.error("Error in CSRF token endpoint:", error);
    res.status(500).json({
      success: false,
      message: "Error generating CSRF token"
    });
  }
});

export default router;
