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
    console.log("Starting admin permissions fix...");

    // Get admin email from command line or use default
    const adminEmail = process.argv[2] || "admin@gmail.com";
    console.log(`Looking for admin user with email: ${adminEmail}`);

    // Find the admin user
    const admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      console.log(`No user found with email ${adminEmail}`);
      console.log("Creating a new admin user...");

      // Create admin user
      const newAdmin = await User.create({
        name: "Admin User",
        email: adminEmail,
        password: "admin123",
        phone: "1234567890",
        address: "Admin Address",
        role: "admin",
        gender: "male",
        status: "active",
      });

      console.log(
        `New admin user created with email: ${adminEmail} and password: admin123`
      );
    } else {
      console.log(`Found user: ${admin.name} with role: ${admin.role}`);

      // If user exists but role is not admin, update to admin
      if (admin.role !== "admin") {
        const originalRole = admin.role;
        admin.role = "admin";
        await admin.save();
        console.log(`Updated user role from ${originalRole} to admin`);
      } else {
        console.log("User already has admin role, no changes needed");
      }
    }

    // List all admin users
    const admins = await User.find({ role: "admin" }).select("name email");
    console.log("\nAll admin users in the system:");
    admins.forEach((admin) => {
      console.log(`- ${admin.name} (${admin.email})`);
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    // Close database connection
    mongoose.connection.close();
    console.log("Database connection closed");
  }
};

// Run the function
fixAdminPermissions();
