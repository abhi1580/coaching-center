import express from "express";
import {
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
} from "../controllers/subjectController.js";
import { protect, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  createSubjectValidator,
  updateSubjectValidator,
} from "../middleware/validators/subjectValidators.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// Routes accessible by admin and staff
router
  .route("/")
  .get(authorize("admin", "staff", "teacher"), getSubjects)
  .post(authorize("admin"), createSubjectValidator, validate, createSubject);

router
  .route("/:id")
  .get(authorize("admin", "staff", "teacher"), getSubject)
  .put(authorize("admin"), updateSubjectValidator, validate, updateSubject)
  .delete(authorize("admin"), deleteSubject);

export default router;
