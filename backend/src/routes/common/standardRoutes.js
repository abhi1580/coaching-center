import express from "express";
import {
  getStandards,
  getStandard,
} from "../../controllers/common/standardController.js";
import { protect } from "../../middleware/authMiddleware.js";

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// Routes accessible by all authenticated users
router.get("/", getStandards);
router.get("/:id", getStandard);

export default router; 