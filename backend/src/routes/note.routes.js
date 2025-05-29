import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  uploadNote,
  getTeacherNotes,
  getBatchNotes,
  deleteNote,
} from "../controllers/note.controller.js";
import { upload } from "../utils/fileStorage.js";

const router = express.Router();

// Upload a new note (teacher only)
router.post(
  "/upload",
  protect,
  authorize("teacher"),
  upload.single("file"),
  uploadNote
);

// Get all notes for a teacher
router.get("/teacher", protect, authorize("teacher"), getTeacherNotes);

// Get all notes for a batch
router.get("/batch/:batchId", protect, getBatchNotes);

// Delete a note
router.delete("/:id", protect, authorize("teacher"), deleteNote);

export default router;
