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
    console.error("User creation error:", error);
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

    console.log(`Login attempt for email: ${email}`);

    // Check if user exists
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      console.log(`User not found for email: ${email}`);
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    console.log(`User found with role: ${user.role}`);

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log(`Password mismatch for user: ${email}`);
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    console.log(`Login successful for user: ${email}, role: ${user.role}`);

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
    console.error("Login error:", error);
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

// @desc    Create admin user (Super admin only or first admin)
// @route   POST /api/auth/create-admin
// @access  Private (Super admin only) or Public (for first admin)
export const createAdmin = async (req, res) => {
  try {
    console.log("Starting admin user creation process...");
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    // Check if any admin exists
    console.log("Checking for existing admin users...");
    const adminExists = await User.findOne({ role: "admin" });
    console.log("Admin exists:", !!adminExists);

    // If admin exists, require authentication
    if (adminExists) {
      // For the first admin creation, we need to check if there's token in the header
      // NOTE: This route is public so req.user might not be set by any middleware
      // We need to manually check the authorization header
      console.log("Authorization header:", req.headers.authorization);

      const authHeader = req.headers.authorization;
      if (!authHeader) {
        console.log(
          "No authorization header found for subsequent admin creation"
        );
        // Allow creation if this is potentially the first admin (if adminExists was stale)
        const doubleCheck = await User.countDocuments({ role: "admin" });
        if (doubleCheck > 0) {
          return res.status(401).json({
            success: false,
            message: "Authentication required to create additional admin users",
          });
        } else {
          console.log(
            "Double-check confirmed no admins exist, allowing creation"
          );
        }
      } else {
        try {
          // Extract and verify token
          const token = authHeader.split(" ")[1];
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const user = await User.findById(decoded.id);

          if (!user || user.role !== "admin") {
            console.log("Unauthorized attempt to create admin");
            return res.status(403).json({
              success: false,
              message: "Only existing admins can create other admin users",
            });
          }
        } catch (err) {
          console.log("Token verification failed:", err.message);
          return res.status(401).json({
            success: false,
            message: "Invalid authentication token",
          });
        }
      }
    } else {
      console.log(
        "No admin users exist yet, allowing creation without authentication"
      );
    }

    const { firstName, lastName, email, password, phone, address, gender } =
      req.body;

    console.log("Validating required fields...");
    // Validate required fields
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !phone ||
      !address ||
      !gender
    ) {
      console.log("Missing required fields:", {
        firstName: !!firstName,
        lastName: !!lastName,
        email: !!email,
        password: !!password,
        phone: !!phone,
        address: !!address,
        gender: !!gender,
      });
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Check if user exists
    console.log("Checking if user exists with email:", email);
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log("User already exists with email:", email);
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    console.log("Creating new admin user...");
    console.log("Preparing user data:", {
      name: `${firstName} ${lastName}`,
      email,
      phone,
      address,
      gender,
      role: "admin",
      status: "active",
    });

    // Create admin user
    console.log("Attempting to save user to database...");
    const admin = await User.create({
      name: `${firstName} ${lastName}`,
      email,
      password,
      phone,
      address,
      gender,
      role: "admin",
      status: "active",
    });
    console.log("User saved successfully to database");

    console.log("Admin user created successfully:", {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    });

    // Verify the user was actually created in the database
    console.log("Verifying user in database...");
    const verifyUser = await User.findById(admin._id);
    console.log("Verification result:", verifyUser ? "Success" : "Failed");
    if (verifyUser) {
      console.log("Verified user details:", {
        id: verifyUser._id,
        name: verifyUser.name,
        email: verifyUser.email,
        role: verifyUser.role,
      });
    }

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Admin creation error:", {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack,
      details: error,
    });
    res.status(500).json({
      success: false,
      message: "Error in creating admin",
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
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Error during logout",
      error: error.message,
    });
  }
};
