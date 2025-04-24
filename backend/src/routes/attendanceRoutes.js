import express from "express";
import {
  getBatchAttendance,
  submitBatchAttendance,
  getStudentAttendance,
  getStudentAttendanceStats,
  getBatchAttendanceStats
} from "../controllers/attendanceController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Get/Submit batch attendance routes
router
  .route("/batch/:batchId")
  .post(authorize("admin", "teacher"), submitBatchAttendance);

// Get attendance for a specific batch on a specific date
router
  .route("/:batchId/:date")
  .get(authorize("admin", "teacher"), getBatchAttendance);

// Get attendance history for a student in a batch
router
  .route("/student/:studentId/:batchId")
  .get(authorize("admin", "teacher", "student"), getStudentAttendance);

// Get attendance statistics for a student
router
  .route("/statistics/student/:studentId")
  .get(authorize("admin", "teacher", "student"), getStudentAttendanceStats);

// Get attendance statistics for a batch
router
  .route("/statistics/batch/:batchId")
  .get(authorize("admin", "teacher"), getBatchAttendanceStats);

export default router; 