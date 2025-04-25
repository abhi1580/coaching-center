import Standard from "../../models/Standard.js";
import Subject from "../../models/Subject.js";

// @desc    Create standard
// @route   POST /api/standards
// @access  Private (Admin only)
export const createStandard = async (req, res) => {
  try {
    // Validate subjects if provided
    if (req.body.subjects && req.body.subjects.length > 0) {
      try {
        const subjects = await Subject.find({
          _id: { $in: req.body.subjects },
          status: "active",
        });

        if (subjects.length !== req.body.subjects.length) {
          const foundIds = subjects.map((s) => s._id.toString());
          const invalidIds = req.body.subjects.filter(
            (id) => !foundIds.includes(id)
          );

          return res.status(400).json({
            success: false,
            message: "One or more subjects are invalid",
            invalidSubjects: invalidIds,
            foundSubjects: foundIds,
          });
        }
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Error validating subjects",
          error: error.message,
        });
      }
    }

    const standard = await Standard.create(req.body);
    await standard.populate("subjects", "name description duration");

    res.status(201).json({
      success: true,
      data: standard,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in creating standard",
      error: error.message,
    });
  }
};

// @desc    Update standard
// @route   PUT /api/standards/:id
// @access  Private (Admin only)
export const updateStandard = async (req, res) => {
  try {
    // Validate subjects if provided for update
    if (req.body.subjects && req.body.subjects.length > 0) {
      try {
        // First, check if the standard exists
        const existingStandard = await Standard.findById(req.params.id);
        if (!existingStandard) {
          return res.status(404).json({
            success: false,
            message: "Standard not found",
          });
        }

        // Find all active subjects
        const subjects = await Subject.find({
          _id: { $in: req.body.subjects },
          status: "active",
        });

        if (subjects.length !== req.body.subjects.length) {
          const foundIds = subjects.map((s) => s._id.toString());
          const invalidIds = req.body.subjects.filter(
            (id) => !foundIds.includes(id)
          );

          return res.status(400).json({
            success: false,
            message: "One or more subjects are invalid",
            invalidSubjects: invalidIds,
            foundSubjects: foundIds,
          });
        }
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Error validating subjects",
          error: error.message,
        });
      }
    }

    const standard = await Standard.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("subjects", "name description duration");

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
      message: "Error in updating standard",
      error: error.message,
    });
  }
};

// @desc    Delete standard
// @route   DELETE /api/standards/:id
// @access  Private (Admin only)
export const deleteStandard = async (req, res) => {
  try {
    const standard = await Standard.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      {
        new: true,
      }
    );

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