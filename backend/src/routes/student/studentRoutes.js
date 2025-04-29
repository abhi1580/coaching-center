import express from "express";
import { protect, authorize } from "../../middleware/authMiddleware.js";
import {
  getStudentProfile,
  updateStudentProfile,
  getStudentBatches,
  getStudentBatchDetails,
} from "../../controllers/student/studentController.js";

const router = express.Router();

// Apply protection middleware to all routes - only students can access
router.use(protect);
router.use(authorize("student"));

// Student profile routes
router.route("/profile")
  .get(getStudentProfile)
  .put(updateStudentProfile);

// Student batches routes
router.get("/batches", getStudentBatches);
router.get("/batches/:id", getStudentBatchDetails);

export default router; 