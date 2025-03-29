import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
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
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["admin", "teacher", "student", "staff"],
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    lastLogin: {
      type: Date,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  try {
    console.log("Pre-save hook triggered");
    console.log("Is password modified?", this.isModified("password"));

    if (!this.isModified("password")) {
      console.log("Password not modified, skipping hash");
      return next();
    }

    console.log("Starting password hash process...");
    const salt = await bcrypt.genSalt(10);
    console.log("Salt generated");

    this.password = await bcrypt.hash(this.password, salt);
    console.log("Password hashed successfully");

    next();
  } catch (error) {
    console.error("Error in pre-save hook:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    next(error);
  }
});

// Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    console.error("Error comparing passwords:", error);
    throw error;
  }
};

// Generate and hash password token
userSchema.methods.getResetPasswordToken = function () {
  try {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Set expire
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    return resetToken;
  } catch (error) {
    console.error("Error generating reset token:", error);
    throw error;
  }
};

const User = mongoose.model("User", userSchema);

export default User;
