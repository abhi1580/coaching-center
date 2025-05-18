import mongoose from "mongoose";

const batchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
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
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    schedule: {
      days: [
        {
          type: String,
          enum: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          required: true,
        },
      ],
      startTime: {
        type: String,
        required: true,
      },
      endTime: {
        type: String,
        required: true,
      },
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
    },
    status: {
      type: String,
      enum: ["upcoming", "active", "completed"],
      default: "upcoming",
    },
    description: {
      type: String,
      trim: true,
    },
    fees: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
batchSchema.index({ standard: 1, subject: 1 });
batchSchema.index({ startDate: 1, endDate: 1 });
batchSchema.index({ status: 1 });

// Pre-save middleware to validate dates
batchSchema.pre("save", function (next) {
  if (this.endDate < this.startDate) {
    next(new Error("End date must be on or after start date"));
  }
  next();
});

// Static method to update batch statuses
batchSchema.statics.updateBatchStatuses = async function () {
  try {
    const now = new Date();
    const BatchModel = this;

    // Update completed batches
    await BatchModel.updateMany(
      {
        endDate: { $lt: now },
        status: { $ne: "completed" }
      },
      { status: "completed" }
    );

    // Update active batches
    await BatchModel.updateMany(
      {
        startDate: { $lte: now },
        endDate: { $gte: now },
        status: { $ne: "active" }
      },
      { status: "active" }
    );

    // Update upcoming batches
    await BatchModel.updateMany(
      {
        startDate: { $gt: now },
        status: { $ne: "upcoming" }
      },
      { status: "upcoming" }
    );

    return { success: true };
  } catch (error) {
    console.error("Error updating batch statuses:", error);
    return { success: false, error: error.message };
  }
};

// Update batch statuses on save
batchSchema.post("save", function () {
  // Get the model constructor
  const Model = mongoose.model("Batch");
  // Update statuses silently
  Model.updateBatchStatuses().catch((err) => {
    console.error("Error updating batch statuses after save:", err);
  });
});

const Batch = mongoose.model("Batch", batchSchema);

export default Batch;
