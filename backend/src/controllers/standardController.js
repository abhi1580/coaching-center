import Standard from "../models/Standard.js";
import Subject from "../models/Subject.js";

// @desc    Get all standards
// @route   GET /api/standards
// @access  Private
export const getStandards = async (req, res) => {
  try {
    const standards = await Standard.find().populate(
      "subjects",
      "name description duration price"
    );
    res.json({
      success: true,
      count: standards.length,
      data: standards,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in getting standards",
      error: error.message,
    });
  }
};

// @desc    Get single standard
// @route   GET /api/standards/:id
// @access  Private
export const getStandard = async (req, res) => {
  try {
    const standard = await Standard.findById(req.params.id).populate(
      "subjects",
      "name description duration price"
    );
    if (!standard) {
      return res.status(404).json({
        success: false,
        message: "Standard not found",
      });
    }
    res.json({
      success: true,
      data: standard,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in getting standard",
      error: error.message,
    });
  }
};

// Helper function to validate standard data
const validateStandardData = (data) => {
  const errors = {};

  // Name validation
  if (!data.name || typeof data.name !== "string") {
    errors.name = "Name is required";
  } else {
    const trimmedName = data.name.trim();
    if (trimmedName.length < 2) {
      errors.name = "Name must be at least 2 characters long";
    } else if (trimmedName.length > 50) {
      errors.name = "Name must not exceed 50 characters";
    } else if (!/^[a-zA-Z0-9\s-]+$/.test(trimmedName)) {
      errors.name =
        "Name can only contain letters, numbers, spaces, and hyphens";
    }
  }

  // Description validation
  if (!data.description || typeof data.description !== "string") {
    errors.description = "Description is required";
  } else {
    const trimmedDesc = data.description.trim();
    if (trimmedDesc.length < 10) {
      errors.description = "Description must be at least 10 characters long";
    } else if (trimmedDesc.length > 500) {
      errors.description = "Description must not exceed 500 characters";
    }
  }

  // Level validation
  if (!data.level || typeof data.level !== "number") {
    errors.level = "Level is required and must be a number";
  } else if (data.level <= 0) {
    errors.level = "Level must be a positive number";
  } else if (!Number.isInteger(data.level)) {
    errors.level = "Level must be an integer";
  }

  return Object.keys(errors).length > 0 ? errors : null;
};

// @desc    Create new standard
// @route   POST /api/standards
// @access  Private
export const createStandard = async (req, res) => {
  try {
    const { name, description, level, subjects } = req.body;

    // Validate required fields
    const validationErrors = validateStandardData(req.body);
    if (validationErrors) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    // Normalize the name (trim and convert to lowercase)
    const normalizedName = name.trim().toLowerCase();

    // Check for duplicate standard (case-insensitive)
    const existingStandard = await Standard.findOne({
      name: { $regex: new RegExp(`^${normalizedName}$`, "i") },
    });

    if (existingStandard) {
      return res.status(400).json({
        success: false,
        message: "A standard with this name already exists",
        errors: {
          name: "A standard with this name already exists",
        },
      });
    }

    // Create new standard with normalized name
    const standard = new Standard({
      name: normalizedName,
      description: description.trim(),
      level,
      subjects,
    });

    await standard.save();

    res.status(201).json({
      success: true,
      message: "Standard created successfully",
      data: standard,
    });
  } catch (error) {
    console.error("Error in createStandard:", error);
    res.status(500).json({
      success: false,
      message: "Error creating standard",
      error: error.message,
    });
  }
};

// @desc    Update standard
// @route   PUT /api/standards/:id
// @access  Private
export const updateStandard = async (req, res) => {
  try {
    const { name, description, level, subjects } = req.body;

    // Validate required fields
    const validationErrors = validateStandardData(req.body);
    if (validationErrors) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    // Normalize the name (trim and convert to lowercase)
    const normalizedName = name.trim().toLowerCase();

    // Check for duplicate standard (case-insensitive, excluding current standard)
    const existingStandard = await Standard.findOne({
      _id: { $ne: req.params.id },
      name: { $regex: new RegExp(`^${normalizedName}$`, "i") },
    });

    if (existingStandard) {
      return res.status(400).json({
        success: false,
        message: "A standard with this name already exists",
        errors: {
          name: "A standard with this name already exists",
        },
      });
    }

    // Update standard with normalized name
    const standard = await Standard.findByIdAndUpdate(
      req.params.id,
      {
        name: normalizedName,
        description: description.trim(),
        level,
        subjects,
      },
      { new: true }
    );

    if (!standard) {
      return res.status(404).json({
        success: false,
        message: "Standard not found",
      });
    }

    res.json({
      success: true,
      message: "Standard updated successfully",
      data: standard,
    });
  } catch (error) {
    console.error("Error in updateStandard:", error);
    res.status(500).json({
      success: false,
      message: "Error updating standard",
      error: error.message,
    });
  }
};

// @desc    Delete standard
// @route   DELETE /api/standards/:id
// @access  Private (Admin only)
export const deleteStandard = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can delete standards",
      });
    }

    const standard = await Standard.findByIdAndDelete(req.params.id);

    if (!standard) {
      return res.status(404).json({
        success: false,
        message: "Standard not found",
      });
    }

    res.json({
      success: true,
      message: "Standard deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in deleting standard",
      error: error.message,
    });
  }
};
