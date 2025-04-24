import Attendance from "../models/Attendance.js";
import Student from "../models/Student.js";
import Batch from "../models/Batch.js";
import { check, validationResult } from "express-validator";
import mongoose from "mongoose";

/**
 * @desc    Get attendance for a batch on a specific date
 * @route   GET /api/attendance/:batchId/:date
 * @access  Private (Teacher, Admin)
 */
export const getBatchAttendance = async (req, res) => {
  try {
    const { batchId, date } = req.params;

    // Validate batchId
    if (!mongoose.Types.ObjectId.isValid(batchId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid batch ID",
      });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Expected YYYY-MM-DD",
      });
    }

    // Fetch attendance records
    const attendance = await Attendance.find({
      batchId,
      date: new Date(date),
    }).populate("studentId", "name email");

    if (attendance.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No attendance records found for this date",
      });
    }

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance,
    });
  } catch (error) {
    console.error("Error in getBatchAttendance:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * @desc    Submit attendance for a batch
 * @route   POST /api/attendance/batch/:batchId
 * @access  Private (Teacher, Admin)
 */
export const submitBatchAttendance = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { date, records } = req.body;

    // Validate batchId
    if (!mongoose.Types.ObjectId.isValid(batchId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid batch ID",
      });
    }

    // Check if batch exists
    const batchExists = await Batch.findById(batchId);
    if (!batchExists) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Expected YYYY-MM-DD",
      });
    }

    // Validate records
    if (!records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Attendance records are required",
      });
    }

    // Process each attendance record
    const bulkOperations = records.map((record) => {
      return {
        updateOne: {
          filter: {
            studentId: record.studentId,
            batchId,
            date: new Date(date),
          },
          update: {
            $set: {
              present: record.present,
              markedBy: req.user.id,
            },
          },
          upsert: true, // Create if doesn't exist
        },
      };
    });

    // Execute bulk operation
    await Attendance.bulkWrite(bulkOperations);

    res.status(200).json({
      success: true,
      message: "Attendance submitted successfully",
    });
  } catch (error) {
    console.error("Error in submitBatchAttendance:", error);
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate attendance records detected. Each student should have one record per date.",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * @desc    Get attendance history for a student in a batch
 * @route   GET /api/attendance/student/:studentId/:batchId
 * @access  Private (Teacher, Admin, Student)
 */
export const getStudentAttendance = async (req, res) => {
  try {
    const { studentId, batchId } = req.params;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(studentId) || !mongoose.Types.ObjectId.isValid(batchId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student or batch ID",
      });
    }

    // Check if student exists
    const studentExists = await Student.findById(studentId);
    if (!studentExists) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Check if batch exists
    const batchExists = await Batch.findById(batchId);
    if (!batchExists) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    // Fetch attendance records sorted by date (newest first)
    const attendance = await Attendance.find({
      studentId,
      batchId,
    }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance,
    });
  } catch (error) {
    console.error("Error in getStudentAttendance:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * @desc    Get attendance statistics for a student
 * @route   GET /api/attendance/statistics/student/:studentId
 * @access  Private (Teacher, Admin, Student)
 */
export const getStudentAttendanceStats = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID",
      });
    }

    // Check if student exists
    const studentExists = await Student.findById(studentId);
    if (!studentExists) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Get all attendance records for the student
    const allAttendance = await Attendance.find({ studentId });
    
    // Calculate attendance statistics per batch
    const batchIds = [...new Set(allAttendance.map(record => record.batchId.toString()))];
    
    const batchStats = await Promise.all(
      batchIds.map(async (batchId) => {
        const batchAttendance = allAttendance.filter(
          record => record.batchId.toString() === batchId
        );
        
        const totalClasses = batchAttendance.length;
        const presentCount = batchAttendance.filter(record => record.present).length;
        const attendancePercentage = totalClasses > 0 
          ? Math.round((presentCount / totalClasses) * 100) 
          : 0;
        
        const batch = await Batch.findById(batchId).populate('subject', 'name');
        
        return {
          batchId,
          batchName: batch?.name || 'Unknown Batch',
          subjectName: batch?.subject?.name || 'Unknown Subject',
          totalClasses,
          present: presentCount,
          absent: totalClasses - presentCount,
          attendancePercentage
        };
      })
    );

    // Calculate overall statistics
    const totalClasses = allAttendance.length;
    const presentCount = allAttendance.filter(record => record.present).length;
    const overallAttendancePercentage = totalClasses > 0 
      ? Math.round((presentCount / totalClasses) * 100) 
      : 0;

    res.status(200).json({
      success: true,
      data: {
        overall: {
          totalClasses,
          present: presentCount,
          absent: totalClasses - presentCount,
          attendancePercentage: overallAttendancePercentage
        },
        batches: batchStats
      }
    });
  } catch (error) {
    console.error("Error in getStudentAttendanceStats:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * @desc    Get attendance statistics for a batch
 * @route   GET /api/attendance/statistics/batch/:batchId
 * @access  Private (Teacher, Admin)
 */
export const getBatchAttendanceStats = async (req, res) => {
  try {
    const { batchId } = req.params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(batchId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid batch ID",
      });
    }

    // Check if batch exists
    const batch = await Batch.findById(batchId).populate('enrolledStudents');
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    // Get all unique dates for this batch
    const attendanceDates = await Attendance.distinct('date', { batchId });
    
    // Sort dates in descending order
    attendanceDates.sort((a, b) => new Date(b) - new Date(a));
    
    // Get all enrolled students
    const enrolledStudents = batch.enrolledStudents || [];
    
    // Get student statistics
    const studentStats = await Promise.all(
      enrolledStudents.map(async (student) => {
        const studentAttendance = await Attendance.find({
          studentId: student._id,
          batchId
        });
        
        const totalRecords = studentAttendance.length;
        const presentCount = studentAttendance.filter(record => record.present).length;
        const attendancePercentage = totalRecords > 0 
          ? Math.round((presentCount / totalRecords) * 100) 
          : 0;
        
        return {
          studentId: student._id,
          name: student.name,
          email: student.email,
          totalClasses: totalRecords,
          present: presentCount,
          absent: totalRecords - presentCount,
          attendancePercentage
        };
      })
    );

    // Calculate overall batch statistics
    const allBatchAttendance = await Attendance.find({ batchId });
    const totalRecords = allBatchAttendance.length;
    const presentCount = allBatchAttendance.filter(record => record.present).length;
    const overallAttendancePercentage = totalRecords > 0 
      ? Math.round((presentCount / totalRecords) * 100) 
      : 0;
    
    // Calculate daily statistics
    const dailyStats = await Promise.all(
      attendanceDates.map(async (date) => {
        const dateAttendance = await Attendance.find({
          batchId,
          date: new Date(date)
        });
        
        const totalStudents = dateAttendance.length;
        const presentCount = dateAttendance.filter(record => record.present).length;
        const absentCount = totalStudents - presentCount;
        const attendancePercentage = totalStudents > 0 
          ? Math.round((presentCount / totalStudents) * 100) 
          : 0;
        
        return {
          date,
          totalStudents,
          present: presentCount,
          absent: absentCount,
          attendancePercentage
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        overall: {
          totalClasses: attendanceDates.length,
          totalStudents: enrolledStudents.length,
          averageAttendance: overallAttendancePercentage
        },
        students: studentStats,
        daily: dailyStats
      }
    });
  } catch (error) {
    console.error("Error in getBatchAttendanceStats:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}; 