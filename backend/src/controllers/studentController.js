import Student from "../models/Student.js";
import User from "../models/User.js";
import { validateObjectId } from "../utils/validation.js";
import { errorResponse, successResponse } from "../utils/responseUtil.js";
import mongoose from "mongoose";

// @desc    Get all students
// @route   GET /api/students
// @access  Private
export const getAllStudents = async (req, res) => {
  try {
    // Get query parameters
    const { standard, subject, batch, search } = req.query;

    // Build filter object
    const filter = {};

    if (standard) {
      filter.standard = standard;
    }

    if (subject) {
      filter.subjects = subject;
    }

    if (batch) {
      filter.batches = batch;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const students = await Student.find(filter)
      .populate("standard", "name level")
      .populate("subjects", "name")
      .populate("batches", "name subject")
      .sort({ name: 1 }); // Sort by name in ascending order

    return successResponse(
      res,
      200,
      "Students retrieved successfully",
      students
    );
  } catch (error) {
    return errorResponse(res, 500, "Error fetching students", {
      error: error.message,
    });
  }
};

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private
export const getStudent = async (req, res) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) {
      return errorResponse(res, 400, "Invalid student ID");
    }

    const student = await Student.findById(id)
      .populate("standard", "name level")
      .populate("subjects", "name")
      .populate("batches", "name subject")
      .populate("classes", "name subject schedule")
      .populate("payments", "amount date status");

    if (!student) {
      return errorResponse(res, 404, "Student not found");
    }

    // Check if teacher has access to this student
    if (req.user.role === "teacher") {
      const hasAccess = student.classes.some(
        (cls) => cls.teacher.toString() === req.user._id.toString()
      );
      if (!hasAccess) {
        return errorResponse(res, 403, "Access denied");
      }
    }

    return successResponse(res, 200, "Student retrieved successfully", student);
  } catch (error) {
    return errorResponse(res, 500, "Error retrieving student", {
      error: error.message,
    });
  }
};

