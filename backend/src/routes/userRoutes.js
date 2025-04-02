import express from "express";
import { register, login, getCurrentUser } from "../controllers/userController.js";
import { validateRegistration } from "../validators/userValidators.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/login", login);

// Protected routes
router.get("/me", authenticate, getCurrentUser);

// Admin only routes
router.post(
  "/register",
  authenticate,
  authorize(["admin"]),
  validateRegistration,
  register
);

export default router; 