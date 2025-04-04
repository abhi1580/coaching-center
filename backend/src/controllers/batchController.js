import { validationResult } from "express-validator";
import Batch from "../models/Batch.js";
import Standard from "../models/Standard.js";
import Subject from "../models/Subject.js";

// Get all batches
export const getAllBatches = async (req, res) => {
  try {
    const batches = await Batch.find()
      .populate("standard", "name level")
      .populate("subject", "name")
      .populate("teacher", "name");
    res.json(batches);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get a single batch
export const getBatchById = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate("standard", "name level")
      .populate("subject", "name")
      .populate("teacher", "name");
    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }
    res.json(batch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new batch
export const createBatch = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { standard, subject } = req.body;

    // Check if standard exists
    const standardExists = await Standard.findById(standard);
    if (!standardExists) {
      return res.status(404).json({ message: "Standard not found" });
    }

    // Check if subject exists and belongs to the standard
    const subjectExists = await Subject.findById(subject);
    if (!subjectExists) {
      return res.status(404).json({ message: "Subject not found" });
    }

    // Ensure fees is a number
    const batchData = {
      ...req.body,
      fees: Number(req.body.fees),
    };

    const batch = new Batch(batchData);
    const newBatch = await batch.save();

    const populatedBatch = await Batch.findById(newBatch._id)
      .populate("standard", "name level")
      .populate("subject", "name")
      .populate("teacher", "name");

    res.status(201).json(populatedBatch);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a batch
export const updateBatch = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { standard, subject } = req.body;

    // Check if standard exists
    if (standard) {
      const standardExists = await Standard.findById(standard);
      if (!standardExists) {
        return res.status(404).json({ message: "Standard not found" });
      }
    }

    // Check if subject exists
    if (subject) {
      const subjectExists = await Subject.findById(subject);
      if (!subjectExists) {
        return res.status(404).json({ message: "Subject not found" });
      }
    }

    const batch = await Batch.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    // Ensure fees is a number if provided
    const updateData = { ...req.body };
    if (updateData.fees) {
      updateData.fees = Number(updateData.fees);
    }

    Object.assign(batch, updateData);
    await batch.save();

    const updatedBatch = await Batch.findById(batch._id)
      .populate("standard", "name level")
      .populate("subject", "name")
      .populate("teacher", "name");

    res.json(updatedBatch);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a batch
export const deleteBatch = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({ message: "Batch not found" });
    }
    await batch.deleteOne();
    res.json({ message: "Batch deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get batches by subject
export const getBatchesBySubject = async (req, res) => {
  try {
    let { subjects, standard } = req.query;
    console.log("Get batches by subject request:", { subjects, standard });

    // Validate query parameters
    if (!subjects) {
      return res.status(400).json({
        success: false,
        message: "Subject ID is required",
      });
    }

    // Convert subjects to array if it's a string
    if (!Array.isArray(subjects)) {
      // If multiple subjects are passed as comma-separated string
      if (subjects.includes(",")) {
        subjects = subjects.split(",");
      } else {
        subjects = [subjects];
      }
    }

    console.log("Processed subjects:", subjects);

    // Build the query
    let query = { subject: { $in: subjects } };

    // Add standard filter if provided
    if (standard) {
      query.standard = standard;
    }

    console.log("Query for batches:", query);

    const batches = await Batch.find(query)
      .populate("standard", "name level")
      .populate("subject", "name")
      .populate("teacher", "name");

    console.log(`Found ${batches.length} batches`);

    res.json(batches);
  } catch (error) {
    console.error("Error in getBatchesBySubject:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
