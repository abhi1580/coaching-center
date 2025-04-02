import express from "express";
import {
  getStaff,
  getStaffMember,
  createStaff,
  updateStaff,
  deleteStaff,
} from "../controllers/staffController.js";
import { protect, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  createStaffValidator,
  updateStaffValidator,
} from "../middleware/validators/staffValidators.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// Routes accessible by admin
router
  .route("/")
  .get(authorize("admin"), getStaff)
  .post(authorize("admin"), createStaff);

router
  .route("/:id")
  .get(authorize("admin"), getStaffMember)
  .put(authorize("admin"), updateStaff)
  .delete(authorize("admin"), deleteStaff);

export default router;
