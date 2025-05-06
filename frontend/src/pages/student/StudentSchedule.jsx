import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Paper,
    Grid,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    useTheme,
    alpha,
    Divider,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    useMediaQuery,
    Breadcrumbs,
    Link,
} from "@mui/material";
import {
    Schedule as ScheduleIcon,
    Event as EventIcon,
    AccessTime as TimeIcon,
    School as SchoolIcon,
    Book as BookIcon,
    Home as HomeIcon,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { studentService } from "../../services/api";

const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const timeSlots = [
    "8:00 AM - 9:00 AM",
    "9:00 AM - 10:00 AM",
    "10:00 AM - 11:00 AM",
    "11:00 AM - 12:00 PM",
    "12:00 PM - 1:00 PM",
    "1:00 PM - 2:00 PM",
    "2:00 PM - 3:00 PM",
    "3:00 PM - 4:00 PM",
    "4:00 PM - 5:00 PM",
    "5:00 PM - 6:00 PM",
    "6:00 PM - 7:00 PM",
    "7:00 PM - 8:00 PM",
];

const StudentSchedule = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const isTablet = useMediaQuery(theme.breakpoints.down("md"));
    const { user } = useSelector((state) => state.auth);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [schedule, setSchedule] = useState([]);
    const [studentBatches, setStudentBatches] = useState([]);

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                setLoading(true);
                // First get student batches
                const studentData = await studentService.getStudentDetails();
                console.log("Student data:", studentData.data);

                const batchesData = studentData.data.data.batches || [];
                setStudentBatches(batchesData);

                // Create schedule from batch data
                const scheduleData = organizeSchedule(batchesData);
                setSchedule(scheduleData);

                setLoading(false);
            } catch (err) {
                console.error("Error fetching student schedule:", err);
                setError(err.message || "Failed to load schedule data");
                setLoading(false);
            }
        };

        if (user?.id) {
            fetchStudentData();
        }
    }, [user?.id]);

    // Function to organize batch data into a schedule format
    const organizeSchedule = (batches) => {
        // Prepare an empty schedule
        const scheduleMatrix = {};

        weekdays.forEach(day => {
            scheduleMatrix[day] = {};
            timeSlots.forEach(slot => {
                scheduleMatrix[day][slot] = [];
            });
        });

        // Fill the schedule with batch data
        batches.forEach(batch => {
            if (batch.schedule && Array.isArray(batch.schedule)) {
                batch.schedule.forEach(session => {
                    const day = session.day;
                    const startTime = session.startTime;
                    const endTime = session.endTime;
                    const timeSlot = `${startTime} - ${endTime}`;

                    // Find the closest standard time slot
                    const closestSlot = findClosestTimeSlot(timeSlot);

                    if (day && closestSlot) {
                        if (!scheduleMatrix[day][closestSlot]) {
                            scheduleMatrix[day][closestSlot] = [];
                        }

                        scheduleMatrix[day][closestSlot].push({
                            id: batch._id,
                            name: batch.name,
                            subject: batch.subject?.name || 'Unknown Subject',
                            teacher: batch.teacher?.name || 'Unknown Teacher',
                            time: timeSlot,
                            actualSlot: closestSlot,
                        });
                    }
                });
            }
        });

        return scheduleMatrix;
    };

    // Helper function to find the closest standard time slot
    const findClosestTimeSlot = (actualTime) => {
        // This is a simplified version - ideally, you would parse the actual time
        // and find the closest matching standard slot

        // For now, just try to match directly
        for (const slot of timeSlots) {
            if (slot === actualTime) return slot;
        }

        // Default to returning the actual time (will be handled in the schedule display)
        return timeSlots[0]; // Default to first slot if no match
    };

    // Simple card component to display a class
    const ClassCard = ({ classData }) => (
        <Card
            elevation={1}
            sx={{
                mb: 1,
                bgcolor: alpha(theme.palette.primary.light, 0.1),
                borderLeft: `4px solid ${theme.palette.primary.main}`,
            }}
        >
            <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                <Typography variant="body1" fontWeight="bold" sx={{ fontSize: "0.875rem" }}>
                    {classData.subject}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                    {classData.name} • {classData.teacher}
                </Typography>
                <Typography variant="caption" color="primary" sx={{ display: 'block', mt: 0.5 }}>
                    {classData.time}
                </Typography>
            </CardContent>
        </Card>
    );

    // If data is still loading, show a loading spinner
    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
                <CircularProgress />
            </Box>
        );
    }

    // If there was an error, show an error message
    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    // Check if student has any batches
    const hasBatches = studentBatches.length > 0;

    return (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
            {/* Breadcrumbs */}
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }} separator="›">
                <Link
                    underline="hover"
                    color="inherit"
                    href="/app/student/dashboard"
                    sx={{ display: "flex", alignItems: "center" }}
                >
                    <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
                    Dashboard
                </Link>
                <Typography
                    color="text.primary"
                    sx={{ display: "flex", alignItems: "center" }}
                >
                    <ScheduleIcon sx={{ mr: 0.5 }} fontSize="small" />
                    Class Schedule
                </Typography>
            </Breadcrumbs>

            {/* Page Header */}
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 2, sm: 3 },
                    mb: 3,
                    backgroundColor: (theme) => alpha(theme.palette.primary.light, 0.05),
                    borderRadius: 2,
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <ScheduleIcon sx={{ mr: 1.5, color: "primary.main" }} />
                    <Typography
                        variant="h4"
                        component="h1"
                        sx={{
                            fontSize: { xs: "1.25rem", sm: "1.5rem", md: "2rem" },
                            fontWeight: 600,
                            color: "primary.main",
                        }}
                    >
                        My Class Schedule
                    </Typography>
                </Box>
                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                >
                    View your weekly class schedule across all your batches
                </Typography>
            </Paper>

            {!hasBatches ? (
                <Alert severity="info" sx={{ mb: 3 }}>
                    You are not enrolled in any batches yet. Your schedule will appear here once you're enrolled.
                </Alert>
            ) : (
                <>
                    {/* Weekly Schedule View */}
                    {isTablet ? (
                        // Mobile/Tablet View - List format
                        <Box>
                            {weekdays.map((day) => {
                                const daySchedule = schedule[day];
                                const hasClasses = Object.values(daySchedule).some(
                                    (classes) => classes.length > 0
                                );

                                if (!hasClasses) return null;

                                return (
                                    <Card key={day} sx={{ mb: 3, borderRadius: 2 }}>
                                        <CardContent>
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    fontWeight: "bold",
                                                    mb: 2,
                                                    display: "flex",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <EventIcon sx={{ mr: 1, color: "primary.main" }} />
                                                {day}
                                            </Typography>
                                            <Divider sx={{ mb: 2 }} />

                                            {Object.entries(daySchedule).map(([timeSlot, classes]) => {
                                                if (classes.length === 0) return null;

                                                return (
                                                    <Box key={timeSlot} sx={{ mb: 2 }}>
                                                        <Typography
                                                            variant="subtitle2"
                                                            sx={{
                                                                display: "flex",
                                                                alignItems: "center",
                                                                mb: 1,
                                                                color: "text.secondary",
                                                            }}
                                                        >
                                                            <TimeIcon sx={{ mr: 1, fontSize: "1rem" }} />
                                                            {timeSlot}
                                                        </Typography>
                                                        {classes.map((classItem) => (
                                                            <ClassCard key={classItem.id} classData={classItem} />
                                                        ))}
                                                    </Box>
                                                );
                                            })}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </Box>
                    ) : (
                        // Desktop View - Table format
                        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                            <Table aria-label="schedule table">
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                                        <TableCell sx={{ fontWeight: "bold" }}>Time</TableCell>
                                        {weekdays.map((day) => (
                                            <TableCell key={day} sx={{ fontWeight: "bold" }}>
                                                {day}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {timeSlots.map((slot) => {
                                        const hasAnyClass = weekdays.some(
                                            (day) => schedule[day][slot]?.length > 0
                                        );

                                        if (!hasAnyClass) return null;

                                        return (
                                            <TableRow key={slot}>
                                                <TableCell sx={{ whiteSpace: "nowrap", fontWeight: "medium" }}>
                                                    {slot}
                                                </TableCell>
                                                {weekdays.map((day) => {
                                                    const classes = schedule[day][slot] || [];
                                                    return (
                                                        <TableCell key={`${day}-${slot}`}>
                                                            {classes.map((classItem) => (
                                                                <Box
                                                                    key={classItem.id}
                                                                    sx={{
                                                                        p: 1,
                                                                        borderRadius: 1,
                                                                        backgroundColor: alpha(
                                                                            theme.palette.primary.light,
                                                                            0.1
                                                                        ),
                                                                        mb: 1,
                                                                        borderLeft: `3px solid ${theme.palette.primary.main}`,
                                                                    }}
                                                                >
                                                                    <Typography
                                                                        variant="body2"
                                                                        sx={{ fontWeight: "bold" }}
                                                                    >
                                                                        {classItem.subject}
                                                                    </Typography>
                                                                    <Typography variant="caption" display="block">
                                                                        {classItem.name}
                                                                    </Typography>
                                                                    <Typography
                                                                        variant="caption"
                                                                        color="text.secondary"
                                                                        display="block"
                                                                    >
                                                                        {classItem.teacher}
                                                                    </Typography>
                                                                </Box>
                                                            ))}
                                                        </TableCell>
                                                    );
                                                })}
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </>
            )}
        </Box>
    );
};

export default StudentSchedule; 