import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Chip,
  useTheme,
  alpha,
  Button,
} from "@mui/material";
import {
  Class as ClassIcon,
  School as SchoolIcon,
  Announcement as AnnouncementIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  CalendarMonth as CalendarMonthIcon,
  AccessTime as AccessTimeIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function TeacherDashboard() {
  const theme = useTheme();
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    totalBatches: 0,
    totalStudents: 0,
    activeAnnouncements: [],
    upcomingClasses: [],
    futureBatches: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeacherStats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication required");
          setLoading(false);
          return;
        }

        // First, fetch teacher's batches
        const teacherResponse = await axios.get(
          `${
            import.meta.env.VITE_API_URL
              ? import.meta.env.VITE_API_URL + "/teacher/batches"
              : "http://localhost:5000/api/teacher/batches"
          }`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("Teacher Batches Response:", teacherResponse.data);

        // Then fetch dashboard data
        const dashboardResponse = await axios.get(
          `${
            import.meta.env.VITE_API_URL
              ? import.meta.env.VITE_API_URL + "/teacher/dashboard"
              : "http://localhost:5000/api/teacher/dashboard"
          }`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("Dashboard Response:", dashboardResponse.data);

        // Handle the response data safely
        if (teacherResponse.data && teacherResponse.data.data) {
          // Get all batches with their schedules
          const batches = teacherResponse.data.data || [];
          console.log("Teacher Batches:", batches);

          // Generate upcoming classes for next 4 days based on batch schedules
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Set to start of day
          const fourDaysLater = new Date(today);
          fourDaysLater.setDate(today.getDate() + 4);

          console.log("Date Range:", {
            today: today.toISOString(),
            fourDaysLater: fourDaysLater.toISOString(),
          });

          const upcomingClasses = [];

          // First, let's check if we have any batches
          if (batches.length === 0) {
            console.log("No batches found for this teacher");
          } else {
            console.log(`Found ${batches.length} batches for this teacher`);
          }

          // Process each batch
          batches.forEach((batch) => {
            if (!batch) {
              console.log("Invalid batch data:", batch);
              return;
            }

            console.log(`\nChecking batch: ${batch.name}`, {
              status: batch.status,
              startDate: batch.startDate,
              endDate: batch.endDate,
              schedule: batch.schedule,
            });

            // Only process ongoing batches
            if (batch.status !== "Ongoing") {
              console.log(
                `Skipping batch ${batch.name} - Status is ${batch.status}`
              );
              return;
            }

            // Parse dates and ensure they're in the same timezone
            const batchStartDate = new Date(batch.startDate);
            const batchEndDate = new Date(batch.endDate);

            // Set times to start and end of day for proper comparison
            batchStartDate.setHours(0, 0, 0, 0);
            batchEndDate.setHours(23, 59, 59, 999);

            console.log(`Processing ongoing batch: ${batch.name}`, {
              batchStartDate: batchStartDate.toISOString(),
              batchEndDate: batchEndDate.toISOString(),
              today: today.toISOString(),
              isActive: today >= batchStartDate && today <= batchEndDate,
              schedule: batch.schedule,
            });

            // Check if current date is between batch start and end dates
            const isBatchActive =
              today >= batchStartDate && today <= batchEndDate;

            if (isBatchActive && batch.schedule && batch.schedule.days) {
              console.log(
                `Batch ${batch.name} is active. Processing schedule...`
              );

              // For each scheduled day in the batch
              batch.schedule.days.forEach((day) => {
                // Get the next occurrence of this day
                const nextClassDate = getNextDayOfWeek(today, day);

                if (nextClassDate) {
                  console.log(`Next ${day} class:`, {
                    nextClassDate: nextClassDate.toISOString(),
                    isWithinRange: nextClassDate <= fourDaysLater,
                  });

                  // If the next class is within the next 4 days
                  if (nextClassDate <= fourDaysLater) {
                    console.log(
                      `Adding class for batch ${batch.name} on ${day}`
                    );

                    upcomingClasses.push({
                      batchId: batch._id,
                      batchName: batch.name,
                      subject: batch.subject?.name || "Not assigned",
                      standard: batch.standard?.name || "Not assigned",
                      day: day,
                      startTime: batch.schedule.startTime,
                      endTime: batch.schedule.endTime,
                      date: nextClassDate,
                      status: batch.status,
                      enrolledStudents: batch.enrolledStudents || [],
                    });
                  }
                }
              });
            } else {
              console.log(`Batch ${batch.name} is not active because:`, {
                isBeforeStart: today < batchStartDate,
                isAfterEnd: today > batchEndDate,
                hasSchedule: Boolean(batch.schedule),
                hasDays: Boolean(batch.schedule?.days),
              });
            }
          });

          // Sort classes by date and time
          upcomingClasses.sort((a, b) => {
            if (a.date.getTime() !== b.date.getTime()) {
              return a.date.getTime() - b.date.getTime();
            }
            return a.startTime.localeCompare(b.startTime);
          });

          console.log(
            "\nFinal upcoming classes:",
            upcomingClasses.map((c) => ({
              batchName: c.batchName,
              date: c.date.toISOString(),
              day: c.day,
              time: `${c.startTime}-${c.endTime}`,
            }))
          );

          // Update stats with the processed data
          setStats({
            totalBatches: dashboardResponse.data?.data?.totalBatches || 0,
            totalStudents: dashboardResponse.data?.data?.totalStudents || 0,
            activeAnnouncements:
              dashboardResponse.data?.data?.activeAnnouncements || [],
            upcomingClasses: upcomingClasses,
          });
        } else {
          console.log(
            "Invalid teacher batches response:",
            teacherResponse.data
          );
          setStats({
            totalBatches: 0,
            totalStudents: 0,
            activeAnnouncements: [],
            upcomingClasses: [],
          });
        }
        setError(null);
      } catch (err) {
        console.error("Error fetching teacher data:", err);
        setStats({
          totalBatches: 0,
          totalStudents: 0,
          activeAnnouncements: [],
          upcomingClasses: [],
        });

        if (err.response) {
          const status = err.response.status;
          if (status === 401) {
            setError("Your session has expired. Please login again.");
          } else if (status === 403) {
            setError("You don't have permission to access this resource.");
          } else {
            setError(
              err.response.data?.message || "Failed to load dashboard data"
            );
          }
        } else if (err.request) {
          setError("Network error. Please check your connection.");
        } else {
          setError("An unexpected error occurred. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherStats();
  }, []);

  // Helper function to get the next occurrence of a day
  const getNextDayOfWeek = (date, dayName) => {
    const days = {
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
      Sunday: 0,
    };

    const dayNumber = days[dayName];
    if (dayNumber === undefined) return null;

    const resultDate = new Date(date);
    resultDate.setHours(0, 0, 0, 0);

    const currentDay = resultDate.getDay();
    const daysUntilNext = (dayNumber - currentDay + 7) % 7;

    if (daysUntilNext === 0) {
      // If today is the target day, check if the time hasn't passed
      const now = new Date();
      if (now > resultDate) {
        resultDate.setDate(resultDate.getDate() + 7);
      }
    } else {
      resultDate.setDate(resultDate.getDate() + daysUntilNext);
    }

    return resultDate;
  };

  // Stat card component for dashboard stats
  const StatCard = ({ icon: Icon, title, value, color = "primary" }) => (
    <Card
      elevation={2}
      sx={{
        height: "100%",
        borderRadius: 2,
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 4,
        },
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Box
            sx={{
              bgcolor: alpha(theme.palette[color].main, 0.1),
              borderRadius: "50%",
              p: 1,
              mr: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon
              sx={{
                color: theme.palette[color].main,
                fontSize: 32,
              }}
            />
          </Box>
          <Typography
            variant="h6"
            component="div"
            color="text.secondary"
            sx={{ fontSize: { xs: "1rem", md: "1.1rem" } }}
          >
            {title}
          </Typography>
        </Box>
        <Typography
          variant="h4"
          component="div"
          sx={{
            fontWeight: 600,
            fontSize: { xs: "1.5rem", md: "2rem" },
            color: theme.palette[color].main,
          }}
        >
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      </Box>
    );
  }

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "Not scheduled";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";

      const options = {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      };
      return date.toLocaleDateString("en-US", options);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Date error";
    }
  };

  // Format time function for displaying class times
  const formatTime = (timeString) => {
    if (!timeString) return "";

    try {
      // Handle time strings like "14:30" or "2:30 PM"
      if (timeString.includes(":")) {
        const [hours, minutes] = timeString.split(":");
        const date = new Date();
        date.setHours(parseInt(hours, 10));
        date.setMinutes(parseInt(minutes, 10));
        return date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      }
      return timeString;
    } catch (error) {
      return timeString;
    }
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Welcome Section */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 4,
          backgroundColor: (theme) => alpha(theme.palette.primary.light, 0.07),
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontSize: { xs: "1.5rem", sm: "1.8rem", md: "2rem" },
            fontWeight: 600,
            mb: 1,
            color: "primary.main",
          }}
        >
          Welcome, {user?.name || "Teacher"}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's an overview of your classes and students.
        </Typography>
      </Paper>

      {/* Stats Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <StatCard
            icon={ClassIcon}
            title="My Batches"
            value={stats.totalBatches}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StatCard
            icon={SchoolIcon}
            title="My Students"
            value={stats.totalStudents}
            color="secondary"
          />
        </Grid>
      </Grid>

      {/* Upcoming Classes Section */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography
          variant="h5"
          component="h2"
          sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
        >
          Upcoming Classes
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {stats.upcomingClasses.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <ClassIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
            <Typography variant="body1" color="text.secondary" gutterBottom>
              No classes scheduled for the next 4 days.
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr", // 1 column on mobile
                sm: "repeat(2, 1fr)", // 2 columns on tablet
                md: "repeat(3, 1fr)", // 3 columns on desktop
              },
              gap: 2,
            }}
          >
            {stats.upcomingClasses.slice(0, 6).map((classItem, index) => (
              <Card
                key={index}
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  height: "100%",
                }}
              >
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ display: "flex", alignItems: "center", mb: 1 }}
                    >
                      <ClassIcon fontSize="small" sx={{ mr: 1 }} />
                      <strong>Subject:</strong> {classItem.subject}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ display: "flex", alignItems: "center", mb: 1 }}
                    >
                      <SchoolIcon fontSize="small" sx={{ mr: 1 }} />
                      <strong>Standard:</strong> {classItem.standard}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ display: "flex", alignItems: "center", mb: 1 }}
                    >
                      <ScheduleIcon fontSize="small" sx={{ mr: 1 }} />
                      <strong>Day:</strong> {classItem.day}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ display: "flex", alignItems: "center", mb: 1 }}
                    >
                      <AccessTimeIcon fontSize="small" sx={{ mr: 1 }} />
                      <strong>Time:</strong> {formatTime(classItem.startTime)} -{" "}
                      {formatTime(classItem.endTime)}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ display: "flex", alignItems: "center" }}
                    >
                      <CalendarMonthIcon fontSize="small" sx={{ mr: 1 }} />
                      <strong>Date:</strong> {formatDate(classItem.date)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Paper>

      {/* Announcements Section */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography
          variant="h5"
          component="h2"
          sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}
        >
          Recent Announcements
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {stats.activeAnnouncements.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            No active announcements.
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {stats.activeAnnouncements
              .slice(0, 3)
              .map((announcement, index) => (
                <Grid item xs={12} key={index}>
                  <Card
                    variant="outlined"
                    sx={{
                      borderRadius: 2,
                      borderLeft: `4px solid ${theme.palette.primary.main}`,
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {announcement.title}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        {announcement.content}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Posted:{" "}
                          {new Date(
                            announcement.createdAt
                          ).toLocaleDateString()}
                        </Typography>
                        <Chip size="small" label="Active" color="success" />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
          </Grid>
        )}
      </Paper>
    </Box>
  );
}

export default TeacherDashboard;
