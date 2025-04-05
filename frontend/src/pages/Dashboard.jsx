import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  IconButton,
  Tooltip,
  Popover,
  Divider,
  Button,
} from "@mui/material";
import {
  Person as PersonIcon,
  School as SchoolIcon,
  Class as ClassIcon,
  Grade as GradeIcon,
  People as PeopleIcon,
  Payment as PaymentIcon,
  Announcement as AnnouncementIcon,
  Book as BookIcon,
  Refresh as RefreshIcon,
  Login as LoginIcon,
} from "@mui/icons-material";
import {
  dashboardService,
  announcementService,
  authService,
} from "../services/api";

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalBatches: 0,
    totalSubjects: 0,
    totalStandards: 0,
    totalStaff: 0,
    totalPayments: 0,
    totalRevenue: 0,
    totalAnnouncements: 0,
    studentGrowth: 0,
    teacherGrowth: 0,
    revenueGrowth: 0,
    upcomingAnnouncements: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use refs for Popover anchoring
  const [announcementPopoverOpen, setAnnouncementPopoverOpen] = useState(false);
  const announcementRef = useRef(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // Check if token exists
      const token = localStorage.getItem("token");
      if (!token) {
        setError(
          "You are not logged in. Please log in to view dashboard data."
        );
        setLoading(false);
        return;
      }

      // Use dashboard service
      const response = await dashboardService.getStats();
      const announcementsResponse = await announcementService.getAll();

      // Log the raw API response
      console.log("Dashboard API response:", response.data);

      // Handle data depending on API response structure
      const announcementsData = Array.isArray(announcementsResponse.data)
        ? announcementsResponse.data
        : announcementsResponse.data.data || [];

      // Filter for upcoming announcements
      const now = new Date();
      const upcomingAnnouncements = announcementsData
        .filter((announcement) => {
          const startTime = new Date(announcement.startTime);
          return startTime > now;
        })
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
        .slice(0, 3);

      // Ensure we have all the required stats with fallbacks
      const responseData = response.data || {};

      setStats({
        totalStudents: responseData.totalStudents || 0,
        totalTeachers: responseData.totalTeachers || 0,
        totalBatches: responseData.totalBatches || 0,
        totalSubjects: responseData.totalSubjects || 0,
        totalStandards: responseData.totalStandards || 0,
        totalStaff: responseData.totalStaff || 0,
        totalPayments: responseData.totalPayments || 0,
        totalRevenue: responseData.totalRevenue || 0,
        totalAnnouncements: responseData.totalAnnouncements || 0,
        studentGrowth: responseData.studentGrowth || 0,
        teacherGrowth: responseData.teacherGrowth || 0,
        revenueGrowth: responseData.revenueGrowth || 0,
        upcomingAnnouncements,
      });
      setError(null);
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
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Helper function to format date
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Debug logging for stats
  console.log("Dashboard stats:", stats);

  // Show login prompt if not logged in
  if (error && error.includes("not logged in")) {
  return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          {error}
      </Typography>
        <Button
          variant="contained"
          startIcon={<LoginIcon />}
          onClick={() => navigate("/login")}
          sx={{ mt: 2 }}
        >
          Go to Login
        </Button>
      </Box>
    );
  }

  // Stat card component
  const StatCard = ({
    icon: Icon,
    title,
    value,
    color = "primary",
    onClick,
  }) => (
          <Paper
            sx={{
              p: 2,
              textAlign: "center",
        bgcolor: `${color}.light`,
              color: "white",
        cursor: "pointer",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 4,
        },
      }}
      onClick={onClick}
    >
      <Icon sx={{ fontSize: 40, mb: 1 }} />
      <Typography variant="h4">{value.toLocaleString()}</Typography>
      <Typography variant="subtitle1">{title}</Typography>
          </Paper>
  );

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
        <Typography variant="h4">Dashboard</Typography>
        <Tooltip title="Refresh data">
          <IconButton onClick={fetchStats} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {loading ? (
        <LinearProgress sx={{ mb: 3 }} />
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={PersonIcon}
              title="Teachers"
              value={stats.totalTeachers || 0}
              color="primary"
              onClick={() => navigate("/app/teachers")}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={SchoolIcon}
              title="Students"
              value={
                stats.totalStudents !== undefined ? stats.totalStudents : 0
              }
              color="secondary"
              onClick={() => navigate("/app/students")}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={ClassIcon}
              title="Batches"
              value={stats.totalBatches}
              color="success"
              onClick={() => navigate("/app/batches")}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={BookIcon}
              title="Subjects"
              value={stats.totalSubjects}
              color="info"
              onClick={() => navigate("/app/subjects")}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={GradeIcon}
              title="Standards"
              value={stats.totalStandards}
              color="warning"
              onClick={() => navigate("/app/standards")}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={PeopleIcon}
              title="Staff"
              value={stats.totalStaff}
              color="error"
              onClick={() => navigate("/app/staff")}
            />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={PaymentIcon}
              title="Payments"
              value={stats.totalPayments}
              color="success"
              onClick={() => navigate("/app/payments")}
            />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
            <Box
              ref={announcementRef}
              onMouseEnter={() => setAnnouncementPopoverOpen(true)}
              onMouseLeave={() => setAnnouncementPopoverOpen(false)}
            >
              <StatCard
                icon={AnnouncementIcon}
                title="Upcoming Announcements"
                value={stats.upcomingAnnouncements.length}
                color="primary"
                onClick={() => navigate("/app/announcements")}
              />
            </Box>

            <Popover
              open={announcementPopoverOpen}
              anchorEl={announcementRef.current}
              onClose={() => setAnnouncementPopoverOpen(false)}
              disableRestoreFocus
              anchorOrigin={{
                vertical: "center",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "center",
                horizontal: "left",
              }}
              sx={{ pointerEvents: "none" }}
              slotProps={{
                paper: {
                  onMouseEnter: () => setAnnouncementPopoverOpen(true),
                  onMouseLeave: () => setAnnouncementPopoverOpen(false),
                },
              }}
            >
              <Box sx={{ p: 2, maxWidth: 300 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Upcoming Announcements
                </Typography>
                {stats.upcomingAnnouncements.length > 0 ? (
                  stats.upcomingAnnouncements.map((announcement, index) => (
                    <Box key={announcement._id || index}>
                      <Box sx={{ mb: 1 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: "bold" }}
                        >
                          {announcement.title}
                        </Typography>
                        <Typography
                          variant="caption"
            sx={{
                            color: "primary.main",
                            display: "block",
                            mb: 0.5,
                          }}
                        >
                          Starts: {formatDateTime(announcement.startTime)}
            </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary" }}
                        >
                          {announcement.content?.substring(0, 100) || ""}
                          {announcement.content?.length > 100 ? "..." : ""}
              </Typography>
            </Box>
                      {index < stats.upcomingAnnouncements.length - 1 && (
                        <Divider sx={{ my: 1 }} />
                      )}
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No upcoming announcements
            </Typography>
                )}
            </Box>
            </Popover>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

export default Dashboard;
