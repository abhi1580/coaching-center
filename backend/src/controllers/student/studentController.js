import Student from "../../models/Student.js";
import Batch from "../../models/Batch.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/responseUtil.js";
import { ApiError } from "../../middleware/errorMiddleware.js";

/**
 * @desc    Get student profile
 * @route   GET /api/student/profile
 * @access  Private (Student only)
 */
export const getStudentProfile = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user.id })
    .populate("batches", "name schedule subject standard teacher")
    .populate("standard", "name");

  if (!student) {
    throw new ApiError("Student profile not found", 404);
  }

  sendSuccess(res, 200, "Student profile retrieved successfully", student);
});

/**
 * @desc    Update student profile
 * @route   PUT /api/student/profile
 * @access  Private (Student only)
 */
export const updateStudentProfile = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user.id });

  if (!student) {
    throw new ApiError("Student profile not found", 404);
  }

  // Fields allowed to be updated by student
  const {
    phone,
    address,
    profileImage,
    bio
  } = req.body;

  // Update only provided fields
  if (phone) student.phone = phone;
  if (address) student.address = address;
  if (profileImage) student.profileImage = profileImage;
  if (bio) student.bio = bio;

  const updatedStudent = await student.save();

  sendSuccess(res, 200, "Student profile updated successfully", updatedStudent);
});

/**
 * @desc    Get student's batches
 * @route   GET /api/student/batches
 * @access  Private (Student only)
 */
export const getStudentBatches = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user.id });

  if (!student) {
    throw new ApiError("Student profile not found", 404);
  }

  const batches = await Batch.find({ _id: { $in: student.batches } })
    .populate("standard", "name")
    .populate("subject", "name")
    .populate("teacher", "name");

  sendSuccess(res, 200, "Student batches retrieved successfully", batches);
});

/**
 * @desc    Get student's batch details
 * @route   GET /api/student/batches/:id
 * @access  Private (Student only)
 */
export const getStudentBatchDetails = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user.id });

  if (!student) {
    throw new ApiError("Student profile not found", 404);
  }

  // Check if the student is enrolled in this batch
  if (!student.batches.includes(req.params.id)) {
    throw new ApiError("You are not enrolled in this batch", 403);
  }

  const batch = await Batch.findById(req.params.id)
    .populate("standard", "name")
    .populate("subject", "name")
    .populate("teacher", "name");

  if (!batch) {
    throw new ApiError("Batch not found", 404);
  }

  sendSuccess(res, 200, "Batch details retrieved successfully", batch);
});

/**
 * @desc    Get student details (used by dashboard)
 * @route   GET /api/student/details
 * @access  Private (Student only)
 */
export const getStudentDetails = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user.id })
    .populate({
      path: "batches",
      select: "name schedule subject standard teacher status description location startDate endDate syllabus",
      populate: [
        { path: "subject", select: "name" },
        { path: "standard", select: "name" },
        { path: "teacher", select: "name email" }
      ]
    })
    .populate("standard", "name level")
    .populate("subjects", "name");

  if (!student) {
    throw new ApiError("Student profile not found", 404);
  }

  sendSuccess(res, 200, "Student details retrieved successfully", student);
});

/**
 * @desc    Get student attendance
 * @route   GET /api/student/attendance
 * @route   GET /api/student/attendance/:batchId
 * @access  Private (Student only)
 */
export const getStudentAttendance = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user.id });

  if (!student) {
    throw new ApiError("Student profile not found", 404);
  }

  // Build query based on params
  const query = { studentId: student._id };
  
  // Add batch filter if provided
  if (req.params.batchId) {
    // Check if student is enrolled in this batch
    if (!student.batches.includes(req.params.batchId)) {
      throw new ApiError("You are not enrolled in this batch", 403);
    }
    query.batchId = req.params.batchId;
  }
  
  // Add date filters if provided
  if (req.query.startDate) {
    query.date = { $gte: new Date(req.query.startDate) };
  }
  
  if (req.query.endDate) {
    if (!query.date) query.date = {};
    query.date.$lte = new Date(req.query.endDate);
  }

  // Import Attendance model
  const Attendance = (await import("../../models/Attendance.js")).default;

  const attendance = await Attendance.find(query)
    .populate("batchId", "name")
    .sort({ date: -1 });

  // Transform the data to match the expected format in the frontend
  const formattedAttendance = attendance.map(record => ({
    _id: record._id,
    student: record.studentId,
    batch: record.batchId._id,
    batchName: record.batchId.name,
    date: record.date,
    status: record.status,
    notes: record.remarks || "",
  }));

  sendSuccess(res, 200, "Student attendance retrieved successfully", formattedAttendance);
}); 