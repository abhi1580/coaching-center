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
  useMediaQuery,
  useTheme,
  Chip,
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalBatches: 0,
    totalSubjects: 0,
    totalStandards: 0,
    totalPayments: 0,
    totalRevenue: 0,
    totalAnnouncements: 0,
    studentGrowth: 0,
    teacherGrowth: 0,
    revenueGrowth: 0,
    upcomingAnnouncements: [],
    activeAnnouncements: [],
    scheduledAnnouncements: [],
    counts: {},
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
      // console.log("Dashboard API response:", response.data);

      // Handle data depending on API response structure
      const announcementsData = Array.isArray(announcementsResponse.data)
        ? announcementsResponse.data
        : announcementsResponse.data.data || [];

      const now = new Date();

      // Filter for upcoming announcements
      const upcomingAnnouncements = announcementsData
        .filter((announcement) => {
          const startTime = new Date(
            announcement.startDate || announcement.startTime
          );
          return startTime > now;
        })
        .sort(
          (a, b) =>
            new Date(a.startDate || a.startTime) -
            new Date(b.startDate || b.startTime)
        )
        .slice(0, 3);

      // Filter for active announcements
      const activeAnnouncements = announcementsData
        .filter((announcement) => announcement.status === "active")
        .sort(
          (a, b) =>
            new Date(b.startDate || b.startTime) -
            new Date(a.startDate || a.startTime)
        )
        .slice(0, 5);

      // Filter for scheduled announcements
      const scheduledAnnouncements = announcementsData
        .filter((announcement) => announcement.status === "scheduled")
        .sort(
          (a, b) =>
            new Date(a.startDate || a.startTime) -
            new Date(b.startDate || b.startTime)
        )
        .slice(0, 5);

      // Calculate counts
      const counts = {
        total: announcementsData.length,
        active: announcementsData.filter((a) => a.status === "active").length,
        scheduled: announcementsData.filter((a) => a.status === "scheduled")
          .length,
        expired: announcementsData.filter((a) => a.status === "expired").length,
      };

      // Ensure we have all the required stats with fallbacks
      const responseData = response.data || {};

      setStats({
        totalStudents: responseData.totalStudents || 0,
        totalTeachers: responseData.totalTeachers || 0,
        totalBatches: responseData.totalBatches || 0,
        totalSubjects: responseData.totalSubjects || 0,
        totalStandards: responseData.totalStandards || 0,
        totalPayments: responseData.totalPayments || 0,
        totalRevenue: responseData.totalRevenue || 0,
        totalAnnouncements: announcementsData.length,
        studentGrowth: responseData.studentGrowth || 0,
        teacherGrowth: responseData.teacherGrowth || 0,
        revenueGrowth: responseData.revenueGrowth || 0,
        upcomingAnnouncements,
        activeAnnouncements,
        scheduledAnnouncements,
        counts,
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
  // console.log("Dashboard stats:", stats);

  // Show login prompt if not logged in
  if (error && error.includes("not logged in")) {
    return (
      <Box sx={{ p: { xs: 2, sm: 4 }, textAlign: "center" }}>
        <Typography
          variant="h5"
          sx={{ mb: 2, fontSize: { xs: "1.2rem", sm: "1.5rem" } }}
        >
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
        p: { xs: 1.5, sm: 2 },
        textAlign: "center",
        bgcolor: `${color}.light`,
        color: "white",
        cursor: "pointer",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 4,
        },
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
      onClick={onClick}
    >
      <Icon sx={{ fontSize: { xs: 30, sm: 40 }, mb: 1 }} />
      <Typography
        variant="h4"
        component="div"
        sx={{ fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" } }}
      >
        {value.toLocaleString()}
      </Typography>
      <Typography
        variant="subtitle1"
        component="div"
        sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
      >
        {title}
      </Typography>
    </Paper>
  );

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          mb: { xs: 2, sm: 4 },
          gap: { xs: 1, sm: 0 },
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" } }}
        >
          Dashboard
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Refresh Data">
            <span>
              <IconButton
                onClick={fetchStats}
                disabled={loading}
                sx={{ bgcolor: "background.paper" }}
              >
                <RefreshIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>

      {error && error !== "You are not logged in." && (
        <Typography component="div" color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {loading ? (
        <LinearProgress sx={{ my: 4 }} />
      ) : (
        <>
          <Grid
            container
            spacing={{ xs: 1, sm: 2, md: 3 }}
            sx={{ mb: { xs: 2, sm: 4 } }}
          >
            <Grid item xs={6} sm={4} md={3}>
              <StatCard
                icon={PersonIcon}
                title="Students"
                value={stats.totalStudents}
                color="primary"
                onClick={() => navigate("/app/students")}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <StatCard
                icon={SchoolIcon}
                title="Teachers"
                value={stats.totalTeachers}
                color="secondary"
                onClick={() => navigate("/app/teachers")}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <StatCard
                icon={ClassIcon}
                title="Batches"
                value={stats.totalBatches}
                color="info"
                onClick={() => navigate("/app/batches")}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <StatCard
                icon={GradeIcon}
                title="Standards"
                value={stats.totalStandards}
                color="success"
                onClick={() => navigate("/app/standards")}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <StatCard
                icon={BookIcon}
                title="Subjects"
                value={stats.totalSubjects}
                color="warning"
                onClick={() => navigate("/app/subjects")}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <StatCard
                icon={PaymentIcon}
                title="Payments"
                value={stats.totalPayments}
                color="info"
                onClick={() => navigate("/app/payments")}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <StatCard
                icon={AnnouncementIcon}
                title="Announcements"
                value={stats.totalAnnouncements}
                color="secondary"
                onClick={() => navigate("/app/announcements")}
              />
            </Grid>
          </Grid>

          {/* Active and Scheduled Announcements Section */}
          <Box sx={{ mt: { xs: 3, sm: 4 } }}>
            <Grid container spacing={2}>
              {/* Active Announcements */}
              <Grid item xs={12} md={6}>
                <Paper
                  sx={{ p: { xs: 1.5, sm: 2, md: 3 }, height: "100%" }}
                  elevation={2}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="h5"
                      component="div"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        fontSize: { xs: "1.2rem", sm: "1.5rem" },
                      }}
                    >
                      <AnnouncementIcon sx={{ mr: 1, color: "success.main" }} />
                      Active Announcements
                    </Typography>
                    <Chip
                      label={`${stats.counts?.active || 0} Active`}
                      color="success"
                      size="small"
                    />
                  </Box>

                  {loading ? (
                    <LinearProgress sx={{ my: 4 }} />
                  ) : stats.activeAnnouncements &&
                    stats.activeAnnouncements.length > 0 ? (
                    <List>
                      {stats.activeAnnouncements.map((announcement, index) => (
                        <React.Fragment key={announcement._id}>
                          <ListItem
                            sx={{
                              flexDirection: { xs: "column", sm: "row" },
                              alignItems: { xs: "flex-start", sm: "center" },
                            }}
                          >
                            <ListItemText
                              component="div"
                              primary={
                                <Typography
                                  variant="subtitle1"
                                  fontWeight="bold"
                                  sx={{
                                    fontSize: { xs: "0.9rem", sm: "1rem" },
                                  }}
                                >
                                  {announcement.title.length > 30
                                    ? `${announcement.title.substring(
                                        0,
                                        30
                                      )}...`
                                    : announcement.title}
                                </Typography>
                              }
                              secondary={
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: { xs: "column", sm: "row" },
                                    gap: { xs: 0.5, sm: 1 },
                                    mt: { xs: 0.5, sm: 0 },
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    component="span"
                                    color="text.secondary"
                                    sx={{
                                      fontSize: {
                                        xs: "0.75rem",
                                        sm: "0.875rem",
                                      },
                                    }}
                                  >
                                    Ends: {formatDateTime(announcement.endDate)}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    component="span"
                                    color="text.secondary"
                                    sx={{
                                      fontSize: {
                                        xs: "0.75rem",
                                        sm: "0.875rem",
                                      },
                                      display: { xs: "none", sm: "block" },
                                    }}
                                  >
                                    •
                                  </Typography>
                                  <Chip
                                    label={announcement.priority}
                                    size="small"
                                    color={
                                      announcement.priority === "High"
                                        ? "error"
                                        : announcement.priority === "Medium"
                                        ? "warning"
                                        : "success"
                                    }
                                    sx={{ height: 20, fontSize: "0.7rem" }}
                                  />
                                </Box>
                              }
                            />
                            <Tooltip title="View Details">
                              <Button
                                variant="text"
                                size="small"
                                color="primary"
                                onClick={() => navigate(`/app/announcements`)}
                                sx={{ mt: { xs: 1, sm: 0 } }}
                              >
                                Details
                              </Button>
                            </Tooltip>
                          </ListItem>
                          {index < stats.activeAnnouncements.length - 1 && (
                            <Divider />
                          )}
                        </React.Fragment>
                      ))}
                    </List>
                  ) : (
                    <Typography
                      variant="body1"
                      component="div"
                      color="text.secondary"
                      align="center"
                      sx={{ py: 2 }}
                    >
                      No active announcements
                    </Typography>
                  )}
                </Paper>
              </Grid>

              {/* Scheduled Announcements */}
              <Grid item xs={12} md={6}>
                <Paper
                  sx={{ p: { xs: 1.5, sm: 2, md: 3 }, height: "100%" }}
                  elevation={2}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="h5"
                      component="div"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        fontSize: { xs: "1.2rem", sm: "1.5rem" },
                      }}
                    >
                      <AnnouncementIcon sx={{ mr: 1, color: "warning.main" }} />
                      Scheduled Announcements
                    </Typography>
                    <Chip
                      label={`${stats.counts?.scheduled || 0} Scheduled`}
                      color="warning"
                      size="small"
                    />
                  </Box>

                  {loading ? (
                    <LinearProgress sx={{ my: 4 }} />
                  ) : stats.scheduledAnnouncements &&
                    stats.scheduledAnnouncements.length > 0 ? (
                    <List>
                      {stats.scheduledAnnouncements.map(
                        (announcement, index) => (
                          <React.Fragment key={announcement._id}>
                            <ListItem
                              sx={{
                                flexDirection: { xs: "column", sm: "row" },
                                alignItems: { xs: "flex-start", sm: "center" },
                              }}
                            >
                              <ListItemText
                                component="div"
                                primary={
                                  <Typography
                                    variant="subtitle1"
                                    fontWeight="bold"
                                    sx={{
                                      fontSize: { xs: "0.9rem", sm: "1rem" },
                                    }}
                                  >
                                    {announcement.title.length > 30
                                      ? `${announcement.title.substring(
                                          0,
                                          30
                                        )}...`
                                      : announcement.title}
                                  </Typography>
                                }
                                secondary={
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexDirection: {
                                        xs: "column",
                                        sm: "row",
                                      },
                                      gap: { xs: 0.5, sm: 1 },
                                      mt: { xs: 0.5, sm: 0 },
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      component="span"
                                      color="text.secondary"
                                      sx={{
                                        fontSize: {
                                          xs: "0.75rem",
                                          sm: "0.875rem",
                                        },
                                      }}
                                    >
                                      Starts:{" "}
                                      {formatDateTime(announcement.startDate)}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      component="span"
                                      color="text.secondary"
                                      sx={{
                                        fontSize: {
                                          xs: "0.75rem",
                                          sm: "0.875rem",
                                        },
                                        display: { xs: "none", sm: "block" },
                                      }}
                                    >
                                      •
                                    </Typography>
                                    <Chip
                                      label={announcement.type}
                                      size="small"
                                      color={
                                        announcement.type === "Emergency"
                                          ? "error"
                                          : announcement.type === "Event"
                                          ? "success"
                                          : "primary"
                                      }
                                      sx={{ height: 20, fontSize: "0.7rem" }}
                                    />
                                  </Box>
                                }
                              />
                              <Tooltip title="View Details">
                                <Button
                                  variant="text"
                                  size="small"
                                  color="primary"
                                  onClick={() => navigate(`/app/announcements`)}
                                  sx={{ mt: { xs: 1, sm: 0 } }}
                                >
                                  Details
                                </Button>
                              </Tooltip>
                            </ListItem>
                            {index <
                              stats.scheduledAnnouncements.length - 1 && (
                              <Divider />
                            )}
                          </React.Fragment>
                        )
                      )}
                    </List>
                  ) : (
                    <Typography
                      variant="body1"
                      component="div"
                      color="text.secondary"
                      align="center"
                      sx={{ py: 2 }}
                    >
                      No scheduled announcements
                    </Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </>
      )}
    </Box>
  );
}

export default Dashboard;
