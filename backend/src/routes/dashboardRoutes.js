import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getStats,
  getRecentActivities,
  getUpcomingClasses,
} from "../controllers/dashboardController.js";

const router = express.Router();

// All routes are protected and require authentication
router.use(protect);

// Dashboard statistics
router.get("/stats", getStats);

// Recent activities (payments, enrollments, etc.)
router.get("/recent-activities", getRecentActivities);

// Upcoming classes
router.get("/upcoming-classes", getUpcomingClasses);

export default router;
