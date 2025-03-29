import express from "express";
import {
  getTeachers,
  getTeacher,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from "../controllers/teacherController.js";
import { protect, authorize } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import {
  createTeacherValidator,
  updateTeacherValidator,
} from "../middleware/validators/teacherValidators.js";

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

// All routes are admin-only
router.use(authorize("admin"));

router
  .route("/")
  .get(getTeachers)
  .post(createTeacherValidator, validate, createTeacher);

router
  .route("/:id")
  .get(getTeacher)
  .put(updateTeacherValidator, validate, updateTeacher)
  .delete(deleteTeacher);

export default router;
