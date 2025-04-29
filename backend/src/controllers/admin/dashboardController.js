import Student from "../../models/Student.js";
import Teacher from "../../models/Teacher.js";
import Batch from "../../models/Batch.js";
import Payment from "../../models/Payment.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response/responseHandler.js";

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
  
  sendSuccess(res, 200, "Dashboard summary retrieved successfully", dashboardData);
});

/**
 * @desc    Get revenue statistics
 * @route   GET /api/admin/dashboard/revenue
 * @access  Private (Admin only)
 */
export const getRevenueStats = asyncHandler(async (req, res) => {
  // Get today's date
  const today = new Date();
  
  // Get start of current month
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  // Get start of previous month
  const startOfPrevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  
  // Get start of current year
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  
  // Aggregate payments for different periods
  const [monthlyStats] = await Payment.aggregate([
    {
      $facet: {
        thisMonth: [
          { $match: { 
            paymentDate: { $gte: startOfMonth },
            status: "completed"
          }},
          { $group: { 
            _id: null, 
            total: { $sum: "$amount" },
            count: { $sum: 1 }
          }}
        ],
        prevMonth: [
          { $match: { 
            paymentDate: { 
              $gte: startOfPrevMonth, 
              $lt: startOfMonth 
            },
            status: "completed"
          }},
          { $group: { 
            _id: null, 
            total: { $sum: "$amount" },
            count: { $sum: 1 }
          }}
        ],
        thisYear: [
          { $match: { 
            paymentDate: { $gte: startOfYear },
            status: "completed"
          }},
          { $group: { 
            _id: null, 
            total: { $sum: "$amount" },
            count: { $sum: 1 }
          }}
        ],
        // Monthly breakdown
        byMonth: [
          { $match: { 
            paymentDate: { $gte: startOfYear },
            status: "completed"
          }},
          { $group: { 
            _id: { 
              month: { $month: "$paymentDate" },
              year: { $year: "$paymentDate" }
            }, 
            total: { $sum: "$amount" },
            count: { $sum: 1 }
          }},
          { $sort: { "_id.year": 1, "_id.month": 1 } }
        ],
        // Payment methods
        byMethod: [
          { $match: { status: "completed" }},
          { $group: { 
            _id: "$paymentMethod", 
            total: { $sum: "$amount" },
            count: { $sum: 1 }
          }},
          { $sort: { "total": -1 } }
        ]
      }
    }
  ]);
  
  // Process the results to handle empty/null values
  const revenueStats = {
    thisMonth: {
      total: monthlyStats.thisMonth[0]?.total || 0,
      count: monthlyStats.thisMonth[0]?.count || 0
    },
    prevMonth: {
      total: monthlyStats.prevMonth[0]?.total || 0,
      count: monthlyStats.prevMonth[0]?.count || 0
    },
    thisYear: {
      total: monthlyStats.thisYear[0]?.total || 0,
      count: monthlyStats.thisYear[0]?.count || 0
    },
    byMonth: monthlyStats.byMonth.map(item => ({
      month: item._id.month,
      year: item._id.year,
      total: item.total,
      count: item.count
    })),
    byMethod: monthlyStats.byMethod.map(item => ({
      method: item._id,
      total: item.total,
      count: item.count
    }))
  };
  
  // Calculate growth
  if (revenueStats.prevMonth.total > 0) {
    revenueStats.growth = (revenueStats.thisMonth.total - revenueStats.prevMonth.total) / revenueStats.prevMonth.total * 100;
  } else {
    revenueStats.growth = revenueStats.thisMonth.total > 0 ? 100 : 0;
  }
  
  sendSuccess(res, 200, "Revenue statistics retrieved successfully", revenueStats);
}); 