import { check } from "express-validator";

export const subjectValidator = [
  check("name", "Subject name is required").not().isEmpty(),
  check("description", "Description is required").not().isEmpty(),
  check("duration", "Duration is required").not().isEmpty(),
  check("price", "Price is required").isNumeric(),
];

export const updateSubjectValidator = [
  check("name", "Subject name is required").optional().not().isEmpty(),
  check("description", "Description is required").optional().not().isEmpty(),
  check("duration", "Duration is required").optional().not().isEmpty(),
  check("price", "Price must be a number").optional().isNumeric(),
];
