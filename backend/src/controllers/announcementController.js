import Announcement from "../models/Announcement.js";
import { validateMongoDbId } from "../utils/validation.js";
import { handleError } from "../utils/responseUtil.js";

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
    if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = date.split('-').map(Number);
      const [hours, minutes] = time.split(':').map(Number);
      
      // For end dates with time 23:59, ensure they stay on the same day
      // by creating the date directly in local timezone
      const dateTime = new Date(year, month - 1, day, hours, minutes);
      
      // For Indian timezone (UTC+5:30), no additional adjustment needed
      // as we're creating the date directly in local timezone
      return dateTime;
    }
    
    // Fallback to standard date parsing
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
  // Convert to date strings for comparison to ignore time
  const startDateStr = startDateTime.toISOString().split('T')[0];
  const endDateStr = endDateTime.toISOString().split('T')[0];
  
  // If dates are the same, that's valid (will use 00:00 to 23:59)
  if (startDateStr === endDateStr) {
    return;
  }
  
  // Otherwise check if end date is after start date
  if (endDateTime < startDateTime) {
    throw new Error("End date/time must be on or after start date/time");
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

    // Create a filter object based on user role
    let filter = {};
    
    // If not admin, filter by targetAudience
    if (req.user && req.user.role !== "admin") {
      // For students, show only announcements targeted at students or all
      if (req.user.role === "student") {
        filter.targetAudience = { $in: ["All", "Students"] };
      }
      // For teachers, show only announcements targeted at teachers or all
      else if (req.user.role === "teacher") {
        filter.targetAudience = { $in: ["All", "Teachers"] };
      }
    }

    // Then retrieve the announcements with the filter
    const announcements = await Announcement.find(filter)
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    // Calculate counts
    const counts = {
      total: announcements.length,
      active: announcements.filter((a) => a.status === "active").length,
      scheduled: announcements.filter((a) => a.status === "scheduled").length,
      expired: announcements.filter((a) => a.status === "expired").length,
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

    // Check if the user has permission to view this announcement based on targetAudience
    if (req.user && req.user.role !== "admin") {
      if (
        (req.user.role === "student" && 
         !["All", "Students"].includes(announcement.targetAudience)) ||
        (req.user.role === "teacher" && 
         !["All", "Teachers"].includes(announcement.targetAudience))
      ) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to view this announcement",
        });
      }
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
