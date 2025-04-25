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
} from "@mui/material";
import {
  Class as ClassIcon,
  School as SchoolIcon,
  Announcement as AnnouncementIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import axios from "axios";

function TeacherDashboard() {
  const theme = useTheme();
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    totalBatches: 0,
    totalStudents: 0,
    activeAnnouncements: [],
    upcomingClasses: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

        // Make API request to fetch teacher-specific data
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL + '/teacher/dashboard' : 'http://localhost:5000/api/teacher/dashboard'}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Handle the response data safely
        if (response.data && response.data.data) {
          setStats({
            totalBatches: response.data.data.totalBatches || 0,
            totalStudents: response.data.data.totalStudents || 0,
            activeAnnouncements: response.data.data.activeAnnouncements || [],
            upcomingClasses: response.data.data.upcomingClasses || []
          });
        } else {
          // If the response format is unexpected, set default values
          setStats({
            totalBatches: 0,
            totalStudents: 0,
            activeAnnouncements: [],
            upcomingClasses: []
          });
        }
        setError(null);
      } catch (err) {
        console.error("Error fetching teacher stats:", err);
        // Set default values on error
        setStats({
          totalBatches: 0,
          totalStudents: 0,
          activeAnnouncements: [],
          upcomingClasses: []
        });
        setError(
          err.response?.data?.message || "Failed to load dashboard data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherStats();
  }, []);

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
    if (!dateString) return 'Not scheduled';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      const options = { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short',
        year: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      };
      return date.toLocaleDateString('en-US', options);
    } catch (error) {
      console.error("Error formatting date:", error);
      return 'Date error';
    }
  };

  // Format time function for displaying class times
  const formatTime = (timeString) => {
    if (!timeString) return '';
    
    try {
      // Handle time strings like "14:30" or "2:30 PM"
      if (timeString.includes(':')) {
        const [hours, minutes] = timeString.split(':');
        const date = new Date();
        date.setHours(parseInt(hours, 10));
        date.setMinutes(parseInt(minutes, 10));
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
            color: "primary.main" 
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
          <Typography variant="body1" color="text.secondary">
            No upcoming classes scheduled.
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {stats.upcomingClasses.slice(0, 4).map((classItem, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {classItem.batchName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Subject:</strong> {classItem.subject}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Day:</strong> {classItem.day}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Time:</strong> {formatTime(classItem.startTime)} - {formatTime(classItem.endTime)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Next Class:</strong> {formatDate(classItem.date)}
                    </Typography>
                    <Chip 
                      size="small" 
                      label="Scheduled" 
                      color="primary"
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
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
            {stats.activeAnnouncements.slice(0, 3).map((announcement, index) => (
              <Grid item xs={12} key={index}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    borderRadius: 2,
                    borderLeft: `4px solid ${theme.palette.primary.main}` 
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {announcement.title}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {announcement.content}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        Posted: {new Date(announcement.createdAt).toLocaleDateString()}
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