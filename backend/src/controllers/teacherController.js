import Teacher from "../models/Teacher.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import Batch from "../models/Batch.js";
import Announcement from "../models/Announcement.js";
import asyncHandler from "express-async-handler";

// @desc    Get all teachers
// @route   GET /api/teachers
// @access  Private (Admin only)
export const getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find().populate(
      "batches",
      "name subject schedule"
    );

    res.json({
      success: true,
      count: teachers.length,
      data: teachers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in getting teachers",
      error: error.message,
    });
  }
};

// @desc    Get single teacher
// @route   GET /api/teachers/:id
// @access  Private (Admin only)
export const getTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id).populate(
      "batches",
      "name subject schedule"
    );

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    res.json({
      success: true,
      data: teacher,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in getting teacher",
      error: error.message,
    });
  }
};

// @desc    Create new teacher
// @route   POST /api/teachers
// @access  Private (Admin only)
export const createTeacher = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      address,
      subjects,
      qualification,
      experience,
      joiningDate,
      salary,
      gender,
      status,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !email ||
      !password ||
      !phone ||
      !address ||
      !subjects ||
      !qualification ||
      !experience
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Check if teacher already exists
    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
      return res.status(400).json({
        success: false,
        message: "Teacher already exists",
      });
    }

    // Create user account first
    const user = await User.create({
      name,
      email,
      password,
      phone,
      address,
      role: "teacher",
      gender,
    });

    // Create teacher record
    const teacher = await Teacher.create({
      user: user._id,
      name,
      email,
      phone,
      address,
      subjects,
      qualification,
      experience,
      joiningDate,
      salary,
      gender,
      status: status || "active",
    });

    res.status(201).json({
      success: true,
      data: teacher,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in creating teacher",
      error: error.message,
    });
  }
};

// @desc    Update teacher
// @route   PUT /api/teachers/:id
// @access  Private (Admin only)
export const updateTeacher = async (req, res) => {
  try {
    const {
      name,
      phone,
      address,
      subjects,
      qualification,
      experience,
      joiningDate,
      salary,
      status,
      gender,
      password,
    } = req.body;

    // Find the teacher
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    // Update teacher fields
    teacher.name = name || teacher.name;
    teacher.phone = phone || teacher.phone;
    teacher.address = address || teacher.address;
    teacher.subjects = subjects || teacher.subjects;
    teacher.qualification = qualification || teacher.qualification;
    teacher.experience = experience || teacher.experience;
    teacher.joiningDate = joiningDate || teacher.joiningDate;
    teacher.salary = salary || teacher.salary;
    teacher.status = status || teacher.status;
    teacher.gender = gender || teacher.gender;

    // Save the updated teacher
    const updatedTeacher = await teacher.save();

    // Update associated user if exists
    if (teacher.user) {
      const user = await User.findById(teacher.user);
      if (user) {
        user.name = name || user.name;
        user.phone = phone || user.phone;
        user.address = address || user.address;
        user.gender = gender || user.gender;

        // Only update password if provided
        if (password) {
          user.password = password;
        }

        await user.save();
      }
    }

    res.json({
      success: true,
      data: updatedTeacher,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in updating teacher",
      error: error.message,
    });
  }
};

// @desc    Delete teacher
// @route   DELETE /api/teachers/:id
// @access  Private (Admin only)
export const deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    // Delete teacher record
    await Teacher.findByIdAndDelete(req.params.id);

    // Delete corresponding user record
    if (teacher.user) {
      await User.findByIdAndDelete(teacher.user);
    }

    res.json({
      success: true,
      message: "Teacher deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in deleting teacher",
      error: error.message,
    });
  }
};

// @desc    Get teachers by subject
// @route   GET /api/teachers/subject/:subject
// @access  Private
export const getTeachersBySubject = async (req, res) => {
  try {
    const { subject } = req.params;

    const teachers = await Teacher.find({
      subjects: { $in: [subject] },
      status: "Active",
    }).select("name email subjects");

    res.json({
      success: true,
      count: teachers.length,
      data: teachers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in getting teachers by subject",
      error: error.message,
    });
  }
};

