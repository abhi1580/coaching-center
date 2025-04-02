import Subject from "../models/Subject.js";
import asyncHandler from "../middleware/async.js";

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Public
export const getSubjects = asyncHandler(async (req, res) => {
  const subjects = await Subject.find();
  res.status(200).json({
    success: true,
    count: subjects.length,
    data: subjects,
  });
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
