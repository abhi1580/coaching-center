import express from "express";
import {
  getAllStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentClasses,
  getStudentPayments,
} from "../controllers/studentController.js";
import { protect, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  createStudentValidator,
  updateStudentValidator,
} from "../middleware/validators/studentValidators.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// Routes accessible by admin and staff
router
  .route("/")
  .get(authorize("admin", "staff", "teacher"), getAllStudents)
  .post(authorize("admin", "staff"), createStudent);

router
  .route("/:id")
  .get(authorize("admin", "staff", "teacher"), getStudent)
  .put(authorize("admin", "staff"), updateStudent)
  .delete(authorize("admin"), deleteStudent);

// Additional routes for student details
router
  .route("/:id/classes")
  .get(authorize("admin", "staff", "teacher"), getStudentClasses);

router
  .route("/:id/payments")
  .get(authorize("admin", "staff"), getStudentPayments);

export default router;
