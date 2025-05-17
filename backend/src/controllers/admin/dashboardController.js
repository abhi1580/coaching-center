import Student from "../../models/Student.js";
import Teacher from "../../models/Teacher.js";
import Batch from "../../models/Batch.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/responseUtil.js";

/**
 * @desc    Get admin dashboard summary
 * @route   GET /api/admin/dashboard/summary
 * @access  Private (Admin only)
 */
export const getDashboardSummary = asyncHandler(async (req, res) => {
  // Get counts
  const studentCount = await Student.countDocuments({ isActive: true });
  const teacherCount = await Teacher.countDocuments({ status: "active" });
  const batchCount = await Batch.countDocuments({ isActive: true });

  // Get recent 5 students
  const recentStudents = await Student.find({ isActive: true })
    .sort({ createdAt: -1 })
    .limit(5)
    .select("name email phone standard createdAt");

  // Get recent 5 batches
  const recentBatches = await Batch.find({ isActive: true })
    .sort({ createdAt: -1 })
    .limit(5)
    .select("name subject standard teacher schedule")
    .populate("subject", "name")
    .populate("standard", "name")
    .populate("teacher", "name");

  const dashboardData = {
    counts: {
      students: studentCount,
      teachers: teacherCount,
      batches: batchCount,
    },
    recentStudents,
    recentBatches,
  };

  sendSuccess(
    res,
    200,
    "Dashboard summary retrieved successfully",
    dashboardData
  );
});
