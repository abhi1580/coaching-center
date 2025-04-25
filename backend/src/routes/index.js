import express from "express";

// Import common routes
import authRoutes from "./authRoutes.js";
import standardRoutes from "./standardRoutes.js";
import subjectRoutes from "./subjectRoutes.js";
import batchRoutes from "./batchRoutes.js";
import announcementRoutes from "./announcementRoutes.js";
import attendanceRoutes from "./attendanceRoutes.js";

// Import role-specific routes
import adminDashboardRoutes from "./admin/dashboardRoutes.js";
import teacherRoutes from "./teacher/teacherRoutes.js";
import studentRoutes from "./student/studentRoutes.js";

const router = express.Router();

// Common routes
router.use("/auth", authRoutes);
router.use("/standards", standardRoutes);
router.use("/subjects", subjectRoutes);
router.use("/batches", batchRoutes);
router.use("/announcements", announcementRoutes);
router.use("/attendance", attendanceRoutes);

// Role-specific routes
router.use("/admin/dashboard", adminDashboardRoutes);
router.use("/teacher", teacherRoutes);
router.use("/student", studentRoutes);

export default router; 