import Joi from "joi";

export const validateClass = (data) => {
  const schema = Joi.object({
    name: Joi.string().required().messages({
      "string.empty": "Class name is required",
      "any.required": "Class name is required",
    }),
    grade: Joi.string().required().messages({
      "string.empty": "Grade is required",
      "any.required": "Grade is required",
    }),
    subjects: Joi.array().items(Joi.string()).min(1).required().messages({
      "array.min": "At least one subject is required",
      "any.required": "Subjects are required",
    }),
    teacher: Joi.string().required().messages({
      "string.empty": "Teacher is required",
      "any.required": "Teacher is required",
    }),
    schedule: Joi.object({
      days: Joi.array().items(Joi.string()).min(1).required().messages({
        "array.min": "At least one day is required",
        "any.required": "Schedule days are required",
      }),
      time: Joi.string().required().messages({
        "string.empty": "Class time is required",
        "any.required": "Class time is required",
      }),
    }).required(),
    duration: Joi.string().required().messages({
      "string.empty": "Duration is required",
      "any.required": "Duration is required",
    }),
    fees: Joi.number().min(0).required().messages({
      "number.base": "Fees must be a number",
      "number.min": "Fees cannot be negative",
      "any.required": "Fees is required",
    }),
    mode: Joi.string().valid("Offline", "Online", "Hybrid").required().messages({
      "any.only": "Mode must be either Offline, Online, or Hybrid",
      "any.required": "Mode is required",
    }),
    location: Joi.string().required().messages({
      "string.empty": "Location is required",
      "any.required": "Location is required",
    }),
    status: Joi.string().valid("Active", "Inactive").required().messages({
      "any.only": "Status must be either Active or Inactive",
      "any.required": "Status is required",
    }),
  });

  return schema.validate(data);
}; 