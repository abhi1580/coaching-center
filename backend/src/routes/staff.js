import express from "express";
import {
  getStaff,
  getStaffMember,
  createStaff,
  updateStaff,
  deleteStaff,
} from "../controllers/staffController.js";
import { protect, authorize } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import {
  createStaffValidator,
  updateStaffValidator,
} from "../middleware/validators/staffValidators.js";

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

// All routes are admin-only
router.use(authorize("admin"));

router
  .route("/")
  .get(getStaff)
  .post(createStaffValidator, validate, createStaff);

router
  .route("/:id")
  .get(getStaffMember)
  .put(updateStaffValidator, validate, updateStaff)
  .delete(deleteStaff);

export default router;
