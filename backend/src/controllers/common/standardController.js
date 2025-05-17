import Standard from "../../models/Standard.js";

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