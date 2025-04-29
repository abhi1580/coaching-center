import Attendance from "../models/Attendance.js";
import Student from "../models/Student.js";
import Batch from "../models/Batch.js";
import mongoose from "mongoose";
import { ApiError } from "../middleware/errorMiddleware.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response/responseHandler.js";
import { format } from "date-fns";

/**
 * @desc    Get attendance for a batch on a specific date
 * @route   GET /api/attendance/:batchId/:date
 * @access  Private (Teacher, Admin)
 */
export const getBatchAttendance = asyncHandler(async (req, res) => {
  const { batchId, date } = req.params;

  // Validate batchId
  if (!mongoose.Types.ObjectId.isValid(batchId)) {
    throw new ApiError("Invalid batch ID", 400);
  }

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    throw new ApiError("Invalid date format. Expected YYYY-MM-DD", 400);
  }

  // Check if batch exists
  const batch = await Batch.findById(batchId).populate({
    path: 'enrolledStudents',
    select: 'name email'
  });

  if (!batch) {
    throw new ApiError("Batch not found", 404);
  }

  // Format the date to start of day
  const searchDate = new Date(date);
  searchDate.setHours(0, 0, 0, 0);
  
  // End of the day
  const endDate = new Date(searchDate);
  endDate.setHours(23, 59, 59, 999);

  // Fetch existing attendance records
  const attendanceRecords = await Attendance.find({
    batchId,
    date: { $gte: searchDate, $lte: endDate }
  }).populate("studentId", "name email");

  // Create a map of existing attendance records
  const recordMap = {};
  attendanceRecords.forEach(record => {
    recordMap[record.studentId._id.toString()] = {
      _id: record._id,
      studentId: record.studentId._id,
      studentName: record.studentId.name,
      studentEmail: record.studentId.email,
      status: record.status,
      remarks: record.remarks
    };
  });

  // Create the response with all students in the batch
  const response = batch.enrolledStudents.map(student => {
    const record = recordMap[student._id.toString()];
    return record || {
      studentId: student._id,
      studentName: student.name,
      studentEmail: student.email,
      status: "absent", // Default status
      remarks: ""
    };
  });

  sendSuccess(res, 200, "Attendance records retrieved successfully", response);
});

/**
 * @desc    Submit attendance for a batch
 * @route   POST /api/attendance/batch/:batchId
 * @access  Private (Teacher, Admin)
 */
export const submitBatchAttendance = asyncHandler(async (req, res) => {
  const { batchId } = req.params;
  const { date, records } = req.body;

  // Validate batchId
  if (!mongoose.Types.ObjectId.isValid(batchId)) {
    throw new ApiError("Invalid batch ID", 400);
  }

  // Check if batch exists
  const batchExists = await Batch.findById(batchId);
  if (!batchExists) {
    throw new ApiError("Batch not found", 404);
  }

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    throw new ApiError("Invalid date format. Expected YYYY-MM-DD", 400);
  }

  // Validate records
  if (!records || !Array.isArray(records) || records.length === 0) {
    throw new ApiError("Attendance records are required", 400);
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
            markedBy: req.user.id,
          },
        },
        upsert: true, // Create if doesn't exist
      },
    };
  });

  // Execute bulk operation
  await Attendance.bulkWrite(bulkOperations);

  sendSuccess(res, 200, "Attendance saved successfully");
});

/**
 * @desc    Get attendance history for a batch within a date range
 * @route   GET /api/attendance/batch/:batchId/history
 * @access  Private (Teacher, Admin)
 */
export const getBatchAttendanceHistory = asyncHandler(async (req, res) => {
  const { batchId } = req.params;
  const { startDate, endDate } = req.query;

  // Validate batchId
  if (!mongoose.Types.ObjectId.isValid(batchId)) {
    throw new ApiError("Invalid batch ID", 400);
  }

  // Validate date formats (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
    throw new ApiError("Invalid date format. Expected YYYY-MM-DD", 400);
  }

  // Check if batch exists
  const batch = await Batch.findById(batchId);
  if (!batch) {
    throw new ApiError("Batch not found", 404);
  }

  // Parse dates
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  // Get attendance records within date range
  const attendanceRecords = await Attendance.find({
    batchId,
    date: { $gte: start, $lte: end }
  })
  .populate("studentId", "name email")
  .sort({ date: 1 });

  // Group records by date
  const recordsByDate = {};
  
  attendanceRecords.forEach(record => {
    const dateStr = record.date.toISOString().split('T')[0];
    
    if (!recordsByDate[dateStr]) {
      recordsByDate[dateStr] = [];
    }
    
    recordsByDate[dateStr].push({
      _id: record._id,
      studentId: record.studentId._id,
      studentName: record.studentId.name,
      studentEmail: record.studentId.email,
      status: record.status,
      remarks: record.remarks
    });
  });

  // Convert to array for easier frontend consumption
  const history = Object.keys(recordsByDate).map(date => ({
    date,
    records: recordsByDate[date]
  }));

  sendSuccess(res, 200, "Attendance history retrieved successfully", history);
});

