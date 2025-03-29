import Staff from "../models/Staff.js";
import User from "../models/User.js";
import mongoose from "mongoose";

// @desc    Get all staff members
// @route   GET /api/staff
// @access  Private (Admin only)
export const getStaff = async (req, res) => {
  try {
    const staff = await Staff.find();
    res.json({
      success: true,
      count: staff.length,
      data: staff,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in getting staff",
      error: error.message,
    });
  }
};

// @desc    Get single staff member
// @route   GET /api/staff/:id
// @access  Private (Admin only)
export const getStaffMember = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found",
      });
    }
    res.json({
      success: true,
      data: staff,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in getting staff member",
      error: error.message,
    });
  }
};

// @desc    Create staff member
// @route   POST /api/staff
// @access  Private (Admin only)
export const createStaff = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      address,
      department,
      designation,
      joiningDate,
      salary,
    } = req.body;

    // Start a MongoDB transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Create user account
      const user = new User({
        name,
        email,
        password,
        phone,
        address,
        role: "staff",
      });
      await user.save({ session });

      // Create staff record
      const staff = new Staff({
        name,
        email,
        phone,
        address,
        department,
        designation,
        joiningDate,
        salary,
      });
      await staff.save({ session });

      // Commit the transaction
      await session.commitTransaction();

      res.status(201).json({
        success: true,
        data: staff,
      });
    } catch (error) {
      // If an error occurred, abort the transaction
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in creating staff member",
      error: error.message,
    });
  }
};

// @desc    Update staff member
// @route   PUT /api/staff/:id
// @access  Private (Admin only)
export const updateStaff = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      department,
      designation,
      joiningDate,
      salary,
      status,
    } = req.body;

    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found",
      });
    }

    // Update staff fields
    staff.name = name || staff.name;
    staff.email = email || staff.email;
    staff.phone = phone || staff.phone;
    staff.address = address || staff.address;
    staff.department = department || staff.department;
    staff.designation = designation || staff.designation;
    staff.joiningDate = joiningDate || staff.joiningDate;
    staff.salary = salary || staff.salary;
    staff.status = status || staff.status;

    await staff.save();

    // Update corresponding user record
    await User.findOneAndUpdate(
      { email: staff.email },
      {
        name: staff.name,
        phone: staff.phone,
        address: staff.address,
      }
    );

    res.json({
      success: true,
      data: staff,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in updating staff member",
      error: error.message,
    });
  }
};

// @desc    Delete staff member
// @route   DELETE /api/staff/:id
// @access  Private (Admin only)
export const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found",
      });
    }

    // Start a MongoDB transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Delete staff record
      await staff.remove({ session });

      // Delete corresponding user record
      await User.findOneAndDelete({ email: staff.email }).session(session);

      // Commit the transaction
      await session.commitTransaction();

      res.json({
        success: true,
        data: {},
      });
    } catch (error) {
      // If an error occurred, abort the transaction
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in deleting staff member",
      error: error.message,
    });
  }
};
