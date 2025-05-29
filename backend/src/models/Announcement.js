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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Helper function to get current time in IST
const getCurrentIST = () => {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );
};

// Pre-save middleware to validate dates
announcementSchema.pre("save", function (next) {
  if (this.startDate >= this.endDate) {
    next(new Error("End date must be after start date"));
  }
  next();
});

// Method to format date in DD/MM/YYYY format
announcementSchema.methods.formatDate = function (date) {
  if (!date) return null;
  const indianDate = new Date(
    date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );
  const day = indianDate.getDate().toString().padStart(2, "0");
  const month = (indianDate.getMonth() + 1).toString().padStart(2, "0");
  const year = indianDate.getFullYear();
  return `${day}/${month}/${year}`;
};

// Virtual getters for formatted dates
announcementSchema.virtual("formattedStartDate").get(function () {
  return this.formatDate(this.startDate);
});

announcementSchema.virtual("formattedEndDate").get(function () {
  return this.formatDate(this.endDate);
});

// Virtual getter for status
announcementSchema.virtual("status").get(function () {
  const now = getCurrentIST();
  if (this.endDate < now) {
    return "expired";
  } else if (this.startDate <= now && this.endDate >= now) {
    return "active";
  } else {
    return "scheduled";
  }
});

const Announcement = mongoose.model("Announcement", announcementSchema);

export default Announcement;