// @desc    Create student
// @route   POST /api/students
// @access  Private
export const createStudent = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      standard,
      subjects,
      batches,
      parentName,
      parentPhone,
      address,
      dateOfBirth,
      gender,
      board,
      schoolName,
      previousPercentage,
      joiningDate,
      studentId,
      password,
    } = req.body;

    // Validate required fields
    const requiredFields = ["name", "email", "phone", "gender", "address", "password"];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        errors: missingFields.map((field) => `${field} is required`),
      });
    }

    // Check if user or student already exists with this email
    const existingUser = await User.findOne({ email });
    const existingStudent = await Student.findOne({ email });

    if (existingUser || existingStudent) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Create user account for the student with the provided password
    try {
      const user = await User.create({
        name,
        email,
        password,
        role: "student",
        gender,
        address,
        phone,
      });

      // Create the student with the user reference
      const student = await Student.create({
        name,
        email,
        phone,
        standard,
        subjects: subjects || [],
        batches: batches || [],
        parentName,
        parentPhone,
        address,
        dateOfBirth,
        gender,
        board,
        schoolName,
        previousPercentage,
        joiningDate,
        user: user._id, // Link to the created user
        studentId,
      });

      res.status(201).json({
        success: true,
        data: student,
      });
    } catch (error) {
      // If student creation fails, try to clean up the user
      if (user) {
        await User.findByIdAndDelete(user._id);
      }
      console.error("Error creating user/student:", error);
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  } catch (err) {
    console.error("Error in createStudent controller:", err);
    res.status(400).json({
      success: false,
      message: err.message,
      stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private
export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate object ID
    if (!validateObjectId(id)) {
      return errorResponse(res, 400, "Invalid student ID");
    }
    
    const {
      name,
      email,
      phone,
      standard,
      subjects,
      batches,
      parentName,
      parentPhone,
      address,
      dateOfBirth,
      gender,
      board,
      schoolName,
      previousPercentage,
      joiningDate,
      password,
      status,
    } = req.body;

    // Check if student exists
    const existingStudent = await Student.findById(id)
      .populate("user", "gender"); // Populate existing user to get current gender
    
    if (!existingStudent) {
      return errorResponse(res, 404, "Student not found");
    }

    // Check if email is already taken by another user
    if (email && email !== existingStudent.email) {
      const emailExists = await Student.findOne({ email, _id: { $ne: id } });
      if (emailExists) {
        return errorResponse(res, 400, "Email is already in use");
      }
    }

    // Update student document
    const student = await Student.findByIdAndUpdate(
      id,
      {
        name,
        email,
        phone,
        standard,
        subjects: subjects || existingStudent.subjects,
        batches: batches || existingStudent.batches,
        parentName,
        parentPhone,
        address,
        dateOfBirth,
        gender,
        board,
        schoolName,
        previousPercentage,
        joiningDate,
        status: status || existingStudent.status,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    // If student has a linked user account, update that too
    if (student.user) {
      // Get current user data to ensure we have all required fields
      const currentUser = await User.findById(student.user);
      
      if (!currentUser) {
        return errorResponse(res, 404, "Associated user account not found");
      }
      
      // Ensure gender is always provided
      const userGender = gender || existingStudent.gender || currentUser.gender;
      
      try {
        if (password) {
          // When updating password, we want to ensure it's hashed
          // APPROACH 1: Use save method to trigger the pre-save hook
          const user = await User.findById(student.user);
          if (user) {
            // Update all user fields
            user.name = name || currentUser.name;
            user.email = email || currentUser.email;
            user.phone = phone || currentUser.phone;
            user.gender = userGender;
            user.address = address || currentUser.address;
            user.password = password; // This will be hashed by pre-save hook
            await user.save();
            console.log("Updated user with password using save method");
          }
        } else {
          // For non-password updates, use findByIdAndUpdate
          await User.findByIdAndUpdate(student.user, {
            name: name || currentUser.name,
            email: email || currentUser.email,
            phone: phone || currentUser.phone,
            gender: userGender,
            address: address || currentUser.address,
          });
        }
      } catch (error) {
        console.error("Error updating user:", error);
        return errorResponse(res, 500, `Error updating user account: ${error.message}`);
      }
    }

    return successResponse(res, 200, "Student updated successfully", student);
  } catch (err) {
    console.error("Error updating student:", err);
    return errorResponse(res, 400, err.message);
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private
export const deleteStudent = async (req, res) => {
  // Start a session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    if (!validateObjectId(id)) {
      return errorResponse(res, 400, "Invalid student ID");
    }

    const student = await Student.findById(id);
    if (!student) {
      return errorResponse(res, 404, "Student not found");
    }

    // Import all models that might reference the student
    const [Batch, Attendance, Note] = await Promise.all([
      import("../models/Batch.js").then(module => module.default),
      import("../models/Attendance.js").then(module => module.default),
      import("../models/note.model.js").then(module => module.default)
    ]);

    // 1. Delete the associated user account
    if (student.user) {
      await User.findByIdAndDelete(student.user).session(session);
      console.log(`Deleted user account ${student.user}`);
    }

    // 2. Delete all attendance records for this student
    const deletedAttendance = await Attendance.deleteMany(
      { studentId: id },
      { session }
    );
    console.log(`Deleted ${deletedAttendance.deletedCount} attendance records`);

    // 3. Remove student from all batches
    await Batch.updateMany(
      { enrolledStudents: id },
      { $pull: { enrolledStudents: id } },
      { session }
    );
    console.log(`Removed student from all batches`);

    // 4. Delete the student document
    await Student.findByIdAndDelete(id).session(session);
    console.log(`Deleted student document ${id}`);

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return successResponse(res, 200, "Student and all related data deleted successfully", null);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error deleting student:", error);
    return errorResponse(res, 500, "Error deleting student", {
      error: error.message,
    });
  }
};

// @desc    Get student's enrolled classes
// @route   GET /api/students/:id/classes
// @access  Private
export const getStudentClasses = async (req, res) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    const student = await Student.findById(id).populate({
      path: "classes",
      select: "name subject schedule teacher",
      populate: {
        path: "teacher",
        select: "name email",
      },
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student.classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