/**
 * @desc    Get attendance records for a specific student
 * @route   GET /api/attendance/student/:studentId/batch/:batchId
 * @access  Private (Teacher, Admin)
 */
export const getStudentAttendance = asyncHandler(async (req, res) => {
  const { studentId, batchId } = req.params;
  const { startDate, endDate } = req.query;

  // Validate studentId
  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    throw new ApiError("Invalid student ID", 400);
  }

  // Validate batchId
  if (!mongoose.Types.ObjectId.isValid(batchId)) {
    throw new ApiError("Invalid batch ID", 400);
  }

  // Validate date formats if provided (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if ((startDate && !dateRegex.test(startDate)) || (endDate && !dateRegex.test(endDate))) {
    throw new ApiError("Invalid date format. Expected YYYY-MM-DD", 400);
  }

  // Check if student exists
  const student = await Student.findById(studentId);
  if (!student) {
    throw new ApiError("Student not found", 404);
  }

  // Check if batch exists
  const batch = await Batch.findById(batchId);
  if (!batch) {
    throw new ApiError("Batch not found", 404);
  }

  // Build query - include both studentId and batchId to limit the results
  const query = { 
    studentId,
    batchId
  };
  
  // Add date range if provided
  if (startDate || endDate) {
    query.date = {};
    
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      query.date.$gte = start;
    }
    
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.date.$lte = end;
    }
  }

  // Fetch attendance records
  const attendanceRecords = await Attendance.find(query)
    .populate("batchId", "name")
    .sort({ date: -1 });

  // Transform data for frontend
  const records = attendanceRecords.map(record => ({
    _id: record._id,
    date: record.date,
    formattedDate: format(record.date, "yyyy-MM-dd"),
    status: record.status,
    batchId: record.batchId._id,
    batchName: record.batchId.name
  }));

  // Group records by month for summary
  const recordsByMonth = {};
  
  attendanceRecords.forEach(record => {
    const month = record.date.toISOString().slice(0, 7); // YYYY-MM format
    
    if (!recordsByMonth[month]) {
      recordsByMonth[month] = {
        present: 0,
        absent: 0,
        late: 0,
        total: 0
      };
    }
    
    recordsByMonth[month][record.status]++;
    recordsByMonth[month].total++;
  });
  
  // Calculate overall statistics
  const totalRecords = attendanceRecords.length;
  const presentCount = attendanceRecords.filter(r => r.status === "present").length;
  const absentCount = attendanceRecords.filter(r => r.status === "absent").length;
  const lateCount = attendanceRecords.filter(r => r.status === "late").length;
  
  const statistics = {
    presentPercentage: totalRecords ? Math.round((presentCount / totalRecords) * 100) : 0,
    absentPercentage: totalRecords ? Math.round((absentCount / totalRecords) * 100) : 0,
    latePercentage: totalRecords ? Math.round((lateCount / totalRecords) * 100) : 0,
    totalClasses: totalRecords,
    monthlyBreakdown: Object.keys(recordsByMonth).map(month => ({
      month,
      present: recordsByMonth[month].present,
      absent: recordsByMonth[month].absent,
      late: recordsByMonth[month].late,
      total: recordsByMonth[month].total,
      presentPercentage: recordsByMonth[month].total ? 
        Math.round((recordsByMonth[month].present / recordsByMonth[month].total) * 100) : 0
    }))
  };

  // Return formatted data
  const response = {
    student: {
      _id: student._id,
      name: student.name,
      email: student.email
    },
    batch: {
      _id: batch._id,
      name: batch.name
    },
    records,
    statistics
  };

  sendSuccess(res, 200, "Student attendance records retrieved successfully", response);
}); 