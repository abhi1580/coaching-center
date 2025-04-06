import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import connectDB from "../config/db.js";

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const fixAdminPermissions = async () => {
  try {
    // Get admin email from command line or use default
    const adminEmail = process.argv[2] || "admin@gmail.com";

    // Find the admin user
    const admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      // Create a new admin user
      admin = await User.create({
        name: "Admin User",
        email: adminEmail,
        password: "admin123",
        phone: "1234567890",
        address: "Admin Address",
        role: "admin",
        gender: "male",
        status: "active",
      });

      // Admin user created
    } else {
      // If user exists but role is not admin, update to admin
      if (admin.role !== "admin") {
        const originalRole = admin.role;
        admin.role = "admin";
        await admin.save();
      } else {
        // No changes needed
      }
    }

    // List all admin users
    const admins = await User.find({ role: "admin" }).select("name email");
    admins.forEach((admin) => {});
  } catch (error) {
  } finally {
    // Close database connection
    mongoose.connection.close();
  }
};

// Run the function
fixAdminPermissions();
