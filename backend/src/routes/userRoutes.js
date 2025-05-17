import express from "express";
import {
  register,
  login,
  getCurrentUser,
} from "../controllers/userController.js";
import { createUserValidator } from "../validators/userValidators.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

// Public routes
router.post("/login", login);

// Protected routes
router.get("/me", protect, getCurrentUser);

// Admin only routes
router.post(
  "/register",
  protect,
  authorize(["admin"]),
  createUserValidator,
  validate,
  register
);

export default router;
