import express from "express";
import { protect, authorize } from "../../middleware/authMiddleware.js";
import {
  getTeacherProfile,
  updateTeacherProfile,
  getTeacherBatches,
  getTeacherBatchDetails,
  getTeacherStudents
} from "../../controllers/teacher/teacherController.js";
import { getTeacherDashboard } from "../../controllers/teacherController.js";

const router = express.Router();

// Apply protection middleware to all routes - only teachers can access
router.use(protect);
router.use(authorize("teacher"));

// Teacher dashboard route
router.get("/dashboard", getTeacherDashboard);

// Teacher profile routes
router.route("/profile")
  .get(getTeacherProfile)
  .put(updateTeacherProfile);

// Teacher batches routes
router.get("/batches", getTeacherBatches);
router.get("/batches/:id", getTeacherBatchDetails);

// Teacher students route
router.get("/students", getTeacherStudents);

export default router; 