/**
 * @desc    Get teacher dashboard data
 * @route   GET /api/teachers/dashboard
 * @access  Private/Teacher
 */
export const getTeacherDashboard = asyncHandler(async (req, res) => {
  try {
    // Get authenticated user's ID
    const userId = req.user.id;

    // Find the teacher profile for this user
    const teacher = await Teacher.findOne({ user: userId }).populate("user", "name email");

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher profile not found",
      });
    }

    // Get all batches assigned to this teacher with populated data
    const batches = await Batch.find({ teacher: teacher._id })
      .populate("subject", "name")
      .populate("standard", "name")
      .populate({
        path: "enrolledStudents",
        select: "name email phone"
      });

    console.log(`Dashboard: Fetched ${batches.length} batches for teacher ${teacher.name}`);
    
    // Debug each batch's student count
    let totalEnrolledStudents = 0;
    batches.forEach((batch, index) => {
      const studentCount = batch.enrolledStudents ? batch.enrolledStudents.length : 0;
      totalEnrolledStudents += studentCount;
      console.log(`Dashboard - Batch ${index + 1} (${batch.name}): ${studentCount} students`);
      if (batch.enrolledStudents && batch.enrolledStudents.length > 0) {
        console.log(`  First student: ${JSON.stringify(batch.enrolledStudents[0])}`);
      }
    });

    // Import Student model
    const Student = mongoose.models.Student || mongoose.model('Student');
    
    // Find students that have these batches in their 'batches' array
    const batchIds = batches.map(batch => batch._id);
    const studentsWithBatches = await Student.find({
      batches: { $in: batchIds }
    }).select('_id name email phone batches');
    
    console.log(`Found ${studentsWithBatches.length} students with these batches in their record`);

    // Calculate total number of unique students from both sources
    const uniqueStudents = new Set();
    
    // Add students from enrolledStudents arrays
    batches.forEach(batch => {
      if (batch.enrolledStudents && batch.enrolledStudents.length > 0) {
        batch.enrolledStudents.forEach(student => {
          if (student && student._id) {
            uniqueStudents.add(student._id.toString());
          }
        });
      }
    });
    
    // Add students from the dedicated query
    studentsWithBatches.forEach(student => {
      uniqueStudents.add(student._id.toString());
    });
    
    console.log(`Total unique students found: ${uniqueStudents.size}`);
    
    // Get active announcements for the teacher
    const announcements = await Announcement.find({
      targetAudience: { $in: ['all', 'teachers'] },
      expiryDate: { $gte: new Date() }
    }).sort({ createdAt: -1 });

    // Get upcoming classes for the next week
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    const upcomingClasses = [];
    
    batches.forEach(batch => {
      if (batch.status === 'active' || batch.status === 'upcoming') {
        // Check if schedule and days exist and are valid
        if (batch.schedule && batch.schedule.days && Array.isArray(batch.schedule.days)) {
          batch.schedule.days.forEach(day => {
            // Create a date object for the next occurrence of this schedule day
            const nextClassDate = getNextDayOfWeek(today, day);
            
            if (nextClassDate && nextClassDate <= nextWeek) {
              upcomingClasses.push({
                batchName: batch.name,
                subject: batch.subject ? batch.subject.name : 'Not assigned',
                standard: batch.standard ? batch.standard.name : 'Not assigned',
                day: day,
                startTime: batch.schedule.startTime,
                endTime: batch.schedule.endTime,
                date: nextClassDate
              });
            }
          });
        }
      }
    });
    
    // Sort upcoming classes by date and time
    upcomingClasses.sort((a, b) => {
      if (a.date.getTime() !== b.date.getTime()) {
        return a.date.getTime() - b.date.getTime();
      }
      return a.startTime.localeCompare(b.startTime);
    });

    return res.json({
      success: true,
      data: {
        totalBatches: batches.length,
        totalStudents: uniqueStudents.size,
        activeAnnouncements: announcements,
        upcomingClasses: upcomingClasses
      }
    });
  } catch (error) {
    console.error("Error in getTeacherDashboard:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
});

