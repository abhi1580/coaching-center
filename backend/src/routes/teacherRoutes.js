import express from "express";
import {
  getTeachers,
  getTeacher,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getTeacherBatches,
  getTeacherProfile,
  updateTeacherProfile,
} from "../controllers/teacherController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import {
  createTeacherValidator,
  updateTeacherValidator,
} from "../validators/teacherValidators.js";
import Teacher from "../models/Teacher.js";
import User from "../models/User.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// Get teacher's batches - accessible by teacher role only
router.get("/batches", authorize("teacher"), getTeacherBatches);

// Get teacher's own profile - accessible by teacher role only
router.get("/me", authorize("teacher"), getTeacherProfile);

// Update teacher's own profile - accessible by teacher role only
router.put("/me", authorize("teacher"), updateTeacherProfile);

// Routes accessible by admin
router
  .route("/")
  .get(authorize("admin"), getTeachers)
  .post(authorize("admin"), createTeacherValidator, validate, createTeacher);

router
  .route("/:id")
  .get(authorize("admin"), getTeacher)
  .put(authorize("admin"), updateTeacherValidator, validate, updateTeacher)
  .delete(authorize("admin"), deleteTeacher);

export default router;
