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
import { useSelector, useDispatch } from "react-redux";
import api from "../../services/common/apiClient";
import { useNavigate } from "react-router-dom";

function TeacherDashboard() {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    totalBatches: 0,
    totalStudents: 0,
    totalSubjects: 0,
    activeAnnouncements: [],
    upcomingClasses: [],
    futureBatches: [],
    recentAnnouncements: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      if (!isAuthenticated || !user) {
        setError(
          "You are not logged in. Please log in to view dashboard data."
        );
        setLoading(false);
        return;
      }

      const response = await api.get("/teacher/dashboard");
      setStats(response.data.data);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
      } else {
        setError(
          err.response?.data?.message || "Error fetching dashboard data"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
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
        <Grid item xs={12} sm={6}>
          <StatCard
            icon={SchoolIcon}
            title="My Subjects"
            value={stats.totalSubjects}
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
