import express from "express";
import {
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
} from "../controllers/subjectController.js";
import { protect } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import {
  subjectValidator,
  updateSubjectValidator,
} from "../middleware/validators/subjectValidators.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Public routes (for authenticated users)
router.get("/", getSubjects);
router.get("/:id", getSubject);

// Admin only routes
router.post("/", subjectValidator, validate, createSubject);
router.put("/:id", updateSubjectValidator, validate, updateSubject);
router.delete("/:id", deleteSubject);

export default router;
