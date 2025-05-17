import User from "../models/User.js";
import Subject from "../models/Subject.js";
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

      // Get total announcements
      const totalAnnouncements = await Announcement.countDocuments();

      stats = {
        totalStudents,
        totalTeachers,
        totalBatches,
        totalSubjects,
        totalStandards,
        totalAnnouncements,
        // Calculate percentages for growth indicators
        studentGrowth: await calculateGrowthPercentage(User, {
          role: "student",
        }),
        teacherGrowth: await calculateGrowthPercentage(User, {
          role: "teacher",
        })
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
        averageScore: await calculateAverageScore(user._id, subjectIds),
      };
    }

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Error fetching dashboard statistics" });
  }
};

// Export function to get recent activities
export const getRecentActivities = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    let activities = [];

    // Common query limit
    const limit = 10;

    if (user.role === "admin") {
      // For admin, get a mix of recent activities
      // 1. Recent student registrations
      const recentStudents = await User.find({ role: "student" })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name email role createdAt");

      // 2. Recent teacher registrations
      const recentTeachers = await User.find({ role: "teacher" })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name email role createdAt");

      // 3. Recent announcements
      const recentAnnouncements = await Announcement.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select("title content startDate endDate");

      // Combine and sort by most recent
      activities = [
        ...recentStudents.map(student => ({
          type: 'registration',
          entityType: 'student',
          user: student.name,
          email: student.email,
          date: student.createdAt,
          details: `New student registered`
        })),
        ...recentTeachers.map(teacher => ({
          type: 'registration',
          entityType: 'teacher',
          user: teacher.name,
          email: teacher.email,
          date: teacher.createdAt,
          details: `New teacher registered`
        })),
        ...recentAnnouncements.map(announcement => ({
          type: 'announcement',
          title: announcement.title,
          date: announcement.createdAt,
          details: `New announcement: ${announcement.title}`
        }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, limit);
    } else if (user.role === "teacher") {
      // For teachers, show their recent batches, announcements, etc.
      // Placeholder for now - would need to be customized based on your data model
      activities = [
        {
          type: 'info',
          details: 'Recent activities will be shown here',
          date: new Date()
        }
      ];
    } else if (user.role === "student") {
      // For students, show their recent attendance, assignments, etc.
      // Placeholder for now - would need to be customized based on your data model
      activities = [
        {
          type: 'info',
          details: 'Recent activities will be shown here',
          date: new Date()
        }
      ];
    }

    res.json(activities);
  } catch (error) {
    console.error("Error fetching recent activities:", error);
    res.status(500).json({ message: "Error fetching recent activities" });
  }
};

// Export function to get upcoming classes
export const getUpcomingClasses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    let upcomingClasses = [];

    // Get today's date at the start of the day
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get end of the next 7 days
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    nextWeek.setHours(23, 59, 59, 999);

    if (user.role === "admin") {
      // For admin, get all upcoming classes across all batches
      upcomingClasses = await Batch.find({
        // Find batches with schedules that fall within the next 7 days
        "schedule.day": { $gte: today, $lte: nextWeek }
      })
      .populate("subject", "name")
      .populate("teacher", "name")
      .populate("standard", "name")
      .select("name schedule");
    } else if (user.role === "teacher") {
      // For teacher, get their upcoming classes
      // First find the teacher record for this user
      const teacher = await Teacher.findOne({ user: user._id });
      
      if (teacher) {
        upcomingClasses = await Batch.find({
          teacher: teacher._id,
          // Find batches with schedules that fall within the next 7 days
          "schedule.day": { $gte: today, $lte: nextWeek }
        })
        .populate("subject", "name")
        .populate("standard", "name")
        .select("name schedule");
      }
    } else if (user.role === "student") {
      // For student, get their upcoming classes
      // First find the student record for this user
      const student = await Student.findOne({ user: user._id });
      
      if (student) {
        upcomingClasses = await Batch.find({
          _id: { $in: student.batches },
          // Find batches with schedules that fall within the next 7 days
          "schedule.day": { $gte: today, $lte: nextWeek }
        })
        .populate("subject", "name")
        .populate("teacher", "name")
        .select("name schedule");
      }
    }

    // Format the response
    const formattedClasses = upcomingClasses.map(batch => ({
      batchId: batch._id,
      batchName: batch.name,
      subject: batch.subject?.name || 'Unknown Subject',
      teacher: batch.teacher?.name || 'Unknown Teacher',
      standard: batch.standard?.name || 'Unknown Standard',
      schedule: batch.schedule
    }));

    res.json(formattedClasses);
  } catch (error) {
    console.error("Error fetching upcoming classes:", error);
    res.status(500).json({ message: "Error fetching upcoming classes" });
  }
};

// Helper functions
const calculateAveragePerformance = async (subjectIds) => {
  try {
    // This is a placeholder. In a real application, you would:
    // 1. Get all students for these subjects
    // 2. Calculate their test scores or assessment results
    // 3. Return an average
    
    // For now, return a random value between 70-95%
    return Math.floor(Math.random() * 25) + 70;
  } catch (error) {
    console.error("Error calculating average performance:", error);
    return 0;
  }
};

const calculateAverageScore = async (studentId, subjectIds) => {
  try {
    // This is a placeholder. In a real application, you would:
    // 1. Get all tests/assignments for these subjects
    // 2. Calculate the student's average score
    
    // For now, return a random value between 65-95%
    return Math.floor(Math.random() * 30) + 65;
  } catch (error) {
    console.error("Error calculating average score:", error);
    return 0;
  }
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


