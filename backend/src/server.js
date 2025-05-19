import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cron from "node-cron";
import { checkAndExpireAnnouncements } from "./utils/announcementExpiry.js";
import { updateBatchStatuses } from "./utils/batchStatusUpdates.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

// Import all routes from consolidated index
import routes from "./routes/index.js";

// Load environment variables
dotenv.config();

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_BASE_URL,
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Expires",
      "Pragma",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
// app.use((req, res, next) => {
//   console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
//   next();
// });

// Schedule announcement expiry check to run every minute
cron.schedule("* * * * *", () => {
  checkAndExpireAnnouncements();
});

// Schedule batch status updates to run every hour
cron.schedule("0 * * * *", () => {
  console.log("Running scheduled batch status update");
  updateBatchStatuses().catch(err => {
    console.error("Error in scheduled batch status update:", err);
  });
});

// Mount all routes from the consolidated index
app.use("/api", routes);

// 404 handler for undefined routes
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Update batch statuses immediately on server start
  updateBatchStatuses().catch(err => {
    console.error("Error updating batch statuses on startup:", err);
  });
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});
