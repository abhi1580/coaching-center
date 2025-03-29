import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { errorResponse } from "../utils/errorResponse.js";

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return errorResponse(res, 401, "Access token is required");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return errorResponse(res, 401, "User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return errorResponse(res, 401, "Invalid token");
    }
    if (error.name === "TokenExpiredError") {
      return errorResponse(res, 401, "Token expired");
    }
    errorResponse(res, 500, "Internal server error");
  }
};

// Alias for authenticateToken to maintain compatibility with existing imports
export const protect = authenticateToken;

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};
