import express from "express";
import { protect } from "../middleware/auth.js";
import dashboardController from "../controllers/dashboardController.js";

const router = express.Router();

// All routes are protected and require authentication
router.use(protect);

// Dashboard statistics
router.get("/stats", dashboardController.getStats);

// Recent activities (payments, enrollments, etc.)
router.get("/recent-activities", dashboardController.getRecentActivities);

// Upcoming classes
router.get("/upcoming-classes", dashboardController.getUpcomingClasses);

export default router;
