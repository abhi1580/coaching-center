import express from "express";
import { body } from "express-validator";
import {
  getAllBatches,
  getBatchById,
  createBatch,
  updateBatch,
  deleteBatch,
} from "../controllers/batchController.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = express.Router();

// Validation middleware
const batchValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("standard").trim().notEmpty().withMessage("Standard is required"),
  body("subject").trim().notEmpty().withMessage("Subject is required"),
  body("startDate").trim().notEmpty().withMessage("Start date is required"),
  body("endDate").trim().notEmpty().withMessage("End date is required"),
  body("schedule.days").isArray().withMessage("Schedule days must be an array"),
  body("schedule.startTime")
    .trim()
    .notEmpty()
    .withMessage("Start time is required"),
  body("schedule.endTime")
    .trim()
    .notEmpty()
    .withMessage("End time is required"),
  body("capacity").isInt({ min: 1 }).withMessage("Capacity must be at least 1"),
  body("fees.amount")
    .isFloat({ min: 0 })
    .withMessage("Fee amount must be a positive number"),
  body("fees.frequency")
    .isIn(["monthly", "quarterly", "yearly"])
    .withMessage("Invalid fee frequency"),
  body("status")
    .isIn(["upcoming", "ongoing", "completed", "cancelled"])
    .withMessage("Invalid status"),
  body("teacher").trim().notEmpty().withMessage("Teacher is required"),
  body("description").optional().trim(),
];

// Routes
router.get("/", getAllBatches);
router.get("/:id", getBatchById);
router.post("/", batchValidation, validateRequest, createBatch);
router.put("/:id", batchValidation, validateRequest, updateBatch);
router.delete("/:id", deleteBatch);

export default router;
