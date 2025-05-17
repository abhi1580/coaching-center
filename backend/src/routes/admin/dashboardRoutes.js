import express from "express";
import { protect, authorize } from "../../middleware/authMiddleware.js";
import {
  getDashboardSummary
} from "../../controllers/admin/dashboardController.js";

const router = express.Router();

// Apply protection middleware to all routes - only admins can access
router.use(protect);
router.use(authorize("admin"));

// Dashboard routes
router.get("/summary", getDashboardSummary);

export default router; 