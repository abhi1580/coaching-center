import express from "express";
import {
  getTeachers,
  getTeacher,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getTeacherDashboard,
  getTeacherBatches,
  getTeacherProfile,
  updateTeacherProfile
} from "../controllers/teacherController.js";
import { protect, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  createTeacherValidator,
  updateTeacherValidator,
} from "../middleware/validators/teacherValidators.js";
import Teacher from "../models/Teacher.js";
import User from "../models/User.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// Teacher dashboard route - accessible by teacher role only
router.get("/dashboard", authorize("teacher"), getTeacherDashboard);

// Get teacher's batches - accessible by teacher role only
router.get("/batches", authorize("teacher"), getTeacherBatches);

// Get teacher's own profile - accessible by teacher role only
router.get("/me", authorize("teacher"), getTeacherProfile);

// Update teacher's own profile - accessible by teacher role only
router.put("/me", authorize("teacher"), updateTeacherProfile);

// Routes accessible by admin and staff
router
  .route("/")
  .get(authorize("admin", "staff"), getTeachers)
  .post(authorize("admin"), createTeacherValidator, validate, createTeacher);

router
  .route("/:id")
  .get(authorize("admin", "staff"), getTeacher)
  .put(authorize("admin"), updateTeacherValidator, validate, updateTeacher)
  .delete(authorize("admin"), deleteTeacher);

export default router;
