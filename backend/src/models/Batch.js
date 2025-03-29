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
      enum: ["upcoming", "active", "completed", "cancelled"],
      default: "upcoming",
    },
    description: {
      type: String,
      trim: true,
    },
    fees: {
      amount: {
        type: Number,
        required: true,
      },
      frequency: {
        type: String,
        enum: ["monthly", "quarterly", "annually"],
        required: true,
      },
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

const Batch = mongoose.model("Batch", batchSchema);

export default Batch;
