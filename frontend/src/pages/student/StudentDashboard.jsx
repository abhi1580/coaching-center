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
    ListItemIcon,
    ListItemAvatar,
    IconButton,
    LinearProgress,
    Tooltip,
    Stack,
} from "@mui/material";
import {
    ClassOutlined,
    School,
    CalendarToday,
    AccessTime,
    Today,
    Check,
    Close,
    Person,
    Timelapse,
    ArrowForward,
    Book,
    Timeline,
    ViewList,
    EventNote,
    BarChart,
} from "@mui/icons-material";
import { fetchBatches } from "../../store/slices/batchSlice";
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
                const studentResponse = await studentService.getStudentDetails(user?.id);
                console.log("Student Response:", studentResponse);

                // Extract the actual student data from the nested response
                // The API response structure is { data: { data: actualStudentData } }
                const actualStudentData = studentResponse.data.data;
                console.log("Actual Student Data:", actualStudentData);

                if (!actualStudentData) {
                    console.error("Invalid data structure in response:", studentResponse.data);
                    setError("Could not retrieve student data. Invalid response structure.");
                    setLoading(false);
                    return;
                }

                setStudentData(actualStudentData);

                // Log the batches to debug
                console.log("Student Batches:", actualStudentData.batches);
                console.log("Batches Array?", Array.isArray(actualStudentData.batches));
                console.log("Number of Batches:", actualStudentData.batches?.length || 0);

                // Check each batch
                if (actualStudentData.batches && actualStudentData.batches.length > 0) {
                    actualStudentData.batches.forEach((batch, index) => {
                        console.log(`Batch ${index} ID:`, batch._id);
                        console.log(`Batch ${index} Name:`, batch.name);
                        console.log(`Batch ${index} Subject:`, batch.subject);
                        console.log(`Batch ${index} Teacher:`, batch.teacher);
                    });
                }

                // Fetch student attendance with proper parameters
                const attendanceResponse = await studentService.getStudentAttendance(
                    user?.id,
                    null,   // No specific batch filter
                    null,   // No startDate
                    null    // No endDate
                );
                console.log("Attendance Response:", attendanceResponse);

                // Extract attendance data from the nested structure
                const actualAttendanceData = attendanceResponse.data.data || [];
                console.log("Actual Attendance Data:", actualAttendanceData);

                setAttendanceData(actualAttendanceData);

                // Generate upcoming classes from the student's batches
                if (actualStudentData.batches && Array.isArray(actualStudentData.batches)) {
                    const upcoming = generateUpcomingClasses(actualStudentData.batches);
                    setUpcomingClasses(upcoming);
                }

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

    // Helper function to generate upcoming classes from batches (just for demonstration)
    const generateUpcomingClasses = (batches) => {
        const today = new Date();
        const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const upcoming = [];

        console.log("Generating upcoming classes from batches:", batches);

        batches.forEach((batch) => {
            if (batch.status === 'active' && batch.schedule && batch.schedule.days) {
                console.log(`Processing batch ${batch.name} with days:`, batch.schedule.days);

                batch.schedule.days.forEach((day) => {
                    const dayIndex = weekdays.findIndex(d => d.toLowerCase() === day.toLowerCase());
                    if (dayIndex >= 0) {
                        // Calculate next occurrence of this day
                        let nextDate = new Date();
                        const diff = (dayIndex + 7 - today.getDay()) % 7;
                        nextDate.setDate(today.getDate() + (diff === 0 ? 7 : diff));

                        // Get the subject name properly
                        const subjectName = batch.subject && typeof batch.subject === 'object' ?
                            batch.subject.name : 'Unknown Subject';

                        console.log(`Adding class for ${day} with subject: ${subjectName}`);

                        upcoming.push({
                            batchId: batch._id,
                            batchName: batch.name,
                            subject: subjectName,
                            day,
                            date: nextDate,
                            startTime: batch.schedule.startTime,
                            endTime: batch.schedule.endTime,
                        });
                    }
                });
            }
        });

        // Sort by date
        upcoming.sort((a, b) => a.date - b.date);
        console.log("Generated upcoming classes:", upcoming);

        // Return only next 5 classes
        return upcoming.slice(0, 5);
    };

    // Helper function to calculate attendance percentage
    const calculateAttendancePercentage = (batch) => {
        const batchAttendance = attendanceData.filter(a => a.batch === batch._id);
        if (!batchAttendance.length) return 0;

        const present = batchAttendance.filter(a => a.status === 'present').length;
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
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
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
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">
                    {error}
                </Alert>
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
                    background: `linear-gradient(to right, ${alpha(theme.palette.primary.main, 0.8)}, ${alpha(theme.palette.primary.dark, 0.9)})`,
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
                                fontSize: "1.5rem"
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
                                '& .MuiChip-label': { px: 2 },
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
                                                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                                                    <Typography variant="body2">{batch.name}</Typography>
                                                    <Typography variant="body2" fontWeight="bold" color={getAttendanceColor(percentage)}>
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
                                                        '& .MuiLinearProgress-bar': {
                                                            bgcolor: getAttendanceColor(percentage)
                                                        }
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
                        <CardActions sx={{ justifyContent: "flex-end", p: 2, pt: 0 }}>
                            <Button
                                size="small"
                                endIcon={<ArrowForward />}
                                onClick={() => navigate("/app/student/attendance")}
                            >
                                View Details
                            </Button>
                        </CardActions>
                    </Card>
                </Grid>

                {/* Upcoming Classes */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ height: "100%", borderRadius: 2 }}>
                        <CardContent>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                <EventNote color="primary" sx={{ mr: 1 }} />
                                <Typography variant="h6" fontWeight="bold">
                                    Upcoming Classes
                                </Typography>
                            </Box>
                            <Divider sx={{ mb: 2 }} />

                            {upcomingClasses.length > 0 ? (
                                <List disablePadding>
                                    {upcomingClasses.map((classInfo, index) => (
                                        <React.Fragment key={`${classInfo.batchId}-${index}`}>
                                            {index > 0 && <Divider variant="inset" component="li" />}
                                            <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                                                <ListItemAvatar>
                                                    <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: "primary.main" }}>
                                                        <Today />
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={
                                                        <Typography variant="subtitle2" fontWeight="bold">
                                                            {classInfo.batchName}
                                                        </Typography>
                                                    }
                                                    secondary={
                                                        <>
                                                            <Typography variant="body2" color="text.secondary" component="span">
                                                                {classInfo.subject} • {classInfo.day}
                                                            </Typography>
                                                            <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
                                                                <CalendarToday fontSize="small" sx={{ fontSize: '0.8rem', mr: 0.5, color: "text.secondary" }} />
                                                                <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                                                                    {formatDate(classInfo.date)}
                                                                </Typography>
                                                                <AccessTime fontSize="small" sx={{ fontSize: '0.8rem', mr: 0.5, color: "text.secondary" }} />
                                                                <Typography variant="body2" color="text.secondary">
                                                                    {formatTime(classInfo.startTime)} - {formatTime(classInfo.endTime)}
                                                                </Typography>
                                                            </Box>
                                                        </>
                                                    }
                                                />
                                            </ListItem>
                                        </React.Fragment>
                                    ))}
                                </List>
                            ) : (
                                <Typography color="text.secondary" align="center">
                                    No upcoming classes
                                </Typography>
                            )}
                        </CardContent>
                        <CardActions sx={{ justifyContent: "flex-end", p: 2, pt: 0 }}>
                            <Button
                                size="small"
                                endIcon={<ArrowForward />}
                                onClick={() => navigate("/app/student/schedule")}
                            >
                                View Schedule
                            </Button>
                        </CardActions>
                    </Card>
                </Grid>

                {/* Enrolled Batches */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ height: "100%", borderRadius: 2 }}>
                        <CardContent>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                <Book color="primary" sx={{ mr: 1 }} />
                                <Typography variant="h6" fontWeight="bold">
                                    Enrolled Batches
                                </Typography>
                            </Box>
                            <Divider sx={{ mb: 2 }} />

                            {studentData?.batches?.length > 0 ? (
                                <List disablePadding>
                                    {studentData.batches.map((batch, index) => (
                                        <React.Fragment key={batch._id}>
                                            {index > 0 && <Divider variant="inset" component="li" />}
                                            <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                                                <ListItemAvatar>
                                                    <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: "primary.main" }}>
                                                        <ClassOutlined />
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={
                                                        <Typography variant="subtitle2" fontWeight="bold">
                                                            {batch.name}
                                                        </Typography>
                                                    }
                                                    secondary={
                                                        <>
                                                            <Typography variant="body2" color="text.secondary" component="span">
                                                                {batch.subject?.name || "No subject"}
                                                            </Typography>
                                                            <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
                                                                <Person fontSize="small" sx={{ fontSize: '0.8rem', mr: 0.5, color: "text.secondary" }} />
                                                                <Typography variant="body2" color="text.secondary">
                                                                    {batch.teacher?.name || "Not assigned"}
                                                                </Typography>
                                                            </Box>
                                                        </>
                                                    }
                                                />
                                                <Chip
                                                    label={batch.status || "N/A"}
                                                    size="small"
                                                    color={
                                                        batch.status === "active" ? "success" :
                                                            batch.status === "upcoming" ? "info" :
                                                                batch.status === "completed" ? "warning" : "default"
                                                    }
                                                    sx={{ textTransform: "capitalize" }}
                                                />
                                            </ListItem>
                                        </React.Fragment>
                                    ))}
                                </List>
                            ) : (
                                <Typography color="text.secondary" align="center">
                                    No batches enrolled
                                </Typography>
                            )}
                        </CardContent>
                        <CardActions sx={{ justifyContent: "flex-end", p: 2, pt: 0 }}>
                            <Button
                                size="small"
                                endIcon={<ArrowForward />}
                                onClick={() => navigate("/app/student/batches")}
                            >
                                View All Batches
                            </Button>
                        </CardActions>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default StudentDashboard; 