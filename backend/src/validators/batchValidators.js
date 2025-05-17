import { body } from "express-validator";

export const createBatchValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Batch name is required")
    .isLength({ min: 2 })
    .withMessage("Batch name must be at least 2 characters long"),

  body("standard")
    .notEmpty()
    .withMessage("Standard is required")
    .isMongoId()
    .withMessage("Invalid standard ID"),

  body("subject")
    .notEmpty()
    .withMessage("Subject is required")
    .isMongoId()
    .withMessage("Invalid subject ID"),

  body("startDate")
    .notEmpty()
    .withMessage("Start date is required")
    .isISO8601()
    .withMessage("Invalid start date format"),

  body("endDate")
    .notEmpty()
    .withMessage("End date is required")
    .isISO8601()
    .withMessage("Invalid end date format")
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error("End date must be after start date");
      }
      return true;
    }),

  body("schedule.days")
    .isArray({ min: 1 })
    .withMessage("At least one day must be selected")
    .custom((value) => {
      const validDays = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ];
      return value.every((day) => validDays.includes(day));
    })
    .withMessage("Invalid day selection"),

  body("schedule.startTime")
    .notEmpty()
    .withMessage("Start time is required")
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Invalid start time format (HH:mm)"),

  body("schedule.endTime")
    .notEmpty()
    .withMessage("End time is required")
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Invalid end time format (HH:mm)")
    .custom((value, { req }) => {
      if (value <= req.body.schedule.startTime) {
        throw new Error("End time must be after start time");
      }
      return true;
    }),

  body("capacity")
    .notEmpty()
    .withMessage("Capacity is required")
    .isInt({ min: 1 })
    .withMessage("Capacity must be at least 1"),

  body("teacher").optional().isMongoId().withMessage("Invalid teacher ID"),

  body("status")
    .optional()
    .isIn(["upcoming", "active", "completed", "cancelled"])
    .withMessage("Invalid status"),

  body("description").optional().trim(),

  body("fees")
    .notEmpty()
    .withMessage("Fee is required")
    .isFloat({ min: 0 })
    .withMessage("Fee must be a positive number"),
];

export const updateBatchValidator = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Batch name must be at least 2 characters long"),

  body("standard").optional().isMongoId().withMessage("Invalid standard ID"),

  body("subject").optional().isMongoId().withMessage("Invalid subject ID"),

  body("startDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid start date format"),

  body("endDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid end date format")
    .custom((value, { req }) => {
      if (
        req.body.startDate &&
        new Date(value) <= new Date(req.body.startDate)
      ) {
        throw new Error("End date must be after start date");
      }
      return true;
    }),

  body("schedule.days")
    .optional()
    .isArray({ min: 1 })
    .withMessage("At least one day must be selected")
    .custom((value) => {
      const validDays = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ];
      return value.every((day) => validDays.includes(day));
    })
    .withMessage("Invalid day selection"),

  body("schedule.startTime")
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Invalid start time format (HH:mm)"),

  body("schedule.endTime")
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Invalid end time format (HH:mm)")
    .custom((value, { req }) => {
      if (
        req.body.schedule?.startTime &&
        value <= req.body.schedule.startTime
      ) {
        throw new Error("End time must be after start time");
      }
      return true;
    }),

  body("capacity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Capacity must be at least 1"),

  body("teacher").optional().isMongoId().withMessage("Invalid teacher ID"),

  body("status")
    .optional()
    .isIn(["upcoming", "active", "completed", "cancelled"])
    .withMessage("Invalid status"),

  body("description").optional().trim(),

  body("fees")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Fee must be a positive number"),
]; 