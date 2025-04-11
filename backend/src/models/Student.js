import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: ["male", "female", "other"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
    },
    parentName: {
      type: String,
      required: [true, "Parent name is required"],
    },
    parentPhone: {
      type: String,
      required: [true, "Parent phone number is required"],
      validate: {
        validator: function (v) {
          return /^[0-9]{10}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    standard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Standard",
      required: true,
    },
    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
      },
    ],
    batches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Batch",
      },
    ],
    board: {
      type: String,
      required: [true, "Board is required"],
      enum: ["CBSE", "ICSE", "State Board", "Other"],
    },
    schoolName: {
      type: String,
      required: [true, "School name is required"],
    },
    previousPercentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    classes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
      },
    ],
    payments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment",
      },
    ],
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Date of birth is required"],
    },
    joiningDate: {
      type: Date,
      required: [true, "Joining date is required"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Student = mongoose.model("Student", studentSchema);

export default Student;
