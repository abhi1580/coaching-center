import express from "express";
import {
  getClasses,
  getClass,
  createClass,
  updateClass,
  deleteClass,
} from "../controllers/classController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all classes
router.get("/", getClasses);

// Get class by ID
router.get("/:id", getClass);

// Create new class
router.post("/", createClass);

// Update class
router.put("/:id", updateClass);

// Delete class
router.delete("/:id", deleteClass);

export default router;
