import Announcement from "../models/Announcement.js";
import { validateMongoDbId } from "../utils/validateMongoDbId.js";
import { handleError } from "../utils/errorHandler.js";

// Helper functions
const validateAnnouncementFields = (fields) => {
  const requiredFields = [
    "title",
    "content",
    "type",
    "priority",
    "targetAudience",
    "startDate",
    "startTime",
    "endDate",
    "endTime",
  ];

  const missingFields = requiredFields.filter((field) => !fields[field]);
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
  }
};

const createDateTime = (date, time) => {
  try {
    // Handle Date objects directly
    if (date instanceof Date) {
      return date;
    }

    // Handle string dates - expected format YYYY-MM-DD
    const dateTime = new Date(`${date}T${time}`);
    if (isNaN(dateTime.getTime())) {
      throw new Error("Invalid date or time format");
    }
    return dateTime;
  } catch (error) {
    console.error("Error creating date time:", error);
    throw new Error("Invalid date or time format");
  }
};

const validateDateTime = (startDateTime, endDateTime) => {
  if (endDateTime <= startDateTime) {
    throw new Error("End date/time must be after start date/time");
  }
};

const validatePastDate = (dateTime) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (dateTime < today) {
    throw new Error("Start date cannot be in the past");
  }
};

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Private
export const getAnnouncements = async (req, res) => {
  try {
    // Update the status of all announcements first
    await Announcement.updateAnnouncementStatuses();

    // Then retrieve the announcements
    const announcements = await Announcement.find()
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    // Calculate counts
    const counts = {
      total: announcements.length,
      active: announcements.filter((a) => a.status === "Active").length,
      scheduled: announcements.filter((a) => a.status === "Scheduled").length,
      expired: announcements.filter((a) => a.status === "Expired").length,
    };

    res.status(200).json({
      success: true,
      data: announcements,
      counts,
    });
  } catch (error) {
    handleError(res, error, "Failed to fetch announcements");
  }
};

// @desc    Get single announcement
// @route   GET /api/announcements/:id
// @access  Private
export const getAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);

    const announcement = await Announcement.findById(id).populate(
      "createdBy",
      "name email"
    );

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    res.json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    handleError(res, error, "Error in getting announcement");
  }
};

// @desc    Create announcement
// @route   POST /api/announcements
// @access  Private (Admin only)
export const createAnnouncement = async (req, res) => {
  try {
    validateAnnouncementFields(req.body);

    let startDateTime, endDateTime;

    try {
      startDateTime = createDateTime(req.body.startDate, req.body.startTime);
      endDateTime = createDateTime(req.body.endDate, req.body.endTime);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    validateDateTime(startDateTime, endDateTime);
    validatePastDate(startDateTime);

    const announcement = await Announcement.create({
      title: req.body.title,
      content: req.body.content,
      type: req.body.type,
      priority: req.body.priority,
      targetAudience: req.body.targetAudience,
      startDate: startDateTime,
      endDate: endDateTime,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    handleError(res, error, "Error in creating announcement");
  }
};

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private (Admin only)
export const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);

    validateAnnouncementFields(req.body);

    let startDateTime, endDateTime;

    try {
      startDateTime = createDateTime(req.body.startDate, req.body.startTime);
      endDateTime = createDateTime(req.body.endDate, req.body.endTime);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    validateDateTime(startDateTime, endDateTime);

    const existingAnnouncement = await Announcement.findById(id);
    if (!existingAnnouncement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    // Only validate past date for new announcements
    if (existingAnnouncement.startDate > new Date()) {
      validatePastDate(startDateTime);
    }

    const announcement = await Announcement.findByIdAndUpdate(
      id,
      {
        title: req.body.title,
        content: req.body.content,
        type: req.body.type,
        priority: req.body.priority,
        targetAudience: req.body.targetAudience,
        startDate: startDateTime,
        endDate: endDateTime,
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    handleError(res, error, "Error in updating announcement");
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Admin only)
export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);

    const announcement = await Announcement.findByIdAndDelete(id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    res.json({
      success: true,
      message: "Announcement deleted successfully",
    });
  } catch (error) {
    handleError(res, error, "Error in deleting announcement");
  }
};
