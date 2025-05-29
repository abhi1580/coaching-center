import express from "express";
import {
  getAllStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentClasses,
} from "../controllers/studentController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import {
  createStudentValidator,
  updateStudentValidator,
} from "../validators/studentValidators.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// Routes accessible by admin and teacher
router
  .route("/")
  .get(authorize("admin", "teacher"), getAllStudents)
  .post(authorize("admin"), createStudent);

router
  .route("/:id")
  .get(authorize("admin", "teacher"), getStudent)
  .put(authorize("admin"), updateStudent)
  .delete(authorize("admin"), deleteStudent);

// Additional routes for student details
router
  .route("/:id/classes")
  .get(authorize("admin", "teacher"), getStudentClasses);

export default router;
