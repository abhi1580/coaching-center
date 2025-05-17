import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "./errorMiddleware.js";
import User from "../models/User.js";
import Student from "../models/Student.js";
import { errorResponse } from "../utils/responseUtil.js";

// Main authentication middleware
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new ApiError("Not authorized, no token provided", 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      throw new ApiError("User not found", 404);
    }

    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    
    if (error.name === "JsonWebTokenError") {
      throw new ApiError("Invalid token", 401);
    } else if (error.name === "TokenExpiredError") {
      throw new ApiError("Token expired", 401);
    } else {
      throw new ApiError("Not authorized", 401);
    }
  }
});

// Alias for backward compatibility with auth.js
export const authenticateToken = protect;

// Role-based authorization middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError("Not authorized, no user found", 401);
    }
    
    // Ensure role is a string and convert to lowercase for case-insensitive comparison
    const userRole = String(req.user.role).toLowerCase();
    const allowedRoles = roles.map((role) => String(role).toLowerCase());
    
    if (!allowedRoles.includes(userRole)) {
      throw new ApiError(`User role '${req.user.role}' is not authorized to access this route. Required roles: ${roles.join(', ')}`, 403);
    }
    
    next();
  };
};

// Student data access control middleware
export const studentOwnData = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw new ApiError("Not authorized, no user found", 401);
  }
  
  if (req.user.role !== "student") {
    return next();
  }
  
  const paramStudentId = req.params.studentId || req.params.id;
  
  if (!paramStudentId) {
    const student = await Student.findOne({ user: req.user.id });
    
    if (!student) {
      throw new ApiError("Student record not found for this user", 404);
    }
    
    req.student = student;
    return next();
  }
  
  const student = await Student.findOne({ user: req.user.id });
  
  if (!student) {
    throw new ApiError("Student record not found for this user", 404);
  }
  
  if (student._id.toString() !== paramStudentId) {
    throw new ApiError("Not authorized to access another student's data", 403);
  }
  
  req.student = student;
  next();
});