/**
 * @desc    Get batches for authenticated teacher
 * @route   GET /api/teachers/batches
 * @access  Private/Teacher
 */
export const getTeacherBatches = asyncHandler(async (req, res) => {
  try {
    // Get authenticated user's ID
    const userId = req.user.id;

    // Find the teacher profile for this user
    const teacher = await Teacher.findOne({ user: userId });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher profile not found",
      });
    }

    // Get all batches assigned to this teacher with populated data
    const batches = await Batch.find({ teacher: teacher._id })
      .populate("subject", "name")
      .populate("standard", "name")
      .populate({
        path: "enrolledStudents",
        select: "name email phone"
      });
      
    console.log(`Fetched ${batches.length} batches, populating enrolledStudents: true`);
    
    // Debug the content of enrolledStudents for each batch
    batches.forEach((batch, index) => {
      console.log(`Batch ${index + 1} (${batch.name}): ${batch.enrolledStudents ? batch.enrolledStudents.length : 0} students`);
    });

    // Import Student model
    const Student = mongoose.models.Student || mongoose.model('Student');
    
    // Find students that have these batches in their 'batches' array
    const batchIds = batches.map(batch => batch._id);
    const studentsWithBatches = await Student.find({
      batches: { $in: batchIds }
    }).select('_id name email phone batches');
    
    console.log(`Found ${studentsWithBatches.length} students with these batches in their record`);
    
    // Create a map to organize students by batch
    const studentsByBatch = {};
    
    studentsWithBatches.forEach(student => {
      student.batches.forEach(batchId => {
        const batchIdStr = batchId.toString();
        if (!studentsByBatch[batchIdStr]) {
          studentsByBatch[batchIdStr] = [];
        }
        
        // Only add if not already in the list
        const exists = studentsByBatch[batchIdStr].some(s => 
          s._id.toString() === student._id.toString()
        );
        
        if (!exists) {
          studentsByBatch[batchIdStr].push({
            _id: student._id,
            name: student.name,
            email: student.email,
            phone: student.phone
          });
        }
      });
    });
    
    // Combine both sources of students for each batch
    batches.forEach(batch => {
      const batchId = batch._id.toString();
      const studentsFromBatchesArray = studentsByBatch[batchId] || [];
      
      // Create a map of existing student IDs to avoid duplicates
      const existingStudentMap = new Map();
      
      if (batch.enrolledStudents && batch.enrolledStudents.length > 0) {
        batch.enrolledStudents.forEach(student => {
          if (student && student._id) {
            existingStudentMap.set(student._id.toString(), student);
          }
        });
      }
      
      // Add students from batches array if not already included
      studentsFromBatchesArray.forEach(student => {
        if (!existingStudentMap.has(student._id.toString())) {
          if (!batch.enrolledStudents) {
            batch.enrolledStudents = [];
          }
          batch.enrolledStudents.push(student);
          existingStudentMap.set(student._id.toString(), student);
        }
      });
    });
    
    // Log final counts after combining sources
    console.log("Final batch student counts after combining sources:");
    batches.forEach((batch, index) => {
      console.log(`Batch ${index + 1} (${batch.name}): ${batch.enrolledStudents ? batch.enrolledStudents.length : 0} students`);
    });

    return res.json({
      success: true,
      count: batches.length,
      data: batches
    });
  } catch (error) {
    console.error("Error in getTeacherBatches:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
});

