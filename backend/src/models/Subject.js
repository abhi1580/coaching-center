import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a subject name"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
    },
    duration: {
      type: String,
      required: [true, "Please add duration"],
    },
    price: {
      type: Number,
      required: [true, "Please add price"],
    },
    standard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Standard",
      required: [true, "Please select a standard"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Subject", subjectSchema);
