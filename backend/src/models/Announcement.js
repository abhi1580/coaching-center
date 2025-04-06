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
      enum: ["General", "Event", "Holiday", "Exam", "Other"],
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
  const now = new Date();

  // Update expired announcements
  await this.updateMany(
    {
      endTime: { $lt: now },
      status: { $ne: "Expired" },
    },
    { status: "Expired" }
  );

  // Update active announcements
  await this.updateMany(
    {
      startTime: { $lte: now },
      endTime: { $gt: now },
      status: { $ne: "Active" },
    },
    { status: "Active" }
  );

  // Update scheduled announcements
  await this.updateMany(
    {
      startTime: { $gt: now },
      status: { $ne: "Scheduled" },
    },
    { status: "Scheduled" }
  );
};

// Pre-find middleware to update statuses before querying
announcementSchema.pre("find", function (next) {
  this.model.updateAnnouncementStatuses().catch(() => {});
  next();
});

// Update announcement statuses on save
announcementSchema.post("save", function () {
  // Update statuses silently
  this.model.updateAnnouncementStatuses().catch(() => {});
});

const Announcement = mongoose.model("Announcement", announcementSchema);

export default Announcement;
