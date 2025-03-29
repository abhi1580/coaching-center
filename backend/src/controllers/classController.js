import Class from "../models/Class.js";
import Student from "../models/Student.js";

// @desc    Get all classes
// @route   GET /api/classes
// @access  Private
export const getClasses = async (req, res) => {
  try {
    const classes = await Class.find()
      .populate("teacher", "name email")
      .populate("students", "name email");

    res.json({
      success: true,
      count: classes.length,
      data: classes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in getting classes",
      error: error.message,
    });
  }
};

// @desc    Get single class
// @route   GET /api/classes/:id
// @access  Private
export const getClass = async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id)
      .populate("teacher", "name email")
      .populate("students", "name email phone");

    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    res.json({
      success: true,
      data: classItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in getting class",
      error: error.message,
    });
  }
};

// @desc    Create class
// @route   POST /api/classes
// @access  Private/Admin
export const createClass = async (req, res) => {
  try {
    const {
      name,
      subject,
      teacher,
      schedule,
      capacity,
      startDate,
      endDate,
      fees,
    } = req.body;

    // Create class
    const classItem = await Class.create({
      name,
      subject,
      teacher,
      schedule,
      capacity,
      startDate,
      endDate,
      fees,
    });

    res.status(201).json({
      success: true,
      data: classItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in creating class",
      error: error.message,
    });
  }
};

// @desc    Update class
// @route   PUT /api/classes/:id
// @access  Private/Admin
export const updateClass = async (req, res) => {
  try {
    const {
      name,
      subject,
      teacher,
      schedule,
      capacity,
      startDate,
      endDate,
      fees,
      status,
    } = req.body;

    const classItem = await Class.findById(req.params.id);
    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Check if new capacity is less than current number of students
    if (capacity && capacity < classItem.students.length) {
      return res.status(400).json({
        success: false,
        message: "New capacity cannot be less than current number of students",
      });
    }

    // Update class
    classItem.name = name || classItem.name;
    classItem.subject = subject || classItem.subject;
    classItem.teacher = teacher || classItem.teacher;
    classItem.schedule = schedule || classItem.schedule;
    classItem.capacity = capacity || classItem.capacity;
    classItem.startDate = startDate || classItem.startDate;
    classItem.endDate = endDate || classItem.endDate;
    classItem.fees = fees || classItem.fees;
    classItem.status = status || classItem.status;

    await classItem.save();

    res.json({
      success: true,
      data: classItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in updating class",
      error: error.message,
    });
  }
};

// @desc    Delete class
// @route   DELETE /api/classes/:id
// @access  Private/Admin
export const deleteClass = async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id);

    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Remove class from all enrolled students
    await Student.updateMany(
      { enrolledClasses: classItem._id },
      { $pull: { enrolledClasses: classItem._id } }
    );

    await classItem.remove();

    res.json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in deleting class",
      error: error.message,
    });
  }
};

// @desc    Add student to class
// @route   POST /api/classes/:id/students
// @access  Private
export const addStudent = async (req, res) => {
  try {
    const { studentId } = req.body;

    const classItem = await Class.findById(req.params.id);
    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Check if class is at capacity
    if (classItem.students.length >= classItem.capacity) {
      return res.status(400).json({
        success: false,
        message: "Class is at full capacity",
      });
    }

    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Check if student is already enrolled
    if (classItem.students.includes(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Student is already enrolled in this class",
      });
    }

    // Add student to class
    classItem.students.push(studentId);
    await classItem.save();

    // Add class to student's enrolled classes
    student.enrolledClasses.push(classItem._id);
    await student.save();

    res.json({
      success: true,
      data: classItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in adding student to class",
      error: error.message,
    });
  }
};

// @desc    Remove student from class
// @route   DELETE /api/classes/:id/students/:studentId
// @access  Private
export const removeStudent = async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id);
    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Remove student from class
    classItem.students = classItem.students.filter(
      (student) => student.toString() !== req.params.studentId
    );
    await classItem.save();

    // Remove class from student's enrolled classes
    await Student.findByIdAndUpdate(req.params.studentId, {
      $pull: { enrolledClasses: classItem._id },
    });

    res.json({
      success: true,
      data: classItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in removing student from class",
      error: error.message,
    });
  }
};
