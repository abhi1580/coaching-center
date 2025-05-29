import asyncHandler from "express-async-handler";
import Batch from "../models/Batch.js";

// @desc    Create a new batch
// @route   POST /api/batches
// @access  Private (Admin only)
const createBatch = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    startDate,
    endDate,
    capacity,
    teacher,
    schedule,
    fee,
  } = req.body;

  const batch = await Batch.create({
    name,
    description,
    startDate,
    endDate,
    capacity,
    teacher,
    schedule,
    fee,
  });

  res.status(201).json({
    success: true,
    data: batch,
  });
});

// @desc    Get all batches
// @route   GET /api/batches
// @access  Private
const getBatches = asyncHandler(async (req, res) => {
  const batches = await Batch.find()
    .populate("teacher", "name email")
    .populate("students", "name email")
    .sort({ startDate: -1 });

  res.json({
    success: true,
    data: batches,
  });
});

// @desc    Get single batch
// @route   GET /api/batches/:id
// @access  Private
const getBatch = asyncHandler(async (req, res) => {
  const batch = await Batch.findById(req.params.id)
    .populate("teacher", "name email")
    .populate("students", "name email");

  if (!batch) {
    return res.status(404).json({
      success: false,
      message: "Batch not found",
    });
  }

  res.json({
    success: true,
    data: batch,
  });
});

// @desc    Update batch
// @route   PUT /api/batches/:id
// @access  Private (Admin only)
const updateBatch = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    startDate,
    endDate,
    capacity,
    teacher,
    schedule,
    fee,
  } = req.body;

  const batch = await Batch.findById(req.params.id);

  if (!batch) {
    return res.status(404).json({
      success: false,
      message: "Batch not found",
    });
  }

  // Update fields
  batch.name = name || batch.name;
  batch.description = description || batch.description;
  batch.startDate = startDate || batch.startDate;
  batch.endDate = endDate || batch.endDate;
  batch.capacity = capacity || batch.capacity;
  batch.teacher = teacher || batch.teacher;
  batch.schedule = schedule || batch.schedule;
  batch.fee = fee || batch.fee;

  const updatedBatch = await batch.save();

  res.json({
    success: true,
    data: updatedBatch,
  });
});

// @desc    Delete batch
// @route   DELETE /api/batches/:id
// @access  Private (Admin only)
const deleteBatch = asyncHandler(async (req, res) => {
  const batch = await Batch.findById(req.params.id);

  if (!batch) {
    return res.status(404).json({
      success: false,
      message: "Batch not found",
    });
  }

  await batch.deleteOne();

  res.json({
    success: true,
    message: "Batch deleted successfully",
  });
});

// @desc    Add student to batch
// @route   POST /api/batches/:id/students
// @access  Private (Admin only)
const addStudentToBatch = asyncHandler(async (req, res) => {
  const { studentId } = req.body;
  const batch = await Batch.findById(req.params.id);

  if (!batch) {
    return res.status(404).json({
      success: false,
      message: "Batch not found",
    });
  }

  // Check if batch is full
  if (batch.currentStudents >= batch.capacity) {
    return res.status(400).json({
      success: false,
      message: "Batch is full",
    });
  }

  // Check if student is already in batch
  if (batch.students.includes(studentId)) {
    return res.status(400).json({
      success: false,
      message: "Student is already in this batch",
    });
  }

  batch.students.push(studentId);
  batch.currentStudents += 1;

  await batch.save();

  res.json({
    success: true,
    data: batch,
  });
});

// @desc    Remove student from batch
// @route   DELETE /api/batches/:id/students/:studentId
// @access  Private (Admin only)
const removeStudentFromBatch = asyncHandler(async (req, res) => {
  const batch = await Batch.findById(req.params.id);

  if (!batch) {
    return res.status(404).json({
      success: false,
      message: "Batch not found",
    });
  }

  // Check if student is in batch
  if (!batch.students.includes(req.params.studentId)) {
    return res.status(400).json({
      success: false,
      message: "Student is not in this batch",
    });
  }

  batch.students = batch.students.filter(
    (id) => id.toString() !== req.params.studentId
  );
  batch.currentStudents -= 1;

  await batch.save();

  res.json({
    success: true,
    data: batch,
  });
});

export {
  createBatch,
  getBatches,
  getBatch,
  updateBatch,
  deleteBatch,
  addStudentToBatch,
  removeStudentFromBatch,
};
