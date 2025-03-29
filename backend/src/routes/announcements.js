import express from "express";
import {
  getAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcementController.js";
import { authenticateToken } from "../middleware/auth.js";
import { validateAnnouncement } from "../middleware/validators/announcementValidators.js";

const router = express.Router();

// Public routes
router.get("/", getAnnouncements);
router.get("/:id", getAnnouncement);

// Protected routes
router.post("/", authenticateToken, validateAnnouncement, createAnnouncement);
router.put("/:id", authenticateToken, validateAnnouncement, updateAnnouncement);
router.delete("/:id", authenticateToken, deleteAnnouncement);

export default router;
