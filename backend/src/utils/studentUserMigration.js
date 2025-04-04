import mongoose from "mongoose";
import dotenv from "dotenv";
import Student from "../models/Student.js";
import User from "../models/User.js";
import connectDB from "../config/db.js";

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const migrateStudents = async () => {
  try {
    console.log("Starting student to user migration...");

    // Find all students
    const students = await Student.find({});
    console.log(`Found ${students.length} students to process`);

    let created = 0;
    let skipped = 0;
    let failed = 0;

    for (const student of students) {
      try {
        // Check if this student already has a user account
        if (student.user) {
          const existingUser = await User.findById(student.user);
          if (existingUser) {
            console.log(
              `Student ${student.name} (${student.email}) already has a user account`
            );
            skipped++;
            continue;
          }
        }

        // Check if a user with this email already exists
        const existingUserByEmail = await User.findOne({
          email: student.email,
        });
        if (existingUserByEmail) {
          console.log(
            `User with email ${student.email} already exists, linking to student`
          );
          // Link the existing user to this student
          student.user = existingUserByEmail._id;
          await student.save();
          skipped++;
          continue;
        }

        // Create a new user for this student
        const newUser = await User.create({
          name: student.name,
          email: student.email,
          password: "student123", // Default password
          phone: student.phone,
          address: student.address,
          role: "student",
          gender: student.gender,
          status: student.status === "Active" ? "active" : "inactive",
        });

        // Link the user to the student
        student.user = newUser._id;
        await student.save();

        console.log(
          `Created user account for student: ${student.name} (${student.email})`
        );
        created++;
      } catch (error) {
        console.error(
          `Error processing student ${student.name} (${student.email}):`,
          error
        );
        failed++;
      }
    }

    console.log("Migration completed:");
    console.log(`- Created: ${created} user accounts`);
    console.log(`- Skipped: ${skipped} (already had accounts)`);
    console.log(`- Failed: ${failed}`);
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    // Close database connection
    mongoose.connection.close();
    console.log("Database connection closed");
  }
};

// Run the migration
migrateStudents();
