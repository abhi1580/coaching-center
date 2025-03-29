import Student from "../models/Student.js";
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
      query = { enrolledClasses: { $in: classIds } };
    }

    const students = await Student.find(query)
      .populate("enrolledClasses", "name subject schedule")
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
      .populate("enrolledClasses", "name subject schedule")
      .populate("payments", "amount date status");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Check if teacher has access to this student
    if (req.user.role === "teacher") {
      const hasAccess = student.enrolledClasses.some(
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
      grade,
      board,
      schoolName,
      previousPercentage,
      joiningDate,
    } = req.body;

    // Check if email already exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const student = new Student({
      name,
      email,
      phone,
      gender,
      address,
      parentName,
      parentPhone,
      grade,
      board,
      schoolName,
      previousPercentage,
      joiningDate,
    });

    const newStudent = await student.save();
    res.status(201).json(newStudent);
  } catch (error) {
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
      grade,
      board,
      schoolName,
      previousPercentage,
      status,
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

    // Update fields
    Object.assign(student, {
      name,
      email,
      phone,
      gender,
      address,
      parentName,
      parentPhone,
      grade,
      board,
      schoolName,
      previousPercentage,
      status,
      joiningDate,
    });

    const updatedStudent = await student.save();
    res.json(updatedStudent);
  } catch (error) {
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

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Remove student from all enrolled classes
    await Class.updateMany(
      { _id: { $in: student.enrolledClasses } },
      { $pull: { students: id } }
    );

    // Delete all payments associated with the student
    await Payment.deleteMany({ student: id });

    await student.remove();
    res.json({ message: "Student deleted successfully" });
  } catch (error) {
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
      path: "enrolledClasses",
      select: "name subject schedule teacher",
      populate: {
        path: "teacher",
        select: "name email",
      },
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student.enrolledClasses);
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
