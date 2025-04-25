import Student from "../../models/Student.js";
import Batch from "../../models/Batch.js";
import Attendance from "../../models/Attendance.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response/responseHandler.js";
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
 * @desc    Get student's attendance
 * @route   GET /api/student/attendance
 * @access  Private (Student only)
 */
export const getStudentAttendance = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user.id });

  if (!student) {
    throw new ApiError("Student profile not found", 404);
  }

  // Build filter options
  const filter = { studentId: student._id };
  
  // Add optional batch filter
  if (req.query.batchId) {
    filter.batchId = req.query.batchId;
  }
  
  // Add optional date range filters
  if (req.query.startDate) {
    filter.date = { ...filter.date, $gte: new Date(req.query.startDate) };
  }
  
  if (req.query.endDate) {
    filter.date = { ...filter.date, $lte: new Date(req.query.endDate) };
  }

  const attendance = await Attendance.find(filter)
    .populate("batchId", "name subject")
    .sort({ date: -1 });

  sendSuccess(res, 200, "Student attendance retrieved successfully", attendance);
}); 