// Helper function to get the next date for a given day of week
function getNextDayOfWeek(date, dayName) {
  if (!dayName) return null;
  
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const targetDay = days.indexOf(dayName.toLowerCase());
  
  if (targetDay < 0) return null;
  
  const resultDate = new Date(date);
  const currentDay = resultDate.getDay();
  
  resultDate.setDate(date.getDate() + (targetDay + 7 - currentDay) % 7);
  
  // If it's the same day and we've already passed the time, get next week
  if (targetDay === currentDay && date.getHours() >= 12) {
    resultDate.setDate(resultDate.getDate() + 7);
  }
  
  return resultDate;
}

/**
 * @desc    Get authenticated teacher's profile
 * @route   GET /api/teachers/me
 * @access  Private/Teacher
 */
export const getTeacherProfile = asyncHandler(async (req, res) => {
  // Get authenticated user's ID
  const userId = req.user.id;

  // Find the teacher profile for this user with populated user data
  const teacher = await Teacher.findOne({ user: userId })
    .populate("user", "name email phone address gender")
    .populate({
      path: "subjects",
      select: "name description",
      model: "Subject"
    });

  if (!teacher) {
    return res.status(404).json({
      success: false,
      message: "Teacher profile not found",
    });
  }

  // If subjects are object IDs and not populated objects, fetch them separately
  let formattedTeacher = teacher.toObject();
  
  // If subjects is an array of strings or IDs instead of populated objects
  if (Array.isArray(formattedTeacher.subjects) && 
      formattedTeacher.subjects.length > 0 && 
      typeof formattedTeacher.subjects[0] === 'string') {
    
    // Format the response to include subject names instead of IDs
    try {
      const Subject = mongoose.model('Subject');
      const subjectDocs = await Subject.find({
        _id: { $in: formattedTeacher.subjects }
      }).select('name description');
      
      formattedTeacher.subjectDetails = subjectDocs;
      // Keep original subjects array for backward compatibility
    } catch (error) {
      console.error("Error fetching subject details:", error);
    }
  }

  res.json({
    success: true,
    data: formattedTeacher
  });
});

/**
 * @desc    Update authenticated teacher's profile
 * @route   PUT /api/teachers/me
 * @access  Private/Teacher
 */
export const updateTeacherProfile = asyncHandler(async (req, res) => {
  // Get authenticated user's ID
  const userId = req.user.id;
  
  // Find the teacher profile for this user
  const teacher = await Teacher.findOne({ user: userId });

  if (!teacher) {
    return res.status(404).json({
      success: false,
      message: "Teacher profile not found",
    });
  }

  const {
    name,
    phone,
    address,
    qualification,
    experience,
  } = req.body;

  // Update teacher fields that are provided
  if (name) teacher.name = name;
  if (phone) teacher.phone = phone;
  if (address) teacher.address = address;
  if (qualification) teacher.qualification = qualification;
  if (experience) teacher.experience = experience;

  // Save updated teacher profile
  await teacher.save();

  // If name, phone, or address are updated, also update the user record
  if (name || phone || address) {
    const user = await User.findById(userId);
    if (user) {
      if (name) user.name = name;
      if (phone) user.phone = phone;
      if (address) user.address = address;
      await user.save();
    }
  }

  // Get the updated teacher with populated fields
  const updatedTeacher = await Teacher.findOne({ user: userId })
    .populate("user", "name email phone address gender")
    .populate({
      path: "subjects",
      select: "name description",
      model: "Subject"
    });

  // Format response to include subject details
  let formattedTeacher = updatedTeacher.toObject();
  
  // If subjects is an array of strings or IDs instead of populated objects
  if (Array.isArray(formattedTeacher.subjects) && 
      formattedTeacher.subjects.length > 0 && 
      typeof formattedTeacher.subjects[0] === 'string') {
    
    try {
      const Subject = mongoose.model('Subject');
      const subjectDocs = await Subject.find({
        _id: { $in: formattedTeacher.subjects }
      }).select('name description');
      
      formattedTeacher.subjectDetails = subjectDocs;
    } catch (error) {
      console.error("Error fetching subject details:", error);
    }
  }

  res.json({
    success: true,
    message: "Profile updated successfully",
    data: formattedTeacher
  });
});
