import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Alert,
  useTheme,
  alpha,
  LinearProgress,
  Stack,
  Avatar,
  Chip,
} from "@mui/material";
import {
  ClassOutlined,
  School,
  CalendarToday,
  AccessTime,
  Today,
  EventNote,
  BarChart,
} from "@mui/icons-material";
import { studentService } from "../../services/api";
import { useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        console.log("Fetching student data for ID:", user?.id);

        // Fetch student detail using the student-specific endpoint
        const studentResponse = await studentService.getStudentDetails(
          user?.id
        );
        console.log("Student Response:", studentResponse);

        // Extract the actual student data from the nested response
        const actualStudentData = studentResponse.data.data;
        console.log("Actual Student Data:", actualStudentData);

        if (!actualStudentData) {
          console.error(
            "Invalid data structure in response:",
            studentResponse.data
          );
          setError(
            "Could not retrieve student data. Invalid response structure."
          );
          setLoading(false);
          return;
        }

        setStudentData(actualStudentData);

        // Log the enrolled batches
        console.log("Student's Enrolled Batches:", actualStudentData.batches);

        // Check if student has any enrolled batches
        if (
          !actualStudentData.batches ||
          !Array.isArray(actualStudentData.batches) ||
          actualStudentData.batches.length === 0
        ) {
          console.log("Student is not enrolled in any batches");
          setUpcomingClasses([]);
          setLoading(false);
          return;
        }

        // Log details of each enrolled batch
        actualStudentData.batches.forEach((batch, index) => {
          console.log(`Enrolled Batch ${index + 1}:`, {
            id: batch._id,
            name: batch.name,
            status: batch.status,
            startDate: batch.startDate,
            endDate: batch.endDate,
            schedule: batch.schedule,
          });
        });

        // Generate upcoming classes only for enrolled batches
        const upcoming = generateUpcomingClasses(actualStudentData.batches);
        setUpcomingClasses(upcoming);

        // Fetch student attendance with proper parameters
        const attendanceResponse = await studentService.getStudentAttendance(
          user?.id,
          null, // No specific batch filter
          null, // No startDate
          null // No endDate
        );
        console.log("Attendance Response:", attendanceResponse);

        // Extract attendance data from the nested structure
        const actualAttendanceData = attendanceResponse.data.data || [];
        console.log("Actual Attendance Data:", actualAttendanceData);

        setAttendanceData(actualAttendanceData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching student data:", err);
        setError(err.message || "Failed to load student data");
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchStudentData();
    }
  }, [dispatch, user?.id]);

  // Helper function to generate upcoming classes from batches
  const generateUpcomingClasses = (batches) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const fourDaysLater = new Date(today);
    fourDaysLater.setDate(today.getDate() + 4);
    const weekdays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const upcoming = [];

    console.log("Generating upcoming classes from batches:", batches);

    batches.forEach((batch) => {
      // Check if batch is ongoing and has schedule
      if (batch.status === "Ongoing" && batch.schedule && batch.schedule.days) {
        // Check if batch has valid start and end dates
        const batchStartDate = new Date(batch.startDate);
        const batchEndDate = new Date(batch.endDate);
        batchStartDate.setHours(0, 0, 0, 0);
        batchEndDate.setHours(0, 0, 0, 0);

        console.log(`Processing batch ${batch.name}:`, {
          startDate: batchStartDate,
          endDate: batchEndDate,
          days: batch.schedule.days,
        });

        // Check if batch is currently active
        if (today >= batchStartDate && today <= batchEndDate) {
          batch.schedule.days.forEach((day) => {
            const dayIndex = weekdays.findIndex(
              (d) => d.toLowerCase() === day.toLowerCase()
            );
            if (dayIndex >= 0) {
              // Calculate next occurrence of this day
              let nextDate = new Date();
              const diff = (dayIndex + 7 - today.getDay()) % 7;
              nextDate.setDate(today.getDate() + (diff === 0 ? 7 : diff));
              nextDate.setHours(0, 0, 0, 0);

              // Check if the date is within batch date range and next 4 days
              if (
                nextDate <= fourDaysLater &&
                nextDate >= batchStartDate &&
                nextDate <= batchEndDate
              ) {
                // Get the subject name properly
                const subjectName =
                  batch.subject && typeof batch.subject === "object"
                    ? batch.subject.name
                    : "Unknown Subject";

                // Get the standard name properly
                const standardName =
                  batch.standard && typeof batch.standard === "object"
                    ? batch.standard.name
                    : "Unknown Standard";

                console.log(
                  `Adding class for ${day} with subject: ${subjectName}`,
                  {
                    nextDate,
                    batchStartDate,
                    batchEndDate,
                    standardName,
                  }
                );

                upcoming.push({
                  batchId: batch._id,
                  batchName: batch.name,
                  subject: subjectName,
                  standard: standardName,
                  day,
                  date: nextDate,
                  startTime: batch.schedule.startTime,
                  endTime: batch.schedule.endTime,
                });
              }
            }
          });
        } else {
          console.log(
            `Skipping batch ${batch.name} - not active (start: ${batchStartDate}, end: ${batchEndDate})`
          );
        }
      } else {
        console.log(
          `Skipping batch ${batch.name} - not ongoing or no schedule`
        );
      }
    });

    // Sort by date and time
    upcoming.sort((a, b) => {
      if (a.date.getTime() !== b.date.getTime()) {
        return a.date.getTime() - b.date.getTime();
      }
      return a.startTime.localeCompare(b.startTime);
    });

    console.log("Generated upcoming classes:", upcoming);
    return upcoming;
  };

  // Helper function to calculate attendance percentage
  const calculateAttendancePercentage = (batch) => {
    const batchAttendance = attendanceData.filter((a) => a.batch === batch._id);
    if (!batchAttendance.length) return 0;

    const present = batchAttendance.filter(
      (a) => a.status === "present"
    ).length;
    return Math.round((present / batchAttendance.length) * 100);
  };

  // Helper function to format time
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

  // Helper function to format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Get color based on attendance percentage
  const getAttendanceColor = (percentage) => {
    if (percentage >= 90) return theme.palette.success.main;
    if (percentage >= 75) return theme.palette.info.main;
    if (percentage >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
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

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Welcome Section */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          borderRadius: 2,
          background: `linear-gradient(to right, ${alpha(
            theme.palette.primary.main,
            0.8
          )}, ${alpha(theme.palette.primary.dark, 0.9)})`,
          color: "white",
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Avatar
              sx={{
                width: 70,
                height: 70,
                bgcolor: "white",
                color: "primary.main",
                fontWeight: "bold",
                fontSize: "1.5rem",
              }}
            >
              {studentData?.name?.charAt(0) || "S"}
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h4" fontWeight="bold">
              Welcome, {studentData?.name || "Student"}!
            </Typography>
            <Typography variant="body1" component="div">
              Here's an overview of your academic progress and schedule
            </Typography>
          </Grid>
          <Grid item>
            <Chip
              label={studentData?.standard?.name || "Not assigned"}
              color="secondary"
              sx={{
                bgcolor: "white",
                color: "primary.main",
                fontWeight: "bold",
                "& .MuiChip-label": { px: 2 },
              }}
              icon={<School style={{ color: theme.palette.primary.main }} />}
            />
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {/* Attendance Summary */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%", borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <BarChart color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  Attendance Summary
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {studentData?.batches?.length > 0 ? (
                <Stack spacing={2}>
                  {studentData.batches.map((batch) => {
                    const percentage = calculateAttendancePercentage(batch);
                    return (
                      <Box key={batch._id}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 0.5,
                          }}
                        >
                          <Typography variant="body2">{batch.name}</Typography>
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            color={getAttendanceColor(percentage)}
                          >
                            {percentage}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={percentage}
                          sx={{
                            height: 8,
                            borderRadius: 1,
                            bgcolor: alpha(getAttendanceColor(percentage), 0.2),
                            "& .MuiLinearProgress-bar": {
                              bgcolor: getAttendanceColor(percentage),
                            },
                          }}
                        />
                      </Box>
                    );
                  })}
                </Stack>
              ) : (
                <Typography color="text.secondary" align="center">
                  No batches enrolled
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Classes */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: "100%", borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <EventNote color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  Upcoming Classes
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {upcomingClasses.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 3 }}>
                  <EventNote
                    sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
                  />
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    gutterBottom
                  >
                    No classes scheduled for the next 4 days.
                  </Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, 1fr)",
                      md: "repeat(2, 1fr)",
                    },
                    gap: 2,
                  }}
                >
                  {upcomingClasses.slice(0, 4).map((classInfo, index) => (
                    <Card
                      key={`${classInfo.batchId}-${index}`}
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
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 1,
                            }}
                          >
                            <ClassOutlined fontSize="small" sx={{ mr: 1 }} />
                            <strong>Subject:</strong> {classInfo.subject}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 1,
                            }}
                          >
                            <School fontSize="small" sx={{ mr: 1 }} />
                            <strong>Standard:</strong> {classInfo.standard}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 1,
                            }}
                          >
                            <CalendarToday fontSize="small" sx={{ mr: 1 }} />
                            <strong>Day:</strong> {classInfo.day}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 1,
                            }}
                          >
                            <AccessTime fontSize="small" sx={{ mr: 1 }} />
                            <strong>Time:</strong>{" "}
                            {formatTime(classInfo.startTime)} -{" "}
                            {formatTime(classInfo.endTime)}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ display: "flex", alignItems: "center" }}
                          >
                            <Today fontSize="small" sx={{ mr: 1 }} />
                            <strong>Date:</strong> {formatDate(classInfo.date)}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentDashboard;
