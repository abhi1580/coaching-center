import { check } from "express-validator";

export const validateAnnouncement = [
  check("title", "Title is required").trim().notEmpty(),
  check("content", "Content is required").trim().notEmpty(),
  check("priority", "Invalid priority level")
    .optional()
    .isIn(["low", "normal", "high"]),
];
