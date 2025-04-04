import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import studentRoutes from "./routes/students.js";
import batchRoutes from "./routes/batchRoutes.js";
import paymentRoutes from "./routes/payments.js";
import announcementRoutes from "./routes/announcements.js";
import staffRoutes from "./routes/staff.js";
import teacherRoutes from "./routes/teachers.js";
import subjectRoutes from "./routes/subjectRoutes.js";
import standardRoutes from "./routes/standardRoutes.js";
import dashboardRoutes from "./routes/dashboard.js";
import cron from "node-cron";
import { checkAndExpireAnnouncements } from "./utils/announcementExpiry.js";

// Load environment variables
dotenv.config();

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log("Request Body:", req.body);
  next();
});

// Schedule announcement expiry check to run every minute
cron.schedule("* * * * *", () => {
  checkAndExpireAnnouncements();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/batches", batchRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/standards", standardRoutes);
app.use("/api/dashboard", dashboardRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: err.message,
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
