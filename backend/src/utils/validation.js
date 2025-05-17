import mongoose from "mongoose";

// Validate MongoDB ObjectId (returns boolean)
export const validateObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Validate MongoDB ObjectId (throws error)
export const validateMongoDbId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid MongoDB ID");
  }
};

// Validate email format
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number (10 digits)
export const validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone);
};

// Validate date format (YYYY-MM-DD)
export const validateDate = (date) => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return dateRegex.test(date);
};

// Validate percentage (0-100)
export const validatePercentage = (percentage) => {
  return percentage >= 0 && percentage <= 100;
};
