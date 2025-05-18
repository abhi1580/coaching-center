import express from "express";
import {
  getAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcementController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateAnnouncement } from "../validators/announcementValidators.js";

const router = express.Router();

// Protected routes
router.get("/", protect, getAnnouncements);
router.get("/:id", protect, getAnnouncement);
router.post("/", protect, validateAnnouncement, createAnnouncement);
router.put("/:id", protect, validateAnnouncement, updateAnnouncement);
router.delete("/:id", protect, deleteAnnouncement);

export default router;
