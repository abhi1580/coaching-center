import express from "express";
import {
  getStandards,
  getStandard,
  createStandard,
  updateStandard,
  deleteStandard,
} from "../controllers/standardController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  standardValidator,
  updateStandardValidator,
} from "../middleware/validators/standardValidators.js";

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// Public routes (authenticated users)
router.get("/", getStandards);
router.get("/:id", getStandard);

// Admin only routes
router.post("/", standardValidator, validateRequest, createStandard);
router.put("/:id", updateStandardValidator, validateRequest, updateStandard);
router.delete("/:id", deleteStandard);

export default router;
