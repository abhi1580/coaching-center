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

// Validation helper function
const validateSubjectData = (name, description, duration) => {
  const errors = [];

  // Name validation
  if (!name || name.trim().length === 0) {
    errors.push("Name is required");
  } else if (name.trim().length < 2) {
    errors.push("Name must be at least 2 characters long");
  } else if (name.trim().length > 50) {
    errors.push("Name must not exceed 50 characters");
  } else if (!/^[a-zA-Z0-9\s\-_]+$/.test(name)) {
    errors.push(
      "Name can only contain letters, numbers, spaces, hyphens, and underscores"
    );
  }

  // Description validation
  if (!description || description.trim().length === 0) {
    errors.push("Description is required");
  } else if (description.trim().length < 10) {
    errors.push("Description must be at least 10 characters long");
  } else if (description.trim().length > 500) {
    errors.push("Description must not exceed 500 characters");
  }

  // Duration validation - only check if it's not empty
  if (!duration || duration.trim().length === 0) {
    errors.push("Duration is required");
  }

  return errors;
};

// @desc    Create new subject
// @route   POST /api/subjects
// @access  Private
export const createSubject = async (req, res) => {
  try {
    const { name, description, duration, standard } = req.body;

    // Validate all fields
    const validationErrors = validateSubjectData(name, description, duration);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
        error: "VALIDATION_ERROR",
      });
    }

    // Check if standard exists if provided
    if (standard) {
      const Standard = (await import("../models/Standard.js")).default;
      const standardExists = await Standard.findById(standard);
      if (!standardExists) {
        return res.status(404).json({
          success: false,
          message: "Standard not found",
          error: "STANDARD_NOT_FOUND",
        });
      }
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
      description: description.trim(),
      duration: duration.trim(),
      standard: standard || null,
    });

    await subject.save();

    // Add subject to standard's subjects array if standard is provided
    if (standard) {
      const Standard = (await import("../models/Standard.js")).default;
      const standardDoc = await Standard.findById(standard);
      if (standardDoc) {
        standardDoc.subjects.push(subject._id);
        await standardDoc.save();
      }
    }

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
export const updateSubject = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can update subjects",
      });
    }

    const { name, description, duration, standard } = req.body;

    // Validate all fields
    const validationErrors = validateSubjectData(name, description, duration);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
        error: "VALIDATION_ERROR",
      });
    }

    let subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({
        success: false,
        error: "Subject not found",
      });
    }

    // If standard is being changed, update both subject and standard
    if (standard && standard !== subject.standard.toString()) {
      const Standard = (await import("../models/Standard.js")).default;
      const newStandard = await Standard.findById(standard);
      if (!newStandard) {
        return res.status(404).json({
          success: false,
          message: "New standard not found",
          error: "STANDARD_NOT_FOUND",
        });
      }

      // Remove subject from old standard
      const oldStandard = await Standard.findById(subject.standard);
      if (oldStandard) {
        oldStandard.subjects = oldStandard.subjects.filter(
          (s) => s.toString() !== subject._id.toString()
        );
        await oldStandard.save();
      }

      // Add subject to new standard
      newStandard.subjects.push(subject._id);
      await newStandard.save();
    }

    // Check if any fields have actually changed
    const normalizedName = name.toLowerCase().trim();
    const hasChanges =
      normalizedName !== subject.name.toLowerCase() ||
      description.trim() !== subject.description ||
      duration.trim() !== subject.duration ||
      (standard && standard !== subject.standard.toString());

    if (!hasChanges) {
      return res.status(400).json({
        success: false,
        message: "No changes detected",
        error: "NO_CHANGES",
      });
    }

    // Check if another subject with the same name exists (excluding current subject)
    const existingSubject = await Subject.findOne({
      name: { $regex: new RegExp(`^${normalizedName}$`, "i") },
      _id: { $ne: req.params.id },
    });

    if (existingSubject) {
      return res.status(400).json({
        success: false,
        message: "A subject with this name already exists",
        error: "DUPLICATE_SUBJECT",
      });
    }

    // Update subject
    subject = await Subject.findByIdAndUpdate(
      req.params.id,
      {
        name: normalizedName,
        description: description.trim(),
        duration: duration.trim(),
        standard: standard || subject.standard,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Subject updated successfully",
      data: subject,
    });
  } catch (error) {
    console.error("Error updating subject:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update subject",
      error: error.message,
    });
  }
};

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
