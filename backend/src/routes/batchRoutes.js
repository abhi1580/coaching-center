import express from "express";
import {
  getAllBatches,
  getBatchById,
  createBatch,
  updateBatch,
  deleteBatch,
  getBatchesBySubject,
} from "../controllers/batchController.js";
import {
  createBatchValidator,
  updateBatchValidator,
} from "../middleware/validators/batchValidators.js";
import { protect, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Get all batches
router.get("/", authorize("admin", "staff", "teacher"), getAllBatches);

// Get batches by subject
router.get(
  "/by-subject",
  authorize("admin", "staff", "teacher"),
  getBatchesBySubject
);

// Get single batch
router.get("/:id", authorize("admin", "staff", "teacher"), getBatchById);

// Create new batch
router.post(
  "/",
  authorize("admin"),
  createBatchValidator,
  validate,
  createBatch
);

// Update batch
router.put(
  "/:id",
  authorize("admin"),
  updateBatchValidator,
  validate,
  updateBatch
);

// Delete batch
router.delete("/:id", authorize("admin"), deleteBatch);

export default router;
