import Teacher from "../../models/Teacher.js";
import Batch from "../../models/Batch.js";
import Student from "../../models/Student.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { sendSuccess, sendNotFound, sendBadRequest } from "../../utils/response/responseHandler.js";
import { ApiError } from "../../middleware/errorMiddleware.js";

/**
 * @desc    Get teacher profile
 * @route   GET /api/teacher/profile
 * @access  Private (Teacher only)
 */
export const getTeacherProfile = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ user: req.user.id })
    .populate("batches", "name schedule subject standard");

  if (!teacher) {
    throw new ApiError("Teacher profile not found", 404);
  }

  sendSuccess(res, 200, "Teacher profile retrieved successfully", teacher);
});

/**
 * @desc    Update teacher profile
 * @route   PUT /api/teacher/profile
 * @access  Private (Teacher only)
 */
export const updateTeacherProfile = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ user: req.user.id });

  if (!teacher) {
    throw new ApiError("Teacher profile not found", 404);
  }

  // Fields allowed to be updated by teacher
  const {
    phone,
    address,
    qualification,
    experience,
    bio,
    profileImage
  } = req.body;

  // Update only provided fields
  if (phone) teacher.phone = phone;
  if (address) teacher.address = address;
  if (qualification) teacher.qualification = qualification;
  if (experience) teacher.experience = experience;
  if (bio) teacher.bio = bio;
  if (profileImage) teacher.profileImage = profileImage;

  const updatedTeacher = await teacher.save();

  sendSuccess(res, 200, "Teacher profile updated successfully", updatedTeacher);
});

/**
 * @desc    Get teacher's batches
 * @route   GET /api/teacher/batches
 * @access  Private (Teacher only)
 */
export const getTeacherBatches = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ user: req.user.id });

  if (!teacher) {
    throw new ApiError("Teacher profile not found", 404);
  }

  const batches = await Batch.find({ _id: { $in: teacher.batches } })
    .populate("standard", "name")
    .populate("subject", "name");

  sendSuccess(res, 200, "Teacher batches retrieved successfully", batches);
});

/**
 * @desc    Get teacher's batch details
 * @route   GET /api/teacher/batches/:id
 * @access  Private (Teacher only)
 */
export const getTeacherBatchDetails = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ user: req.user.id });

  if (!teacher) {
    throw new ApiError("Teacher profile not found", 404);
  }

  // Check if the batch belongs to this teacher
  if (!teacher.batches.includes(req.params.id)) {
    throw new ApiError("This batch does not belong to you", 403);
  }

  const batch = await Batch.findById(req.params.id)
    .populate("standard", "name")
    .populate("subject", "name")
    .populate("enrolledStudents", "name email phone");

  if (!batch) {
    throw new ApiError("Batch not found", 404);
  }

  sendSuccess(res, 200, "Batch details retrieved successfully", batch);
});

/**
 * @desc    Get students in teacher's batches
 * @route   GET /api/teacher/students
 * @access  Private (Teacher only)
 */
export const getTeacherStudents = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ user: req.user.id });

  if (!teacher) {
    throw new ApiError("Teacher profile not found", 404);
  }

  // Get all batches of this teacher
  const batches = await Batch.find({ _id: { $in: teacher.batches } });
  
  // Extract all student IDs from all batches
  const studentIds = batches.reduce((acc, batch) => {
    return [...acc, ...batch.enrolledStudents];
  }, []);

  // Remove duplicates
  const uniqueStudentIds = [...new Set(studentIds)];

  // Get all students
  const students = await Student.find({ _id: { $in: uniqueStudentIds } })
    .select("name email phone parentPhone standard batches");

  sendSuccess(res, 200, "Teacher's students retrieved successfully", students);
}); 