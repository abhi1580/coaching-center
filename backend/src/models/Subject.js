import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      trim: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
      trim: true,
    },
    duration: {
      type: String,
      required: [true, "Please add duration"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add a pre-save middleware to convert name to lowercase
subjectSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.name = this.name.toLowerCase().trim();
  }
  next();
});

// Add a pre-findOneAndUpdate middleware to handle updates
subjectSchema.pre("findOneAndUpdate", function (next) {
  if (this._update.name) {
    this._update.name = this._update.name.toLowerCase().trim();
  }
  next();
});

// Create a case-insensitive index
subjectSchema.index(
  { name: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

export default mongoose.model("Subject", subjectSchema);
