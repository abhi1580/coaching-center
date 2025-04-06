import express from "express";
import {
  getAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcementController.js";
import { protect } from "../middleware/auth.js";
import { validateAnnouncement } from "../middleware/validators/announcementValidators.js";

const router = express.Router();

// Public routes
router.get("/", getAnnouncements);
router.get("/:id", getAnnouncement);

// Protected routes
router.post("/", protect, validateAnnouncement, createAnnouncement);
router.put("/:id", protect, validateAnnouncement, updateAnnouncement);
router.delete("/:id", protect, deleteAnnouncement);

export default router;
