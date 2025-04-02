import User from "../models/User.js";
import Subject from "../models/Subject.js";
import Payment from "../models/Payment.js";
import Class from "../models/Class.js";

const getStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    let stats = {};

    if (user.role === "admin") {
      stats = {
        totalStudents: await User.countDocuments({ role: "student" }),
        totalTeachers: await User.countDocuments({ role: "teacher" }),
        totalSubjects: await Subject.countDocuments(),
        totalRevenue: await Payment.aggregate([
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]).then((result) => result[0]?.total || 0),
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
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Error fetching dashboard statistics" });
  }
};

const getRecentActivities = async (req, res) => {
  try {
    const activities = await Payment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("student", "name")
      .populate("subject", "name");

    res.json(activities);
  } catch (error) {
    console.error("Error fetching recent activities:", error);
    res.status(500).json({ message: "Error fetching recent activities" });
  }
};

const getUpcomingClasses = async (req, res) => {
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
    console.error("Error fetching upcoming classes:", error);
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

const dashboardController = {
  getStats,
  getRecentActivities,
  getUpcomingClasses,
};

export default dashboardController;
