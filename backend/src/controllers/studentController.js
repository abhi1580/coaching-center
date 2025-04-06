import Student from "../models/Student.js";
import User from "../models/User.js";
import Class from "../models/Class.js";
import Payment from "../models/Payment.js";
import { validateObjectId } from "../utils/validation.js";
import { errorResponse, successResponse } from "../utils/errorResponse.js";

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
      gender,
      address,
      parentName,
      parentPhone,
      parentEmail,
      standard,
      subjects,
      batches,
      board,
      schoolName,
      previousPercentage,
      dateOfBirth,
      joiningDate,
      password,
    } = req.body;

    // Check if email already exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return errorResponse(res, 400, "Email already registered");
    }

    // Check if a user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(
        res,
        400,
        "Email already registered for a user account"
      );
    }

    // Create a user account first with role="student"
    const user = await User.create({
      name,
      email,
      password: password || "student123",
      phone,
      address,
      role: "student",
      gender,
      status: "active",
    });

    const student = new Student({
      name,
      email,
      phone,
      gender,
      address,
      parentName,
      parentPhone,
      parentEmail,
      standard,
      subjects,
      batches,
      board,
      schoolName,
      previousPercentage,
      dateOfBirth,
      joiningDate,
      user: user._id,
    });

    const newStudent = await student.save();

    // If batches are provided, add student to batches as well
    if (batches && batches.length > 0) {
      const Batch = (await import("../models/Batch.js")).default;
      await Batch.updateMany(
        { _id: { $in: batches } },
        { $addToSet: { enrolledStudents: newStudent._id } }
      );
    }

    // Populate the student with standard, subjects, and batches
    const populatedStudent = await Student.findById(newStudent._id)
      .populate("standard", "name level")
      .populate("subjects", "name")
      .populate("batches", "name subject");

    return successResponse(
      res,
      201,
      "Student created successfully",
      populatedStudent
    );
  } catch (error) {
    return errorResponse(res, 500, "Error creating student", {
      error: error.message,
    });
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private
export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) {
      return errorResponse(res, 400, "Invalid student ID");
    }

    const student = await Student.findById(id);
    if (!student) {
      return errorResponse(res, 404, "Student not found");
    }

    // Extract fields from request body
    const {
      name,
      email,
      phone,
      gender,
      address,
      parentName,
      parentPhone,
      parentEmail,
      standard,
      subjects,
      batches,
      board,
      schoolName,
      previousPercentage,
      dateOfBirth,
      joiningDate,
      status,
      password,
    } = req.body;

    // Update the user account associated with the student
    if (student.user) {
      const userUpdateData = {
        name,
        email,
        phone,
        gender,
        address,
        status,
      };

      // Only include password if it was provided
      if (password) {
        userUpdateData.password = password;
      }

      const user = await User.findByIdAndUpdate(student.user, userUpdateData, {
        new: true,
      });
    }

    // Update student document
    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      {
        name,
        email,
        phone,
        gender,
        address,
        parentName,
        parentPhone,
        parentEmail,
        standard,
        subjects,
        batches,
        board,
        schoolName,
        previousPercentage,
        dateOfBirth,
        joiningDate,
        status,
      },
      { new: true }
    )
      .populate("standard", "name level")
      .populate("subjects", "name")
      .populate("batches", "name subject");

    // Update student in batch enrollment if batches field is present
    if (batches) {
      const Batch = (await import("../models/Batch.js")).default;
      // First remove student from all batches
      await Batch.updateMany(
        { enrolledStudents: id },
        { $pull: { enrolledStudents: id } }
      );

      // Then add student to the selected batches
      if (batches.length > 0) {
        await Batch.updateMany(
          { _id: { $in: batches } },
          { $addToSet: { enrolledStudents: id } }
        );
      }
    }

    return successResponse(
      res,
      200,
      "Student updated successfully",
      updatedStudent
    );
  } catch (error) {
    return errorResponse(res, 500, "Error updating student", {
      error: error.message,
    });
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) {
      return errorResponse(res, 400, "Invalid student ID");
    }

    const student = await Student.findById(id);
    if (!student) {
      return errorResponse(res, 404, "Student not found");
    }

    // Delete the associated user account
    if (student.user) {
      await User.findByIdAndDelete(student.user);
    }

    // Remove student from all batches
    const Batch = (await import("../models/Batch.js")).default;
    await Batch.updateMany(
      { enrolledStudents: id },
      { $pull: { enrolledStudents: id } }
    );

    // Delete the student document
    await Student.findByIdAndDelete(id);

    return successResponse(res, 200, "Student deleted successfully", null);
  } catch (error) {
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

// @desc    Get student's payment history
// @route   GET /api/students/:id/payments
// @access  Private
export const getStudentPayments = async (req, res) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    const student = await Student.findById(id).populate(
      "payments",
      "amount date status description"
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student.payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
