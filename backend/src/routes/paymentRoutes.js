import express from "express";
import {
  getPayments,
  getPayment,
  createPayment,
  updatePayment,
  deletePayment,
  getStudentPayments,
  getBatchPayments,
} from "../controllers/paymentController.js";
import { protect, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  createPaymentValidator,
  updatePaymentValidator,
} from "../middleware/validators/paymentValidators.js";

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

// Admin and staff routes
router
  .route("/")
  .get(authorize("admin", "staff"), getPayments)
  .post(
    authorize("admin", "staff"),
    createPaymentValidator,
    validate,
    createPayment
  );

router
  .route("/:id")
  .get(authorize("admin", "staff"), getPayment)
  .put(
    authorize("admin", "staff"),
    updatePaymentValidator,
    validate,
    updatePayment
  )
  .delete(authorize("admin"), deletePayment);

// Get payments by student
router.get(
  "/student/:studentId",
  authorize("admin", "staff", "teacher"),
  getStudentPayments
);

// Get payments by batch
router.get("/batch/:batchId", authorize("admin", "staff"), getBatchPayments);

export default router;
