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

  // Changed query pattern to match dashboard and added enrolledStudents population
  const batches = await Batch.find({ teacher: teacher._id })
    .populate("standard", "name")
    .populate("subject", "name")
    .populate({
      path: "enrolledStudents",
      select: "name email phone"
    });

  console.log(`Fetched ${batches.length} batches with populated students`);
  
  // Debug the content of enrolledStudents for each batch
  batches.forEach((batch, index) => {
    console.log(`Batch ${index + 1} (${batch.name}): ${batch.enrolledStudents ? batch.enrolledStudents.length : 0} students`);
  });

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

  // Get all batches of this teacher with populated student data and subjects/standards
  const batches = await Batch.find({ teacher: teacher._id })
    .populate("standard", "name")
    .populate("subject", "name")
    .populate({
      path: "enrolledStudents",
      select: "name email phone parentPhone standard batches"
    });
  
  console.log(`Fetched ${batches.length} batches for teacher`);
  
  // Create an array to store all students with batch info
  const studentsWithBatchInfo = [];
  
  // Process students from all batches
  batches.forEach(batch => {
    if (batch.enrolledStudents && batch.enrolledStudents.length > 0) {
      console.log(`Processing ${batch.enrolledStudents.length} students in batch ${batch.name}`);
      
      // Create a proper batch info object with all needed details
      const batchInfo = {
        id: batch._id.toString(),
        name: batch.name || "Unnamed Batch",
        subject: batch.subject?.name || "Not specified",
        standard: batch.standard?.name || "Not specified",
      };
      
      batch.enrolledStudents.forEach(student => {
        if (!student) return;
        
        // Get the student object ready for conversion
        const studentObj = student.toObject ? student.toObject() : { ...student };
        
        // Check if student already exists in our results array
        const existingIndex = studentsWithBatchInfo.findIndex(
          s => s._id.toString() === studentObj._id.toString()
        );
        
        if (existingIndex === -1) {
          // First time seeing this student - add with first batch
          studentsWithBatchInfo.push({
            ...studentObj,
            batchInfo: batchInfo,  // Include the single batch info
            batches: [batchInfo]   // Also include in batches array for consistency
          });
        } else {
          // Student already exists - add this batch to their batches array
          const existingStudent = studentsWithBatchInfo[existingIndex];
          
          // Ensure batches array exists
          if (!existingStudent.batches) {
            existingStudent.batches = [existingStudent.batchInfo || batchInfo];
          }
          
          // Add current batch if not already in the array
          const alreadyHasBatch = existingStudent.batches.some(
            b => b.id === batchInfo.id
          );
          
          if (!alreadyHasBatch) {
            existingStudent.batches.push(batchInfo);
          }
          
          // Update the student in our array
          studentsWithBatchInfo[existingIndex] = existingStudent;
        }
      });
    }
  });
  
  console.log(`Processed ${studentsWithBatchInfo.length} unique students`);
  
  // Debug the first student's data structure if available
  if (studentsWithBatchInfo.length > 0) {
    const firstStudent = studentsWithBatchInfo[0];
    console.log(`First student ${firstStudent.name} has ${firstStudent.batches ? firstStudent.batches.length : 0} batches`);
  }

  sendSuccess(res, 200, "Teacher's students retrieved successfully", studentsWithBatchInfo);
}); 