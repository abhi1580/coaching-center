import express from "express";
import {
  getTeachers,
  getTeacher,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from "../controllers/teacherController.js";
import { protect, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  createTeacherValidator,
  updateTeacherValidator,
} from "../middleware/validators/teacherValidators.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// Routes accessible by admin and staff
router
  .route("/")
  .get(authorize("admin", "staff"), getTeachers)
  .post(authorize("admin"), createTeacher);

router
  .route("/:id")
  .get(authorize("admin", "staff"), getTeacher)
  .put(authorize("admin"), updateTeacher)
  .delete(authorize("admin"), deleteTeacher);

export default router;
