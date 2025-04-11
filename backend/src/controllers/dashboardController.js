import User from "../models/User.js";
import Subject from "../models/Subject.js";
import Payment from "../models/Payment.js";
import Batch from "../models/Batch.js";
import Standard from "../models/Standard.js";
import Announcement from "../models/Announcement.js";

// Export individual controller functions for easier imports
export const getStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    let stats = {};

    if (user.role === "admin") {
      // Get total students
      const totalStudents = await User.countDocuments({ role: "student" });
      // Get total teachers
      const totalTeachers = await User.countDocuments({ role: "teacher" });

      // Get total batches
      const totalBatches = await Batch.countDocuments();

      // Get total subjects
      const totalSubjects = await Subject.countDocuments();

      // Get total standards
      const totalStandards = await Standard.countDocuments();

      // Get total payments and revenue
      const paymentStats = await Payment.aggregate([
        {
          $group: {
            _id: null,
            totalPayments: { $sum: 1 },
            totalRevenue: { $sum: "$amount" },
          },
        },
      ]).then((result) => result[0] || { totalPayments: 0, totalRevenue: 0 });

      // Get total announcements
      const totalAnnouncements = await Announcement.countDocuments();

      stats = {
        totalStudents,
        totalTeachers,
        totalBatches,
        totalSubjects,
        totalStandards,
        totalPayments: paymentStats.totalPayments,
        totalRevenue: paymentStats.totalRevenue,
        totalAnnouncements,
        // Calculate percentages for growth indicators
        studentGrowth: await calculateGrowthPercentage(User, {
          role: "student",
        }),
        teacherGrowth: await calculateGrowthPercentage(User, {
          role: "teacher",
        }),
        revenueGrowth: await calculateRevenueGrowth(),
      };
    } else if (user.role === "teacher") {
      const teacherSubjects = await Subject.find({ teacher: user._id });
      const subjectIds = teacherSubjects.map((subject) => subject._id);

      stats = {
        myStudents: await User.countDocuments({
          role: "student",
          subjects: { $in: subjectIds },
        }),
        mySubjects: teacherSubjects.length,
        averagePerformance: await calculateAveragePerformance(subjectIds),
      };
    } else if (user.role === "student") {
      const studentSubjects = await Subject.find({ students: user._id });
      const subjectIds = studentSubjects.map((subject) => subject._id);

      stats = {
        mySubjects: studentSubjects.length,
        attendance: await calculateAttendance(user._id, subjectIds),
        averageScore: await calculateAverageScore(user._id, subjectIds),
      };
    }

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Error fetching dashboard statistics" });
  }
};

export const getRecentActivities = async (req, res) => {
  try {
    const activities = await Payment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("student", "name")
      .populate("subject", "name");

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: "Error fetching recent activities" });
  }
};

export const getUpcomingClasses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    let query = {};

    if (user.role === "teacher") {
      query = { teacher: user._id };
    } else if (user.role === "student") {
      query = { students: user._id };
    }

    const upcomingClasses = await Class.find({
      ...query,
      startTime: { $gte: new Date() },
    })
      .sort({ startTime: 1 })
      .limit(5)
      .populate("subject", "name")
      .populate("teacher", "name");

    res.json(upcomingClasses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching upcoming classes" });
  }
};

// Helper functions
const calculateAveragePerformance = async (subjectIds) => {
  // Implementation for calculating average performance
  // This would typically involve attendance, etc.
  return 75; // Placeholder
};

const calculateAttendance = async (studentId, subjectIds) => {
  // Implementation for calculating attendance percentage
  return 85; // Placeholder
};

const calculateAverageScore = async (studentId, subjectIds) => {
  // Implementation for calculating average score
  return 78; // Placeholder
};

// Helper function to calculate growth percentage
const calculateGrowthPercentage = async (Model, query = {}) => {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const currentCount = await Model.countDocuments({
    ...query,
    createdAt: { $lte: now },
  });

  const lastMonthCount = await Model.countDocuments({
    ...query,
    createdAt: { $lte: lastMonth },
  });

  if (lastMonthCount === 0) return 100;
  return ((currentCount - lastMonthCount) / lastMonthCount) * 100;
};

// Helper function to calculate revenue growth
const calculateRevenueGrowth = async () => {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const currentRevenue = await Payment.aggregate([
    {
      $match: {
        createdAt: { $lte: now },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" },
      },
    },
  ]).then((result) => result[0]?.total || 0);

  const lastMonthRevenue = await Payment.aggregate([
    {
      $match: {
        createdAt: { $lte: lastMonth },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" },
      },
    },
  ]).then((result) => result[0]?.total || 0);

  if (lastMonthRevenue === 0) return 100;
  return ((currentRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
};
