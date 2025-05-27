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
export const createSubject = async (req, res) => {
  try {
    const { name, description, duration } = req.body;

    // Validate required fields
    if (!name || !description || !duration) {
      return res.status(400).json({
        success: false,
        message: "Name, description, and duration are required",
        error: "VALIDATION_ERROR",
      });
    }

    // Normalize the subject name
    const normalizedName = name.toLowerCase().trim();

    // Check for existing subject with case-insensitive comparison
    const existingSubject = await Subject.findOne({
      name: { $regex: new RegExp(`^${normalizedName}$`, "i") },
    });

    if (existingSubject) {
      return res.status(400).json({
        success: false,
        message: "A subject with this name already exists",
        error: "DUPLICATE_SUBJECT",
      });
    }

    // Create new subject with normalized name
    const subject = new Subject({
      name: normalizedName,
      description,
      duration,
    });

    await subject.save();

    res.status(201).json({
      success: true,
      message: "Subject created successfully",
      data: subject,
    });
  } catch (error) {
    console.error("Error creating subject:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create subject",
      error: error.message,
    });
  }
};

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

  const subjectName = req.body.name.toLowerCase().trim();

  // Check if another subject with the same name exists (excluding current subject)
  const existingSubject = await Subject.findOne({
    name: { $regex: new RegExp(`^${subjectName}$`, "i") },
    _id: { $ne: req.params.id }, // Exclude current subject
  });

  if (existingSubject) {
    return res.status(400).json({
      success: false,
      message: "A subject with this name already exists",
      error: "DUPLICATE_SUBJECT",
    });
  }

  // Update only the fields we want
  const updateData = {
    name: subjectName,
    description: req.body.description,
    duration: req.body.duration,
  };

  try {
    subject = await Subject.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: subject,
    });
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A subject with this name already exists",
        error: "DUPLICATE_SUBJECT",
      });
    }

    // Handle other errors
    res.status(500).json({
      success: false,
      message: "Error updating subject",
      error: error.message,
    });
  }
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
