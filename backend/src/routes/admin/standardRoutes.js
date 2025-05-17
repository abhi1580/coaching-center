import express from "express";
import {
  createStandard,
  updateStandard,
  deleteStandard,
} from "../../controllers/admin/standardController.js";
import { protect, authorize } from "../../middleware/authMiddleware.js";
import { validateRequest } from "../../middleware/validate.js";
import {  standardValidator,  updateStandardValidator,} from "../../validators/standardValidators.js";

const router = express.Router();

// Apply protection middleware to all routes
router.use(protect);
router.use(authorize("admin"));

// Admin only routes
router.post("/", standardValidator, validateRequest, createStandard);
router.put("/:id", updateStandardValidator, validateRequest, updateStandard);
router.delete("/:id", deleteStandard);

export default router; 