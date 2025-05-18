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
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
      validate: {
        validator: function (value) {
          return value instanceof Date && !isNaN(value);
        },
        message: "Invalid start date",
      },
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
      validate: {
        validator: function (value) {
          return value instanceof Date && !isNaN(value);
        },
        message: "Invalid end date",
      },
    },
    status: {
      type: String,
      enum: ["scheduled", "active", "expired"],
      default: "scheduled",
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
  if (this.endDate < this.startDate) {
    next(new Error("End date must be on or after start date"));
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
        endDate: { $lt: now },
        status: { $ne: "expired" },
      },
      { status: "expired" }
    );

    // Update active announcements
    await AnnouncementModel.updateMany(
      {
        startDate: { $lte: now },
        endDate: { $gte: now },
        status: { $ne: "active" },
      },
      { status: "active" }
    );

    // Update scheduled announcements
    await AnnouncementModel.updateMany(
      {
        startDate: { $gt: now },
        status: { $ne: "scheduled" },
      },
      { status: "scheduled" }
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

// Method to format date in DD/MM/YYYY format
announcementSchema.methods.formatDate = function (date) {
  if (!date) return null;
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Virtual getters for formatted dates
announcementSchema.virtual("formattedStartDate").get(function () {
  return this.formatDate(this.startDate);
});

announcementSchema.virtual("formattedEndDate").get(function () {
  return this.formatDate(this.endDate);
});

// Ensure virtuals are included in toJSON output
announcementSchema.set("toJSON", { virtuals: true });

const Announcement = mongoose.model("Announcement", announcementSchema);

export default Announcement;
