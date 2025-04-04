import Student from "../models/Student.js";
import User from "../models/User.js";
import Class from "../models/Class.js";
import Payment from "../models/Payment.js";
import { validateObjectId } from "../utils/validation.js";

// @desc    Get all students
// @route   GET /api/students
// @access  Private
export const getAllStudents = async (req, res) => {
  try {
    const { role } = req.user;
    let query = {};

    // If user is a teacher, only show students in their classes
    if (role === "teacher") {
      const teacherClasses = await Class.find({ teacher: req.user._id });
      const classIds = teacherClasses.map((cls) => cls._id);
      query = { classes: { $in: classIds } };
    }

    const students = await Student.find(query)
      .populate("standard", "name level")
      .populate("subjects", "name")
      .populate("batches", "name subject")
      .populate("classes", "name subject schedule")
      .populate("payments", "amount date status")
      .sort({ createdAt: -1 });

    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private
export const getStudent = async (req, res) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    const student = await Student.findById(id)
      .populate("standard", "name level")
      .populate("subjects", "name")
      .populate("batches", "name subject")
      .populate("classes", "name subject schedule")
      .populate("payments", "amount date status");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Check if teacher has access to this student
    if (req.user.role === "teacher") {
      const hasAccess = student.classes.some(
        (cls) => cls.teacher.toString() === req.user._id.toString()
      );
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
      return res.status(400).json({ message: "Email already registered" });
    }

    // Check if a user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email already registered for a user account" });
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

    console.log("Created user account for student:", user._id);

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

    res.status(201).json(populatedStudent);
  } catch (error) {
    console.error("Error creating student:", error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private
export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

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
      status,
      dateOfBirth,
      joiningDate,
    } = req.body;

    // Check if email is being changed and if it's already taken
    if (email) {
      const existingStudent = await Student.findOne({
        email,
        _id: { $ne: id },
      });
      if (existingStudent) {
        return res.status(400).json({ message: "Email already registered" });
      }
    }

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Get previous batches for comparison
    const previousBatches = [...student.batches].map((b) => b.toString());

    // Update fields
    Object.assign(student, {
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
      status,
      dateOfBirth,
      joiningDate,
    });

    const updatedStudent = await student.save();

    // Update corresponding User record if it exists
    if (student.user) {
      const user = await User.findById(student.user);
      if (user) {
        user.name = name || user.name;
        user.email = email || user.email;
        user.phone = phone || user.phone;
        user.address = address || user.address;
        user.gender = gender || user.gender;
        user.status = status === "Active" ? "active" : "inactive";
        await user.save();
        console.log("Updated user account for student:", user._id);
      }
    }

    // If batches are changed, update batch enrollments
    if (batches) {
      const newBatches = batches.map((b) => b.toString());
      const Batch = (await import("../models/Batch.js")).default;

      // Remove student from batches that are no longer assigned
      const removedBatches = previousBatches.filter(
        (b) => !newBatches.includes(b)
      );
      if (removedBatches.length > 0) {
        await Batch.updateMany(
          { _id: { $in: removedBatches } },
          { $pull: { enrolledStudents: student._id } }
        );
      }

      // Add student to new batches
      const addedBatches = newBatches.filter(
        (b) => !previousBatches.includes(b)
      );
      if (addedBatches.length > 0) {
        await Batch.updateMany(
          { _id: { $in: addedBatches } },
          { $addToSet: { enrolledStudents: student._id } }
        );
      }
    }

    // Populate the updated student
    const populatedStudent = await Student.findById(updatedStudent._id)
      .populate("standard", "name level")
      .populate("subjects", "name")
      .populate("batches", "name subject")
      .populate("classes", "name subject schedule")
      .populate("payments", "amount date status");

    res.json(populatedStudent);
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    // Find the student
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Remove student from all batches
    if (student.batches && student.batches.length > 0) {
      const Batch = (await import("../models/Batch.js")).default;
      await Batch.updateMany(
        { _id: { $in: student.batches } },
        { $pull: { enrolledStudents: student._id } }
      );
    }

    // Delete corresponding User record if it exists
    if (student.user) {
      await User.findByIdAndDelete(student.user);
      console.log("Deleted user account for student:", student.user);
    }

    // Delete the student
    await Student.findByIdAndDelete(id);

    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({ message: error.message });
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
