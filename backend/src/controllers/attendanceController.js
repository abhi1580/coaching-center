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

    // Find all students in the batch to ensure we have records for everyone
    const batch = await Batch.findById(batchId).populate({
      path: 'enrolledStudents',
      select: 'name email'
    });

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    // Create a map of existing attendance records by studentId
    const attendanceMap = {};
    attendance.forEach(record => {
      attendanceMap[record.studentId._id.toString()] = record;
    });

    // Create complete attendance list including students without records
    const completeAttendance = batch.enrolledStudents.map(student => {
      const existingRecord = attendanceMap[student._id.toString()];
      if (existingRecord) {
        return existingRecord;
      } else {
        // Return a virtual record that doesn't exist in the database yet
        return {
          _id: null,
          studentId: student,
          batchId: batchId,
          date: new Date(date),
          status: "absent",
          remarks: "",
          markedBy: null,
          lastModifiedBy: null,
          isVirtual: true // Flag to indicate this is not yet saved
        };
      }
    });

    res.status(200).json({
      success: true,
      count: completeAttendance.length,
      data: completeAttendance,
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
              status: record.status,
              remarks: record.remarks || "",
              markedBy: record.markedBy || req.user.id,
              lastModifiedBy: req.user.id,
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
    
    // Count the number of classes that weren't cancelled
    const activeAttendance = allAttendance.filter(record => record.status !== 'cancelled');
    const totalClasses = activeAttendance.length;
    const presentCount = allAttendance.filter(record => record.status === 'present').length;
    const lateCount = allAttendance.filter(record => record.status === 'late').length;
    const excusedCount = allAttendance.filter(record => record.status === 'excused').length;
    const absentCount = allAttendance.filter(record => record.status === 'absent').length;
    const cancelledCount = allAttendance.filter(record => record.status === 'cancelled').length;

    // Calculate attendance percentage excluding cancelled classes
    const overallAttendancePercentage = totalClasses > 0 
      ? Math.round(((presentCount + lateCount + excusedCount) / totalClasses) * 100) 
      : 0;

    // Calculate statistics per batch
    const batchIds = [...new Set(allAttendance.map(record => record.batchId.toString()))];
    
    const batchStats = await Promise.all(
      batchIds.map(async (batchId) => {
        const batchAttendance = allAttendance.filter(
          record => record.batchId.toString() === batchId
        );
        
        const totalClasses = batchAttendance.filter(record => record.status !== 'cancelled').length;
        const presentCount = batchAttendance.filter(record => record.status === 'present').length;
        const lateCount = batchAttendance.filter(record => record.status === 'late').length;
        const excusedCount = batchAttendance.filter(record => record.status === 'excused').length;
        const absentCount = batchAttendance.filter(record => record.status === 'absent').length;
        const cancelledCount = batchAttendance.filter(record => record.status === 'cancelled').length;
        
        const attendancePercentage = totalClasses > 0 
          ? Math.round(((presentCount + lateCount + excusedCount) / totalClasses) * 100) 
          : 0;
        
        const batch = await Batch.findById(batchId).populate('subject', 'name');
        
        return {
          batchId,
          batchName: batch?.name || 'Unknown Batch',
          subjectName: batch?.subject?.name || 'Unknown Subject',
          totalClasses,
          present: presentCount,
          late: lateCount,
          excused: excusedCount,
          absent: absentCount,
          cancelled: cancelledCount,
          attendancePercentage
        };
      })
    );

    const stats = {
      studentId,
      studentName: studentExists.name,
      overallStats: {
        totalClasses,
        totalClassesWithCancelled: allAttendance.length,
        present: presentCount,
        late: lateCount,
        excused: excusedCount,
        absent: absentCount,
        cancelled: cancelledCount,
        attendancePercentage: overallAttendancePercentage
      },
      batchStats
    };

    res.status(200).json({
      success: true,
      data: stats
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

    // Validate batchId
    if (!mongoose.Types.ObjectId.isValid(batchId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid batch ID",
      });
    }

    // Check if batch exists
    const batch = await Batch.findById(batchId).populate('subject', 'name');
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    // Get all students in this batch
    const students = await Student.find({ _id: { $in: batch.enrolledStudents } });
    const studentIds = students.map(student => student._id);

    // Get all attendance records for this batch
    const allAttendance = await Attendance.find({ batchId });

    // Get unique dates when attendance was taken - exclude cancelled dates from class counts
    const classDates = [...new Set(allAttendance.map(record => record.date.toISOString().split('T')[0]))].sort();
    
    // Calculate overall batch statistics - exclude cancelled records from attendance calculation
    const totalClasses = classDates.length;
    const activeDates = [...new Set(
      allAttendance
        .filter(record => record.status !== 'cancelled')
        .map(record => record.date.toISOString().split('T')[0])
    )];
    const activeClassCount = activeDates.length;

    // Count by status
    const totalRecords = allAttendance.length;
    const presentCount = allAttendance.filter(record => record.status === 'present').length;
    const lateCount = allAttendance.filter(record => record.status === 'late').length;
    const excusedCount = allAttendance.filter(record => record.status === 'excused').length;
    const absentCount = allAttendance.filter(record => record.status === 'absent').length;
    const cancelledCount = allAttendance.filter(record => record.status === 'cancelled').length;

    // Only count classes that weren't cancelled
    const avgAttendancePercentage = activeClassCount > 0 
      ? Math.round(((presentCount + lateCount + excusedCount) / (totalRecords - cancelledCount)) * 100) 
      : 0;

    // Calculate statistics per student
    const studentStats = await Promise.all(
      students.map(async (student) => {
        const studentAttendance = allAttendance.filter(
          record => record.studentId.toString() === student._id.toString()
        );
        
        // Exclude cancelled classes from attendance calculation
        const totalAttendedClasses = studentAttendance.filter(record => record.status !== 'cancelled').length;
        const presentCount = studentAttendance.filter(record => record.status === 'present').length;
        const lateCount = studentAttendance.filter(record => record.status === 'late').length; 
        const excusedCount = studentAttendance.filter(record => record.status === 'excused').length;
        const absentCount = studentAttendance.filter(record => record.status === 'absent').length;
        const cancelledCount = studentAttendance.filter(record => record.status === 'cancelled').length;
        
        const attendancePercentage = totalAttendedClasses > 0 
          ? Math.round(((presentCount + lateCount + excusedCount) / totalAttendedClasses) * 100) 
          : 0;
        
        return {
          studentId: student._id,
          studentName: student.name,
          email: student.email,
          totalClasses: totalAttendedClasses,
          present: presentCount,
          late: lateCount,
          excused: excusedCount,
          absent: absentCount,
          cancelled: cancelledCount,
          attendancePercentage
        };
      })
    );

    // Calculate statistics per date
    const dateStats = classDates.map(date => {
      const dayAttendance = allAttendance.filter(
        record => record.date.toISOString().split('T')[0] === date
      );
      
      // Check if this date has any non-cancelled records
      const isCancelled = dayAttendance.every(record => record.status === 'cancelled');
      
      const totalRecords = dayAttendance.length;
      const presentCount = dayAttendance.filter(record => record.status === 'present').length;
      const lateCount = dayAttendance.filter(record => record.status === 'late').length;
      const excusedCount = dayAttendance.filter(record => record.status === 'excused').length;
      const absentCount = dayAttendance.filter(record => record.status === 'absent').length;
      const cancelledCount = dayAttendance.filter(record => record.status === 'cancelled').length;
      
      // If class was cancelled, set attendance to 100% to avoid affecting stats
      const attendancePercentage = isCancelled ? 100 : (totalRecords > 0 
        ? Math.round(((presentCount + lateCount + excusedCount) / totalRecords) * 100) 
        : 0);
      
      return {
        date,
        totalStudents: totalRecords,
        present: presentCount,
        late: lateCount,
        excused: excusedCount,
        absent: absentCount,
        cancelled: cancelledCount,
        isCancelled,
        attendancePercentage
      };
    });

    const stats = {
      batchId,
      batchName: batch.name,
      subjectName: batch.subject?.name || 'Unknown Subject',
      totalStudents: students.length,
      totalClasses,
      overallStats: {
        totalRecords,
        present: presentCount,
        late: lateCount,
        excused: excusedCount,
        absent: absentCount,
        avgAttendancePercentage
      },
      studentStats,
      dateStats
    };

    res.status(200).json({
      success: true,
      data: stats
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

/**
 * @desc    Update a single attendance record
 * @route   PATCH /api/attendance/:id
 * @access  Private (Teacher, Admin)
 */
export const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attendance record ID",
      });
    }

    // Validate status
    if (status && !['present', 'absent', 'late', 'excused', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value. Must be 'present', 'absent', 'late', 'excused', or 'cancelled'",
      });
    }

    // Find the record
    const attendanceRecord = await Attendance.findById(id);
    if (!attendanceRecord) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
    }

    // Update the record
    attendanceRecord.status = status || attendanceRecord.status;
    attendanceRecord.remarks = remarks !== undefined ? remarks : attendanceRecord.remarks;
    attendanceRecord.lastModifiedBy = req.user.id;

    await attendanceRecord.save();

    res.status(200).json({
      success: true,
      message: "Attendance record updated successfully",
      data: attendanceRecord,
    });
  } catch (error) {
    console.error("Error in updateAttendance:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}; 