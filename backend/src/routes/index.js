import express from "express";

// Import common routes
import authRoutes from "./authRoutes.js";
import standardRoutes from "./standardRoutes.js";
import subjectRoutes from "./subjectRoutes.js";
import batchRoutes from "./batchRoutes.js";
import announcementRoutes from "./announcementRoutes.js";
import attendanceRoutes from "./attendanceRoutes.js";
import dashboardRoutes from "./dashboardRoutes.js";
import teacherRoutes from "./teacherRoutes.js";
import studentRoutes from "./studentRoutes.js";

// Import role-specific routes
import adminDashboardRoutes from "./admin/dashboardRoutes.js";
import teacherSpecificRoutes from "./teacher/teacherRoutes.js";
import studentSpecificRoutes from "./student/studentRoutes.js";

const router = express.Router();

// Common routes
router.use("/auth", authRoutes);
router.use("/standards", standardRoutes);
router.use("/subjects", subjectRoutes);
router.use("/batches", batchRoutes);
router.use("/announcements", announcementRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/teachers", teacherRoutes);
router.use("/students", studentRoutes);

// Role-specific routes
router.use("/admin/dashboard", adminDashboardRoutes);
router.use("/teacher", teacherSpecificRoutes);
router.use("/student", studentSpecificRoutes);

export default router; 