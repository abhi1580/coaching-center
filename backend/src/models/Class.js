import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    grade: {
      type: String,
      required: true,
      trim: true,
    },
    subjects: [
      {
        type: String,
        required: true,
      },
    ],
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    schedule: {
      days: [
        {
          type: String,
          required: true,
        },
      ],
      time: {
        type: String,
        required: true,
      },
    },
    duration: {
      type: String,
      required: true,
    },
    fees: {
      type: Number,
      required: true,
      min: 0,
    },
    mode: {
      type: String,
      required: true,
      enum: ["Offline", "Online", "Hybrid"],
    },
    location: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Class = mongoose.model("Class", classSchema);

export default Class;
