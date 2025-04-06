import Subject from "../models/Subject.js";
import asyncHandler from "../middleware/async.js";

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Public
export const getSubjects = asyncHandler(async (req, res) => {
  try {
    const { standard } = req.query;

    let query = {};

    // If standard ID is provided, filter subjects by standard
    if (standard) {
      // Find the standard first to check if it exists
      const Standard = (await import("../models/Standard.js")).default;
      const standardDoc = await Standard.findById(standard);

      if (!standardDoc) {
        return res.status(404).json({
          success: false,
          error: "Standard not found",
        });
      }

      // Return subjects associated with this standard
      const subjects = await Subject.find({
        _id: { $in: standardDoc.subjects },
      });

      return res.status(200).json({
        success: true,
        count: subjects.length,
        data: subjects,
      });
    }

    // If no standard filter, return all subjects
    const subjects = await Subject.find(query);

    res.status(200).json({
      success: true,
      count: subjects.length,
      data: subjects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
      message: error.message,
    });
  }
});

// @desc    Get single subject
// @route   GET /api/subjects/:id
// @access  Public
export const getSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id);
  if (!subject) {
    return res.status(404).json({
      success: false,
      error: "Subject not found",
    });
  }
  res.status(200).json({
    success: true,
    data: subject,
  });
});

// @desc    Create new subject
// @route   POST /api/subjects
// @access  Private
export const createSubject = asyncHandler(async (req, res) => {
  // Check if user is admin
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Only admin can create subjects",
    });
  }

  // Create subject with only the fields we want
  const subjectData = {
    name: req.body.name,
    description: req.body.description,
    duration: req.body.duration,
    status: req.body.status || "active",
  };

  const subject = await Subject.create(subjectData);
  res.status(201).json({
    success: true,
    data: subject,
  });
});

// @desc    Update subject
// @route   PUT /api/subjects/:id
// @access  Private
export const updateSubject = asyncHandler(async (req, res) => {
  // Check if user is admin
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Only admin can update subjects",
    });
  }

  let subject = await Subject.findById(req.params.id);
  if (!subject) {
    return res.status(404).json({
      success: false,
      error: "Subject not found",
    });
  }

  // Update only the fields we want
  const updateData = {
    name: req.body.name,
    description: req.body.description,
    duration: req.body.duration,
    status: req.body.status,
  };

  subject = await Subject.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: subject,
  });
});

// @desc    Delete subject
// @route   DELETE /api/subjects/:id
// @access  Private
export const deleteSubject = asyncHandler(async (req, res) => {
  // Check if user is admin
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Only admin can delete subjects",
    });
  }

  const subject = await Subject.findByIdAndDelete(req.params.id);
  if (!subject) {
    return res.status(404).json({
      success: false,
      error: "Subject not found",
    });
  }
  res.status(200).json({
    success: true,
    data: {},
  });
});
