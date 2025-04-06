import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";
import Staff from "../models/Staff.js";
import { sendEmail } from "../utils/email.js";
import mongoose from "mongoose";

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc    Create user (admin only)
// @route   POST /api/auth/create-user
// @access  Private (Admin only)
export const createUser = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can create users",
      });
    }

    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      role,
      // Student specific fields
      parentName,
      parentPhone,
      // Teacher specific fields
      subjects,
      qualification,
      experience,
      // Staff specific fields
      department,
      designation,
      joiningDate,
      salary,
    } = req.body;

    // Validate role
    if (!["student", "teacher", "staff"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Can only create students, teachers, or staff",
      });
    }

    // Validate required fields based on role
    if (!firstName || !lastName || !email || !password || !phone || !role) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Create user
    const user = await User.create({
      name: `${firstName} ${lastName}`,
      email,
      password,
      phone,
      role,
    });

    // Create role-specific document
    let roleDoc;
    switch (role) {
      case "student":
        if (!parentName || !parentPhone) {
          return res.status(400).json({
            success: false,
            message: "Please provide all required student fields",
          });
        }
        roleDoc = await Student.create({
          user: user._id,
          parentName,
          parentPhone,
        });
        break;
      case "teacher":
        if (!subjects || !qualification || !experience) {
          return res.status(400).json({
            success: false,
            message: "Please provide all required teacher fields",
          });
        }
        roleDoc = await Teacher.create({
          user: user._id,
          subjects,
          qualification,
          experience,
        });
        break;
      case "staff":
        if (!department || !designation || !joiningDate || !salary) {
          return res.status(400).json({
            success: false,
            message: "Please provide all required staff fields",
          });
        }
        roleDoc = await Staff.create({
          user: user._id,
          department,
          designation,
          joiningDate,
          salary,
        });
        break;
    }

    res.status(201).json({
      success: true,
      message: `${role} created successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in creating user",
      error: error.message,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token with role
    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in login",
      error: error.message,
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in getting user",
      error: error.message,
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate reset token
    const resetToken = user.getResetPasswordToken();
    await user.save();

    // Create reset url
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/auth/resetpassword/${resetToken}`;

    // Send email
    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    await sendEmail({
      email: user.email,
      subject: "Password reset token",
      message,
    });

    res.json({
      success: true,
      message: "Email sent",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in forgot password",
      error: error.message,
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { resettoken } = req.params;
    const { password } = req.body;

    // Get hashed token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(resettoken)
      .digest("hex");

    // Find user by reset token
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid token",
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Generate token
    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in reset password",
      error: error.message,
    });
  }
};

// @desc    Create admin user (special case for first admin)
// @route   POST /api/auth/create-admin
// @access  Public or Admin only after first admin
export const createAdmin = async (req, res) => {
  try {
    // Check if admin users already exist
    const adminExists = await User.findOne({ role: "admin" });

    // After first admin, only admin can create more admins
    if (adminExists) {
      // Get token from header
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized - No token provided",
        });
      }

      try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user || user.role !== "admin") {
          return res.status(401).json({
            success: false,
            message: "Unauthorized - Only admins can create other admins",
          });
        }
      } catch (err) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized - Invalid token",
          error: err.message,
        });
      }
    }

    // Extract data from request body
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      address,
      gender = "male",
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        requiredFields: ["firstName", "lastName", "email", "password"],
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Create user with admin role
    const user = await User.create({
      name: `${firstName} ${lastName}`,
      email,
      password,
      phone,
      address,
      gender,
      role: "admin",
    });

    // Generate token
    const token = generateToken(user._id, "admin");

    // Verify user was created
    const verifyUser = await User.findById(user._id);

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating admin",
      error: error.message,
    });
  }
};

export const logout = async (req, res) => {
  try {
    // Clear the token from the client
    res.clearCookie("token");

    // Send success response
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error during logout",
      error: error.message,
    });
  }
};
