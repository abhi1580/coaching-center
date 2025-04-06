import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    type: {
      type: String,
      required: [true, "Type is required"],
      enum: ["General", "Event", "Holiday", "Exam", "Emergency", "Other"],
    },
    priority: {
      type: String,
      required: [true, "Priority is required"],
      enum: ["Low", "Medium", "High"],
    },
    targetAudience: {
      type: String,
      required: [true, "Target audience is required"],
      enum: ["All", "Students", "Teachers", "Parents"],
    },
    startTime: {
      type: Date,
      required: [true, "Start time is required"],
      validate: {
        validator: function (value) {
          return value instanceof Date && !isNaN(value);
        },
        message: "Invalid start time",
      },
    },
    endTime: {
      type: Date,
      required: [true, "End time is required"],
      validate: {
        validator: function (value) {
          return value instanceof Date && !isNaN(value);
        },
        message: "Invalid end time",
      },
    },
    status: {
      type: String,
      enum: ["Scheduled", "Active", "Expired"],
      default: "Scheduled",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Pre-save middleware to validate dates
announcementSchema.pre("save", function (next) {
  if (this.startTime >= this.endTime) {
    next(new Error("End time must be after start time"));
  }
  next();
});

// Static method to update announcement statuses
announcementSchema.statics.updateAnnouncementStatuses = async function () {
  try {
    const now = new Date();
    const AnnouncementModel = this;

    // Update expired announcements
    await AnnouncementModel.updateMany(
      {
        endTime: { $lt: now },
        status: { $ne: "Expired" },
      },
      { status: "Expired" }
    );

    // Update active announcements
    await AnnouncementModel.updateMany(
      {
        startTime: { $lte: now },
        endTime: { $gt: now },
        status: { $ne: "Active" },
      },
      { status: "Active" }
    );

    // Update scheduled announcements
    await AnnouncementModel.updateMany(
      {
        startTime: { $gt: now },
        status: { $ne: "Scheduled" },
      },
      { status: "Scheduled" }
    );

    return { success: true };
  } catch (error) {
    console.error("Error updating announcement statuses:", error);
    return { success: false, error: error.message };
  }
};

// Update announcement statuses on save
announcementSchema.post("save", function () {
  // Get the model constructor
  const Model = mongoose.model("Announcement");
  // Update statuses silently
  Model.updateAnnouncementStatuses().catch((err) => {
    console.error("Error updating announcement statuses after save:", err);
  });
});

const Announcement = mongoose.model("Announcement", announcementSchema);

export default Announcement;
