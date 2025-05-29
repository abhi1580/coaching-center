import express from "express";
import {
  register,
  getCurrentUser,
} from "../controllers/userController.js";
import { createUserValidator } from "../validators/userValidators.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

// Public routes
// ... existing code ...

// Protected routes
router.get("/me", protect, getCurrentUser);
router.post("/register", protect, authorize("admin"), createUserValidator, validate, register);

export default router;
