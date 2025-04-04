import Teacher from "../models/Teacher.js";
import User from "../models/User.js";
import mongoose from "mongoose";

// @desc    Get all teachers
// @route   GET /api/teachers
// @access  Private (Admin only)
export const getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find().populate(
      "batches",
      "name subject schedule"
    );

    res.json({
      success: true,
      count: teachers.length,
      data: teachers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in getting teachers",
      error: error.message,
    });
  }
};

// @desc    Get single teacher
// @route   GET /api/teachers/:id
// @access  Private (Admin only)
export const getTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id).populate(
      "batches",
      "name subject schedule"
    );

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    res.json({
      success: true,
      data: teacher,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in getting teacher",
      error: error.message,
    });
  }
};

// @desc    Create new teacher
// @route   POST /api/teachers
// @access  Private (Admin only)
export const createTeacher = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      address,
      subjects,
      qualification,
      experience,
      joiningDate,
      salary,
      gender,
      status,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !email ||
      !password ||
      !phone ||
      !address ||
      !subjects ||
      !qualification ||
      !experience
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Check if teacher already exists
    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
      return res.status(400).json({
        success: false,
        message: "Teacher already exists",
      });
    }

    // Create user account first
    const user = await User.create({
      name,
      email,
      password,
      phone,
      address,
      role: "teacher",
      gender,
    });

    // Create teacher record
    const teacher = await Teacher.create({
      user: user._id,
      name,
      email,
      phone,
      address,
      subjects,
      qualification,
      experience,
      joiningDate,
      salary,
      gender,
      status: status || "active",
    });

    res.status(201).json({
      success: true,
      data: teacher,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in creating teacher",
      error: error.message,
    });
  }
};

// @desc    Update teacher
// @route   PUT /api/teachers/:id
// @access  Private (Admin only)
export const updateTeacher = async (req, res) => {
  try {
    const {
      name,
      phone,
      address,
      subjects,
      qualification,
      experience,
      joiningDate,
      salary,
      status,
      gender,
      password,
    } = req.body;

    // Find the teacher
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    // Update teacher fields
    teacher.name = name || teacher.name;
    teacher.phone = phone || teacher.phone;
    teacher.address = address || teacher.address;
    teacher.subjects = subjects || teacher.subjects;
    teacher.qualification = qualification || teacher.qualification;
    teacher.experience = experience || teacher.experience;
    teacher.joiningDate = joiningDate || teacher.joiningDate;
    teacher.salary = salary || teacher.salary;
    teacher.status = status || teacher.status;
    teacher.gender = gender || teacher.gender;

    // Save the updated teacher
    const updatedTeacher = await teacher.save();

    // Update associated user if exists
    if (teacher.user) {
      const user = await User.findById(teacher.user);
      if (user) {
        user.name = name || user.name;
        user.phone = phone || user.phone;
        user.address = address || user.address;
        user.gender = gender || user.gender;
        
        // Only update password if provided
        if (password) {
          user.password = password;
        }
        
        await user.save();
      }
    }

    res.json({
      success: true,
      data: updatedTeacher,
    });
  } catch (error) {
    console.error("Teacher update error:", error);
    res.status(500).json({
      success: false,
      message: "Error in updating teacher",
      error: error.message,
    });
  }
};

// @desc    Delete teacher
// @route   DELETE /api/teachers/:id
// @access  Private (Admin only)
export const deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    // Delete teacher record
    await Teacher.findByIdAndDelete(req.params.id);

    // Delete corresponding user record
    if (teacher.user) {
      await User.findByIdAndDelete(teacher.user);
    }

    res.json({
      success: true,
      message: "Teacher deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in deleting teacher",
      error: error.message,
    });
  }
};

// @desc    Get teachers by subject
// @route   GET /api/teachers/subject/:subject
// @access  Private
export const getTeachersBySubject = async (req, res) => {
  try {
    const { subject } = req.params;

    const teachers = await Teacher.find({
      subjects: { $in: [subject] },
      status: "Active",
    }).select("name email subjects");

    res.json({
      success: true,
      count: teachers.length,
      data: teachers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in getting teachers by subject",
      error: error.message,
    });
  }
};
