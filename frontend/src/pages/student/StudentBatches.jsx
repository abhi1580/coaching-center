import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  useTheme,
  alpha,
  Tabs,
  Tab,
  Breadcrumbs,
  Link,
  Stack,
  IconButton,
  Tooltip,
  useMediaQuery,
  CardHeader,
  CardMedia,
} from "@mui/material";
import {
  ClassOutlined,
  CalendarToday,
  AccessTime,
  Person,
  Book,
  School,
  LocationOn,
  SubjectOutlined,
  Home,
  ArrowBack,
  Schedule,
  Info as InfoIcon,
  Event as EventIcon,
} from "@mui/icons-material";
import { fetchBatches } from "../../store/slices/batchSlice";
import { fetchSubjects } from "../../store/slices/subjectSlice";
import { fetchTeachers } from "../../store/slices/teacherSlice";
import { studentService } from "../../services/api";
import { useNavigate } from "react-router-dom";

const StudentBatches = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [localSubjects, setLocalSubjects] = useState([]);
  const [localTeachers, setLocalTeachers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch student details which includes their batches
        const studentResponse = await studentService.getStudentDetails(
          user?.id
        );
        console.log("Student Data Response:", studentResponse);

        // Extract the actual student data from the nested structure
        const actualStudentData = studentResponse.data.data;
        console.log("Actual Student Data:", actualStudentData);

        if (actualStudentData) {
          console.log(
            "Student Batches Array:",
            Array.isArray(actualStudentData.batches)
              ? `Found ${actualStudentData.batches.length} batches`
              : `Batches is not an array or is undefined: ${typeof actualStudentData.batches}`
          );

          if (actualStudentData.batches) {
            actualStudentData.batches.forEach((batch, index) => {
              console.log(`Batch ${index}:`, batch);
              console.log(`Batch ${index} subject:`, batch.subject);
              console.log(`Batch ${index} teacher:`, batch.teacher);
            });
          }

          setStudentData(actualStudentData);

          // Extract subject and teacher info from the student data
          if (
            actualStudentData.batches &&
            Array.isArray(actualStudentData.batches)
          ) {
            // Get unique subjects from batches
            const batchSubjects = actualStudentData.batches
              .filter((batch) => batch.subject)
              .map((batch) => batch.subject);
            setLocalSubjects(batchSubjects);

            // Get unique teachers from batches
            const batchTeachers = actualStudentData.batches
              .filter((batch) => batch.teacher)
              .map((batch) => batch.teacher);
            setLocalTeachers(batchTeachers);
          }
        } else {
          console.error("Could not extract student data from response");
          setError("Failed to extract student data from the server response");
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to load batch data");
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchData();
    }
  }, [dispatch, user?.id]);

  // Helper functions
  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    try {
      const [hours, minutes] = timeString.split(":");
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? "PM" : "AM";
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    } catch (error) {
      return timeString;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "N/A";
    }
  };

  // Updated helper functions to work with populated data from student-specific endpoint
  const getTeacherName = (teacher) => {
    if (!teacher) return "Not assigned";
    return typeof teacher === "object" ? teacher.name : "Not assigned";
  };

  const getSubjectName = (subject) => {
    if (!subject) return "Unknown Subject";
    return typeof subject === "object" ? subject.name : "Unknown Subject";
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "ongoing":
        return "success";
      case "upcoming":
        return "warning";
      case "completed":
        return "error";
      default:
        return "default";
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Filter batches based on tab
  const getFilteredBatches = () => {
    if (!studentData?.batches) {
      console.log("No batches found in studentData:", studentData);
      return [];
    }

    if (!Array.isArray(studentData.batches)) {
      console.log("studentData.batches is not an array:", studentData.batches);
      return [];
    }

    console.log("Total batches before filtering:", studentData.batches.length);

    switch (tabValue) {
      case 0: // All
        return studentData.batches;
      case 1: // Ongoing
        return studentData.batches.filter((batch) => batch.status === "Ongoing");
      case 2: // Upcoming
        return studentData.batches.filter(
          (batch) => batch.status === "upcoming"
        );
      case 3: // Completed
        return studentData.batches.filter(
          (batch) => batch.status === "completed"
        );
      default:
        return studentData.batches;
    }
  };

  // Get batch schedule days formatted as string
  const getScheduleDays = (batch) => {
    if (!batch.schedule?.days || !Array.isArray(batch.schedule.days) || batch.schedule.days.length === 0) {
      return "No schedule";
    }
    return batch.schedule.days.join(", ");
  };

  // Get batch schedule time formatted
  const getScheduleTime = (batch) => {
    if (!batch.schedule?.startTime || !batch.schedule?.endTime) {
      return "No time set";
    }
    return `${formatTime(batch.schedule.startTime)} - ${formatTime(batch.schedule.endTime)}`;
  };

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
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const filteredBatches = getFilteredBatches();
  console.log("Filtered batches for rendering:", filteredBatches);
  console.log("Number of batches to render:", filteredBatches.length);

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }} separator="›">
        <Link
          underline="hover"
          color="inherit"
          href="/app/student/dashboard"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <Home sx={{ mr: 0.5 }} fontSize="small" />
          Dashboard
        </Link>
        <Typography
          color="text.primary"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <ClassOutlined sx={{ mr: 0.5 }} fontSize="small" />
          My Batches
        </Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.05),
          borderRadius: 2,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 120,
            height: 120,
            borderRadius: '50%',
            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
            zIndex: 0,
          }}
        />

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
              fontWeight: 700,
              color: "primary.dark",
              mb: 1,
            }}
          >
            My Enrolled Batches
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage all your enrolled classes and batches
          </Typography>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper
        sx={{
          borderRadius: 2,
          mb: 3,
          overflow: 'hidden',
          boxShadow: 1
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.8),
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              py: 1.5,
              px: { xs: 1.5, sm: 3 },
              minWidth: { xs: 'auto', sm: 120 },
            },
          }}
        >
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center" }}>
                All
                <Chip
                  label={studentData?.batches?.length || 0}
                  size="small"
                  color="default"
                  sx={{ ml: 1, height: 20, minWidth: 20 }}
                />
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center" }}>
                Ongoing
                <Chip
                  label={
                    studentData?.batches?.filter((b) => b.status === "Ongoing")
                      .length || 0
                  }
                  size="small"
                  color="success"
                  sx={{ ml: 1, height: 20, minWidth: 20 }}
                />
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center" }}>
                Upcoming
                <Chip
                  label={
                    studentData?.batches?.filter((b) => b.status === "upcoming")
                      .length || 0
                  }
                  size="small"
                  color="warning"
                  sx={{ ml: 1, height: 20, minWidth: 20 }}
                />
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center" }}>
                Completed
                <Chip
                  label={
                    studentData?.batches?.filter(
                      (b) => b.status === "completed"
                    ).length || 0
                  }
                  size="small"
                  color="error"
                  sx={{ ml: 1, height: 20, minWidth: 20 }}
                />
              </Box>
            }
          />
        </Tabs>
      </Paper>

      {/* Batches */}
      {filteredBatches.length === 0 ? (
        <Paper
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: 2,
            bgcolor: alpha(theme.palette.info.light, 0.05),
          }}
        >
          <ClassOutlined sx={{ fontSize: 60, color: alpha(theme.palette.info.main, 0.3), mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No batches found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {tabValue === 0
              ? "You are not enrolled in any batches yet."
              : `You don't have any ${tabValue === 1
                ? "ongoing"
                : tabValue === 2
                  ? "upcoming"
                  : "completed"
              } batches.`}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredBatches.map((batch) => (
            <Grid item xs={12} sm={6} md={4} key={batch._id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  overflow: 'visible',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6,
                  },
                }}
                elevation={2}
              >
                <CardHeader
                  title={
                    <Typography variant="h6" fontWeight="bold">
                      {batch.name}
                    </Typography>
                  }
                  subheader={
                    <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
                      <SubjectOutlined fontSize="small" sx={{ mr: 0.5, color: "text.secondary" }} />
                      <Typography variant="body2" color="text.secondary">
                        {getSubjectName(batch.subject)}
                      </Typography>
                    </Box>
                  }
                  action={
                    <Chip
                      label={batch.status || "Unknown"}
                      size="small"
                      color={getStatusColor(batch.status)}
                      sx={{
                        textTransform: "capitalize",
                        fontWeight: 500,
                        letterSpacing: '0.5px',
                      }}
                    />
                  }
                  sx={{
                    pb: 0.5,
                    pt: 2,
                    px: 2,
                    '& .MuiCardHeader-content': { overflow: 'hidden' },
                  }}
                />

                <CardContent sx={{ pt: 1, pb: 2, px: 3, flexGrow: 1 }}>
                  <Stack spacing={2} sx={{ mt: 1.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Person fontSize="small" color="primary" />
                      <Typography variant="body2">
                        <strong>Teacher:</strong> {getTeacherName(batch.teacher)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Schedule fontSize="small" color="primary" />
                      <Typography variant="body2">
                        <strong>Days:</strong> {getScheduleDays(batch)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AccessTime fontSize="small" color="primary" />
                      <Typography variant="body2">
                        <strong>Time:</strong> {getScheduleTime(batch)}
                      </Typography>
                    </Box>

                    <Divider />

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CalendarToday fontSize="small" color="primary" />
                      <Typography variant="body2">
                        <strong>Duration:</strong> {formatDate(batch.startDate)} - {formatDate(batch.endDate)}
                      </Typography>
                    </Box>

                    {batch.description && batch.description.length > 0 && (
                      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, mt: 0.5 }}>
                        <InfoIcon fontSize="small" color="primary" sx={{ mt: 0.3 }} />
                        <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
                          {batch.description}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default StudentBatches;
