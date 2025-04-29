import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  getBatchAttendance,
  submitBatchAttendance,
  getBatchAttendanceHistory,
  getStudentAttendance
} from "../controllers/attendanceController.js";

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

// Get attendance history for a batch
router
  .route("/batch/:batchId/history")
  .get(authorize("admin", "teacher"), getBatchAttendanceHistory);

// Get attendance for a specific student
router
  .route("/student/:studentId/batch/:batchId")
  .get(protect, authorize("admin", "teacher"), getStudentAttendance);

export default router; 