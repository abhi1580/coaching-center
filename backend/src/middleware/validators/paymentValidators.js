import { check } from "express-validator";

export const createPaymentValidator = [
  check("student", "Student ID is required").isMongoId(),
  check("batch", "Batch ID is required").isMongoId(),
  check("amount", "Amount must be a positive number")
    .isFloat({ min: 0 })
    .not()
    .isEmpty(),
  check("paymentMethod", "Payment method is required")
    .isIn(["cash", "card", "bank transfer", "other"])
    .not()
    .isEmpty(),
  check("description", "Description is required").optional().trim(),
];

export const updatePaymentValidator = [
  check("amount", "Amount must be a positive number")
    .optional()
    .isFloat({ min: 0 }),
  check("paymentMethod", "Invalid payment method")
    .optional()
    .isIn(["cash", "card", "bank transfer", "other"]),
  check("status", "Invalid payment status")
    .optional()
    .isIn(["pending", "completed", "failed", "refunded"]),
  check("description", "Description is required").optional().trim(),
];
