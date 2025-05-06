import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  useTheme,
  alpha,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  IconButton,
  Collapse,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Tabs,
  Tab,
  Breadcrumbs,
  Link,
} from "@mui/material";
import {
  ClassOutlined,
  CalendarToday,
  AccessTime,
  Today,
  Person,
  ArrowForward,
  Book,
  School,
  LocationOn,
  SubjectOutlined,
  ExpandMore,
  ExpandLess,
  Home,
  ArrowBack,
  Schedule,
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
  const { batches } = useSelector((state) => state.batches);
  const { subjects } = useSelector((state) => state.subjects);
  const { teachers } = useSelector((state) => state.teachers);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [expandedBatch, setExpandedBatch] = useState(null);
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

        // The API returns data in a nested structure with { data: { data: actualData } }
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
      case "active":
        return "success";
      case "upcoming":
        return "info";
      case "completed":
        return "warning";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const handleExpandBatch = (batchId) => {
    setExpandedBatch(expandedBatch === batchId ? null : batchId);
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
      case 1: // Active
        return studentData.batches.filter((batch) => batch.status === "active");
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
          <Book sx={{ mr: 0.5 }} fontSize="small" />
          Student Dashboard
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          My Enrolled Batches
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate("/app/student/dashboard")}
        >
          Back to Dashboard
        </Button>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="All Batches" />
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center" }}>
                Active
                <Chip
                  label={
                    studentData?.batches?.filter((b) => b.status === "active")
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
                  color="info"
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
                  color="warning"
                  sx={{ ml: 1, height: 20, minWidth: 20 }}
                />
              </Box>
            }
          />
        </Tabs>
      </Box>

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
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No batches found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {tabValue === 0
              ? "You are not enrolled in any batches yet."
              : `You don't have any ${
                  tabValue === 1
                    ? "active"
                    : tabValue === 2
                    ? "upcoming"
                    : "completed"
                } batches.`}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredBatches.map((batch) => (
            <Grid item xs={12} key={batch._id}>
              <Card sx={{ borderRadius: 2, overflow: "visible" }}>
                <CardContent sx={{ pb: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: "primary.main",
                          width: 56,
                          height: 56,
                        }}
                      >
                        <ClassOutlined fontSize="large" />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {batch.name}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            flexWrap: "wrap",
                          }}
                        >
                          <Chip
                            label={getSubjectName(batch.subject)}
                            size="small"
                            sx={{
                              bgcolor: alpha(theme.palette.secondary.main, 0.1),
                              color: "secondary.main",
                            }}
                            icon={
                              <SubjectOutlined
                                style={{ fontSize: "0.875rem" }}
                              />
                            }
                          />
                          <Chip
                            label={batch.status || "Unknown"}
                            size="small"
                            color={getStatusColor(batch.status)}
                            sx={{ textTransform: "capitalize" }}
                          />
                        </Box>
                      </Box>
                    </Box>

                    <IconButton onClick={() => handleExpandBatch(batch._id)}>
                      {expandedBatch === batch._id ? (
                        <ExpandLess />
                      ) : (
                        <ExpandMore />
                      )}
                    </IconButton>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Person fontSize="small" color="primary" />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Teacher
                          </Typography>
                          <Typography variant="body1">
                            {getTeacherName(batch.teacher)}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Schedule fontSize="small" color="primary" />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Schedule
                          </Typography>
                          <Typography variant="body1">
                            {batch.schedule?.days?.join(", ") || "No schedule"}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <AccessTime fontSize="small" color="primary" />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Time
                          </Typography>
                          <Typography variant="body1">
                            {batch.schedule?.startTime &&
                            batch.schedule?.endTime
                              ? `${formatTime(
                                  batch.schedule.startTime
                                )} - ${formatTime(batch.schedule.endTime)}`
                              : "Not specified"}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>

                  <Collapse in={expandedBatch === batch._id}>
                    <Box sx={{ mt: 3 }}>
                      <Divider sx={{ mb: 2 }} />

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <CalendarToday fontSize="small" color="primary" />
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Start Date
                              </Typography>
                              <Typography variant="body1">
                                {formatDate(batch.startDate)}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>

                        <Grid item xs={12} sm={4}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <CalendarToday fontSize="small" color="primary" />
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                End Date
                              </Typography>
                              <Typography variant="body1">
                                {formatDate(batch.endDate)}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>

                        <Grid item xs={12} sm={4}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <LocationOn fontSize="small" color="primary" />
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Location
                              </Typography>
                              <Typography variant="body1">
                                {batch.location || "Not specified"}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>

                        <Grid item xs={12}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            gutterBottom
                          >
                            Description
                          </Typography>
                          <Typography variant="body1">
                            {batch.description || "No description available."}
                          </Typography>
                        </Grid>

                        {batch.syllabus && batch.syllabus.length > 0 && (
                          <Grid item xs={12}>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              gutterBottom
                            >
                              Syllabus
                            </Typography>
                            <TableContainer
                              component={Paper}
                              variant="outlined"
                              sx={{ mt: 1 }}
                            >
                              <Table size="small">
                                <TableHead
                                  sx={{
                                    bgcolor: alpha(
                                      theme.palette.primary.main,
                                      0.05
                                    ),
                                  }}
                                >
                                  <TableRow>
                                    <TableCell width="15%">Week</TableCell>
                                    <TableCell>Topic</TableCell>
                                    <TableCell>Description</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {batch.syllabus.map((item, index) => (
                                    <TableRow key={index}>
                                      <TableCell>
                                        {item.week || index + 1}
                                      </TableCell>
                                      <TableCell>
                                        {item.topic || "Not specified"}
                                      </TableCell>
                                      <TableCell>
                                        {item.description || "No description"}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Grid>
                        )}
                      </Grid>
                    </Box>
                  </Collapse>
                </CardContent>

                <CardActions sx={{ justifyContent: "flex-end", p: 2 }}>
                  <Button
                    size="small"
                    endIcon={<ArrowForward />}
                    onClick={() =>
                      navigate(`/app/student/batches/${batch._id}`)
                    }
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default StudentBatches;
