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
  alpha,
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
} from "../../services/api";

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
      elevation={3}
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: 2,
        bgcolor: theme.palette.background.paper,
        cursor: "pointer",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 6,
          bgcolor: `${color}.main`,
          color: "white",
          "& .MuiTypography-root": { color: "white" },
          "& .MuiSvgIcon-root": { color: "white" },
        },
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        border: `1px solid ${theme.palette.divider}`,
      }}
      onClick={onClick}
    >
      <Box
        sx={{
          position: "absolute",
          right: -10,
          top: -10,
          opacity: 0.1,
          transform: "rotate(15deg)",
        }}
      >
        <Icon sx={{ fontSize: 100, color: `${color}.main` }} />
      </Box>
      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
          <Box
            sx={{
              bgcolor: `${color}.main`,
              p: 1,
              borderRadius: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mr: 1.5,
            }}
          >
            <Icon sx={{ fontSize: 22, color: "white" }} />
          </Box>
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontSize: { xs: "0.9rem", sm: "1rem" },
              fontWeight: 600,
              color: `${color}.main`,
            }}
          >
            {title}
          </Typography>
        </Box>
        <Typography
          variant="h4"
          component="div"
          sx={{
            fontSize: { xs: "1.8rem", sm: "2.2rem" },
            fontWeight: 700,
            color: "text.primary",
            mb: 0.5,
          }}
        >
          {value.toLocaleString()}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          View details
        </Typography>
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      <Paper
        elevation={2}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: { xs: 3, sm: 4 },
          borderRadius: 2,
          backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          boxShadow: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: { xs: 2, sm: 0 },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.2)",
                borderRadius: "50%",
                p: 1.5,
                mr: 2,
                display: { xs: "none", sm: "flex" },
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ClassIcon sx={{ fontSize: 32, color: "white" }} />
            </Box>
            <Box>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontSize: { xs: "1.8rem", sm: "2.2rem", md: "2.5rem" },
                  fontWeight: 700,
                  color: "white",
                  mb: 0.5,
                }}
              >
                Dashboard
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{ color: "rgba(255, 255, 255, 0.8)" }}
              >
                Welcome to your coaching center overview
              </Typography>
            </Box>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchStats}
            disabled={loading}
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.15)",
              color: "white",
              borderColor: "rgba(255, 255, 255, 0.3)",
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.25)",
                borderColor: "rgba(255, 255, 255, 0.5)",
              },
            }}
          >
            Refresh
          </Button>
        </Box>
      </Paper>

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
            <Typography
              variant="h5"
              component="h2"
              sx={{
                mb: 2.5,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                "&::before": {
                  content: '""',
                  display: "block",
                  width: 4,
                  height: 24,
                  backgroundColor: theme.palette.primary.main,
                  mr: 1.5,
                  borderRadius: 1,
                },
              }}
            >
              Announcements
            </Typography>
            <Grid container spacing={3}>
              {/* Active Announcements */}
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={2}
                  sx={{
                    borderRadius: 2,
                    overflow: "hidden",
                    height: "100%",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: 4,
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      p: { xs: 1.5, sm: 2 },
                      borderBottom: `1px solid ${alpha(
                        theme.palette.success.main,
                        0.2
                      )}`,
                    }}
                  >
                    <Typography
                      variant="h6"
                      component="div"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        fontSize: { xs: "1rem", sm: "1.1rem" },
                        fontWeight: 600,
                        color: "success.main",
                      }}
                    >
                      <AnnouncementIcon sx={{ mr: 1, fontSize: 20 }} />
                      Active Announcements
                    </Typography>
                    <Chip
                      label={`${stats.counts?.active || 0} Active`}
                      color="success"
                      size="small"
                      sx={{ fontWeight: 500, px: 0.5 }}
                    />
                  </Box>

                  <Box sx={{ p: { xs: 0, sm: 0 } }}>
                    {loading ? (
                      <LinearProgress sx={{ my: 4 }} />
                    ) : stats.activeAnnouncements &&
                      stats.activeAnnouncements.length > 0 ? (
                      <List sx={{ py: 0 }}>
                        {stats.activeAnnouncements.map(
                          (announcement, index) => (
                            <React.Fragment key={announcement._id}>
                              <ListItem
                                sx={{
                                  flexDirection: { xs: "column", sm: "row" },
                                  alignItems: {
                                    xs: "flex-start",
                                    sm: "center",
                                  },
                                  px: { xs: 2, sm: 3 },
                                  py: 2,
                                  transition: "all 0.2s ease",
                                  "&:hover": {
                                    bgcolor: alpha(
                                      theme.palette.primary.light,
                                      0.05
                                    ),
                                  },
                                }}
                              >
                                <ListItemText
                                  component="div"
                                  primary={
                                    <Typography
                                      variant="subtitle1"
                                      fontWeight="600"
                                      sx={{
                                        fontSize: { xs: "0.95rem", sm: "1rem" },
                                        color: "text.primary",
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
                                        alignItems: {
                                          xs: "flex-start",
                                          sm: "center",
                                        },
                                      }}
                                    >
                                      <Typography
                                        variant="body2"
                                        component="span"
                                        color="text.secondary"
                                        sx={{
                                          fontSize: {
                                            xs: "0.75rem",
                                            sm: "0.8rem",
                                          },
                                          display: "flex",
                                          alignItems: "center",
                                        }}
                                      >
                                        Ends:{" "}
                                        {formatDateTime(announcement.endDate)}
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        component="span"
                                        color="text.secondary"
                                        sx={{
                                          fontSize: {
                                            xs: "0.75rem",
                                            sm: "0.8rem",
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
                                        sx={{
                                          height: 20,
                                          fontSize: "0.7rem",
                                          fontWeight: 500,
                                        }}
                                      />
                                    </Box>
                                  }
                                />
                                <Button
                                  variant="outlined"
                                  size="small"
                                  color="primary"
                                  onClick={() => navigate(`/app/announcements`)}
                                  sx={{
                                    mt: { xs: 1, sm: 0 },
                                    borderRadius: 1.5,
                                    textTransform: "none",
                                    px: 2,
                                    minWidth: 80,
                                  }}
                                >
                                  Details
                                </Button>
                              </ListItem>
                              {index < stats.activeAnnouncements.length - 1 && (
                                <Divider sx={{ mx: { xs: 2, sm: 3 } }} />
                              )}
                            </React.Fragment>
                          )
                        )}
                      </List>
                    ) : (
                      <Box
                        sx={{
                          py: 4,
                          px: 2,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          bgcolor: alpha(theme.palette.background.default, 0.4),
                        }}
                      >
                        <AnnouncementIcon
                          sx={{
                            fontSize: 40,
                            color: alpha(theme.palette.text.secondary, 0.4),
                            mb: 1,
                          }}
                        />
                        <Typography
                          variant="body1"
                          component="div"
                          color="text.secondary"
                          align="center"
                        >
                          No active announcements
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Paper>
              </Grid>

              {/* Scheduled Announcements */}
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={2}
                  sx={{
                    borderRadius: 2,
                    overflow: "hidden",
                    height: "100%",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: 4,
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      bgcolor: alpha(theme.palette.warning.main, 0.1),
                      p: { xs: 1.5, sm: 2 },
                      borderBottom: `1px solid ${alpha(
                        theme.palette.warning.main,
                        0.2
                      )}`,
                    }}
                  >
                    <Typography
                      variant="h6"
                      component="div"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        fontSize: { xs: "1rem", sm: "1.1rem" },
                        fontWeight: 600,
                        color: "warning.main",
                      }}
                    >
                      <AnnouncementIcon sx={{ mr: 1, fontSize: 20 }} />
                      Scheduled Announcements
                    </Typography>
                    <Chip
                      label={`${stats.counts?.scheduled || 0} Scheduled`}
                      color="warning"
                      size="small"
                      sx={{ fontWeight: 500, px: 0.5 }}
                    />
                  </Box>

                  <Box sx={{ p: { xs: 0, sm: 0 } }}>
                    {loading ? (
                      <LinearProgress sx={{ my: 4 }} />
                    ) : stats.scheduledAnnouncements &&
                      stats.scheduledAnnouncements.length > 0 ? (
                      <List sx={{ py: 0 }}>
                        {stats.scheduledAnnouncements.map(
                          (announcement, index) => (
                            <React.Fragment key={announcement._id}>
                              <ListItem
                                sx={{
                                  flexDirection: { xs: "column", sm: "row" },
                                  alignItems: {
                                    xs: "flex-start",
                                    sm: "center",
                                  },
                                  px: { xs: 2, sm: 3 },
                                  py: 2,
                                  transition: "all 0.2s ease",
                                  "&:hover": {
                                    bgcolor: alpha(
                                      theme.palette.primary.light,
                                      0.05
                                    ),
                                  },
                                }}
                              >
                                <ListItemText
                                  component="div"
                                  primary={
                                    <Typography
                                      variant="subtitle1"
                                      fontWeight="600"
                                      sx={{
                                        fontSize: { xs: "0.95rem", sm: "1rem" },
                                        color: "text.primary",
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
                                        alignItems: {
                                          xs: "flex-start",
                                          sm: "center",
                                        },
                                      }}
                                    >
                                      <Typography
                                        variant="body2"
                                        component="span"
                                        color="text.secondary"
                                        sx={{
                                          fontSize: {
                                            xs: "0.75rem",
                                            sm: "0.8rem",
                                          },
                                          display: "flex",
                                          alignItems: "center",
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
                                            sm: "0.8rem",
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
                                        sx={{
                                          height: 20,
                                          fontSize: "0.7rem",
                                          fontWeight: 500,
                                        }}
                                      />
                                    </Box>
                                  }
                                />
                                <Button
                                  variant="outlined"
                                  size="small"
                                  color="primary"
                                  onClick={() => navigate(`/app/announcements`)}
                                  sx={{
                                    mt: { xs: 1, sm: 0 },
                                    borderRadius: 1.5,
                                    textTransform: "none",
                                    px: 2,
                                    minWidth: 80,
                                  }}
                                >
                                  Details
                                </Button>
                              </ListItem>
                              {index <
                                stats.scheduledAnnouncements.length - 1 && (
                                <Divider sx={{ mx: { xs: 2, sm: 3 } }} />
                              )}
                            </React.Fragment>
                          )
                        )}
                      </List>
                    ) : (
                      <Box
                        sx={{
                          py: 4,
                          px: 2,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          bgcolor: alpha(theme.palette.background.default, 0.4),
                        }}
                      >
                        <AnnouncementIcon
                          sx={{
                            fontSize: 40,
                            color: alpha(theme.palette.text.secondary, 0.4),
                            mb: 1,
                          }}
                        />
                        <Typography
                          variant="body1"
                          component="div"
                          color="text.secondary"
                          align="center"
                        >
                          No scheduled announcements
                        </Typography>
                      </Box>
                    )}
                  </Box>
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
