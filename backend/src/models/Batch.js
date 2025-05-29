import mongoose from "mongoose";

const batchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Batch name is required"],
      trim: true,
    },
    standard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Standard",
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    schedule: {
      type: String,
      required: [true, "Schedule is required"],
    },
    capacity: {
      type: Number,
      required: [true, "Capacity is required"],
      min: [1, "Capacity must be at least 1"],
    },
    currentStudents: {
      type: Number,
      default: 0,
      min: [0, "Current students cannot be negative"],
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    fee: {
      type: Number,
      required: [true, "Fee is required"],
      min: [0, "Fee cannot be negative"],
    },
    description: {
      type: String,
      trim: true,
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

// Virtual getter for status
batchSchema.virtual("status").get(function () {
  const now = getCurrentIST();
  if (this.endDate < now) {
    return "completed";
  } else if (this.startDate <= now && this.endDate >= now) {
    return "active";
  } else {
    return "upcoming";
  }
});

// Virtual getter for isFull
batchSchema.virtual("isFull").get(function () {
  return this.currentStudents >= this.capacity;
});

// Pre-save middleware to validate dates
batchSchema.pre("save", function (next) {
  if (this.startDate >= this.endDate) {
    next(new Error("End date must be after start date"));
  }
  next();
});

// Method to format date in DD/MM/YYYY format
batchSchema.methods.formatDate = function (date) {
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
batchSchema.virtual("formattedStartDate").get(function () {
  return this.formatDate(this.startDate);
});

batchSchema.virtual("formattedEndDate").get(function () {
  return this.formatDate(this.endDate);
});

// Index for efficient queries
batchSchema.index({ standard: 1, subject: 1 });
batchSchema.index({ startDate: 1, endDate: 1 });

const Batch = mongoose.model("Batch", batchSchema);

export default Batch;
