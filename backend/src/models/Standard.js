import mongoose from "mongoose";

const standardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a standard name"],
      trim: true,
    },
    level: {
      type: Number,
      required: [true, "Please add a standard level"],
      min: [1, "Level must be at least 1"],
      max: [12, "Level must not exceed 12"],
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
    },
    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
      },
    ],

  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Standard", standardSchema);
