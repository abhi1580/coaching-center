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
    Badge,
    Button,
    IconButton,
    Tooltip,
} from "@mui/material";
import {
    Schedule as ScheduleIcon,
    Event as EventIcon,
    AccessTime as TimeIcon,
    School as SchoolIcon,
    Book as BookIcon,
    Home as HomeIcon,
    Today as TodayIcon,
    CalendarMonth as CalendarIcon,
    Person as PersonIcon,
    Room as RoomIcon,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { studentService } from "../../services/api";
import { format } from 'date-fns';

// Define time slots with proper format for easier matching
const timeSlots = [
    { display: "8:00 AM - 9:00 AM", start: "8:00 AM", end: "9:00 AM" },
    { display: "9:00 AM - 10:00 AM", start: "9:00 AM", end: "10:00 AM" },
    { display: "10:00 AM - 11:00 AM", start: "10:00 AM", end: "11:00 AM" },
    { display: "11:00 AM - 12:00 PM", start: "11:00 AM", end: "12:00 PM" },
    { display: "12:00 PM - 1:00 PM", start: "12:00 PM", end: "1:00 PM" },
    { display: "1:00 PM - 2:00 PM", start: "1:00 PM", end: "2:00 PM" },
    { display: "2:00 PM - 3:00 PM", start: "2:00 PM", end: "3:00 PM" },
    { display: "3:00 PM - 4:00 PM", start: "3:00 PM", end: "4:00 PM" },
    { display: "4:00 PM - 5:00 PM", start: "4:00 PM", end: "5:00 PM" },
    { display: "5:00 PM - 6:00 PM", start: "5:00 PM", end: "6:00 PM" },
    { display: "6:00 PM - 7:00 PM", start: "6:00 PM", end: "7:00 PM" },
    { display: "7:00 PM - 8:00 PM", start: "7:00 PM", end: "8:00 PM" },
];

// Define color constants to replace CSS variables
const ACCENT_YELLOW = "#ffbf00";
const DARK_YELLOW = "#e49b0f";
const PRIMARY_BLUE = "#007eff";
const DARK_BLUE = "#2400ff";
const BG_LIGHT_GRAY = "#f8f9fa";
const TEXT_DARK = "#343a40";
const TEXT_SECONDARY = "#6c757d";

const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Get the current day of the week
const getCurrentDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
};

const StudentSchedule = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const isTablet = useMediaQuery(theme.breakpoints.down("md"));
    const { user } = useSelector((state) => state.auth);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [schedule, setSchedule] = useState({});
    const [studentBatches, setStudentBatches] = useState([]);
    const [currentView, setCurrentView] = useState("week"); // "week" or "day"
    const [selectedDay, setSelectedDay] = useState(getCurrentDay());
    const [dayHasClasses, setDayHasClasses] = useState({});

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                setLoading(true);
                // First get student batches
                const studentData = await studentService.getStudentDetails();

                if (!studentData?.data?.data) {
                    throw new Error("Failed to fetch student data");
                }

                const batchesData = studentData.data.data.batches || [];
                // Debug the batch structure
                debugBatchStructure(batchesData);
                setStudentBatches(batchesData);

                // Create schedule from batch data
                const { scheduleData, classesByDay } = organizeSchedule(batchesData);
                setSchedule(scheduleData);
                setDayHasClasses(classesByDay);

                // If current day has no classes, find first day that does
                if (!classesByDay[selectedDay] && Object.keys(classesByDay).length > 0) {
                    setSelectedDay(Object.keys(classesByDay)[0]);
                }

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

    // Debug helper function
    const debugBatchStructure = (batches) => {
        console.log("Number of batches:", batches.length);
        batches.forEach((batch, index) => {
            console.log(`Batch ${index + 1} - ${batch.name}:`, batch);
            console.log(`  - Schedule:`, batch.schedule);

            if (batch.schedule) {
                console.log(`    - Days:`, batch.schedule.days);
                console.log(`    - Start Time:`, batch.schedule.startTime);
                console.log(`    - End Time:`, batch.schedule.endTime);
            }

            console.log(`  - Subject:`, batch.subject);
            console.log(`  - Teacher:`, batch.teacher);
        });
    };

    // Function to organize batch data into a schedule format
    const organizeSchedule = (batches) => {
        console.log("Raw batches for schedule organization:", batches);

        // Prepare an empty schedule
        const scheduleMatrix = {};
        const classesByDay = {};

        weekdays.forEach(day => {
            scheduleMatrix[day] = {};
            timeSlots.forEach(slot => {
                scheduleMatrix[day][slot.display] = [];
            });
        });

        // Fill the schedule with batch data
        batches.forEach(batch => {
            console.log(`Processing batch ${batch.name}:`, batch);

            // Handle potentially different schedule structures
            if (batch.schedule) {
                console.log("  Schedule structure:", batch.schedule);

                // Case 1: New structure - schedule has days array
                if (batch.schedule.days && Array.isArray(batch.schedule.days)) {
                    console.log("  Using days array structure");
                    batch.schedule.days.forEach(day => {
                        if (!day || !weekdays.includes(day)) return;

                        // Mark this day as having classes
                        classesByDay[day] = true;

                        const startTime = batch.schedule.startTime;
                        const endTime = batch.schedule.endTime;

                        // Format times in AM/PM format
                        const formattedStartTime = formatTimeForComparison(startTime);
                        const formattedEndTime = formatTimeForComparison(endTime);
                        const timeSlot = `${formattedStartTime} - ${formattedEndTime}`;

                        // Find the closest standard time slot
                        const matchedSlot = findClosestTimeSlot(startTime, endTime);

                        if (matchedSlot) {
                            scheduleMatrix[day][matchedSlot].push({
                                id: batch._id,
                                name: batch.name,
                                subject: batch.subject?.name || 'Unknown Subject',
                                teacher: batch.teacher?.name || 'Unknown Teacher',
                                time: timeSlot,
                                actualSlot: matchedSlot,
                                room: batch.schedule.room || "TBD",
                                description: batch.description || "",
                                standard: batch.standard?.name || "",
                            });
                        }
                    });
                }
                // Case 2: Old structure - schedule is an array of session objects
                else if (Array.isArray(batch.schedule)) {
                    console.log("  Using array of sessions structure");
                    batch.schedule.forEach(session => {
                        const day = session.day;
                        if (!day || !weekdays.includes(day)) return;

                        // Mark this day as having classes
                        classesByDay[day] = true;

                        const startTime = session.startTime;
                        const endTime = session.endTime;

                        // Format times in AM/PM format
                        const formattedStartTime = formatTimeForComparison(startTime);
                        const formattedEndTime = formatTimeForComparison(endTime);
                        const timeSlot = `${formattedStartTime} - ${formattedEndTime}`;

                        // Find the closest standard time slot
                        const matchedSlot = findClosestTimeSlot(startTime, endTime);

                        if (matchedSlot) {
                            scheduleMatrix[day][matchedSlot].push({
                                id: batch._id,
                                name: batch.name,
                                subject: batch.subject?.name || 'Unknown Subject',
                                teacher: batch.teacher?.name || 'Unknown Teacher',
                                time: timeSlot,
                                actualSlot: matchedSlot,
                                room: session.room || "TBD",
                                description: batch.description || "",
                                standard: batch.standard?.name || "",
                            });
                        }
                    });
                }
                // Neither structure found - log for debugging
                else {
                    console.warn("  Unknown schedule structure for batch:", batch.name);
                }
            } else {
                console.warn("  No schedule data for batch:", batch.name);
            }
        });

        console.log("Organized schedule:", scheduleMatrix);
        console.log("Days with classes:", classesByDay);

        return { scheduleData: scheduleMatrix, classesByDay };
    };

    // Improved helper function to find the closest standard time slot
    const findClosestTimeSlot = (startTime, endTime) => {
        if (!startTime) return timeSlots[0].display;

        console.log(`Finding time slot match for: ${startTime} - ${endTime}`);

        // Format the time to ensure consistency
        const formattedStartTime = formatTimeForComparison(startTime);
        const formattedEndTime = formatTimeForComparison(endTime);

        console.log(`Formatted time: ${formattedStartTime} - ${formattedEndTime}`);

        // Try to match exactly first
        for (const slot of timeSlots) {
            const slotStartFormatted = formatTimeForComparison(slot.start);
            if (formattedStartTime === slotStartFormatted) {
                console.log(`  Exact match found: ${slot.display}`);
                return slot.display;
            }
        }

        // If no exact match, find the closest slot by converting to minutes
        const startMinutes = timeToMinutes(formattedStartTime);
        let closestSlot = timeSlots[0];
        let minDifference = Math.abs(startMinutes - timeToMinutes(formatTimeForComparison(closestSlot.start)));

        for (const slot of timeSlots) {
            const slotMinutes = timeToMinutes(formatTimeForComparison(slot.start));
            const difference = Math.abs(startMinutes - slotMinutes);

            if (difference < minDifference) {
                minDifference = difference;
                closestSlot = slot;
            }
        }

        console.log(`  Closest match: ${closestSlot.display}`);

        // If still no good match, just return the custom formatted time
        if (minDifference > 30) { // If difference is more than 30 minutes
            const customSlot = `${formattedStartTime} - ${formattedEndTime}`;
            console.log(`  Using custom slot: ${customSlot}`);
            return customSlot;
        }

        return closestSlot.display;
    };

    // Helper function to format time strings consistently
    const formatTimeForComparison = (timeStr) => {
        if (!timeStr) return '';

        // If already in 12-hour format with AM/PM, standardize formatting
        if (timeStr.toLowerCase().includes('am') || timeStr.toLowerCase().includes('pm')) {
            // Extract time parts
            const [timePart, period] = timeStr.split(/\s+/);
            const [hours, minutes] = timePart.split(':').map(Number);

            // Format properly with padding for single-digit hours
            const formattedHours = hours.toString();
            const formattedMinutes = minutes.toString().padStart(2, '0');
            const formattedPeriod = period.toUpperCase();

            return `${formattedHours}:${formattedMinutes} ${formattedPeriod}`;
        }

        // If in 24-hour format (HH:MM)
        if (timeStr.includes(':')) {
            try {
                const [hours, minutes] = timeStr.split(':').map(Number);

                if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
                    const period = hours >= 12 ? 'PM' : 'AM';
                    const hours12 = hours % 12 || 12; // Convert 0 to 12 for 12 AM
                    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
                }
            } catch (e) {
                console.warn('Error parsing time:', timeStr, e);
            }
        }

        // Return original if can't parse
        return timeStr;
    };

    // Function to convert time to minutes for comparison
    const timeToMinutes = (time) => {
        if (!time) return 0;

        // Handle 12-hour format (e.g., "9:30 AM")
        if (time.includes('AM') || time.includes('PM')) {
            const [timePart, period] = time.trim().split(' ');
            let [hours, minutes] = timePart.split(':').map(Number);

            if (period === 'PM' && hours !== 12) {
                hours += 12;
            } else if (period === 'AM' && hours === 12) {
                hours = 0;
            }

            return hours * 60 + minutes;
        }

        // Handle 24-hour format (e.g., "14:30")
        if (time.includes(':')) {
            const [hours, minutes] = time.split(':').map(Number);
            return hours * 60 + minutes;
        }

        // If can't parse, return 0
        console.warn('Unable to parse time to minutes:', time);
        return 0;
    };

    // Simple card component to display a class
    const ClassCard = ({ classData }) => (
        <Card
            elevation={1}
            sx={{
                mb: 1,
                bgcolor: BG_LIGHT_GRAY,
                borderLeft: `4px solid ${PRIMARY_BLUE}`,
                transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                }
            }}
        >
            <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                <Typography variant="body1" fontWeight="bold" sx={{ fontSize: "0.875rem", color: PRIMARY_BLUE }}>
                    {classData.subject}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: "0.75rem", display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <SchoolIcon fontSize="inherit" sx={{ mr: 0.5, color: TEXT_SECONDARY }} />
                    {classData.name}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: "0.75rem", display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <PersonIcon fontSize="inherit" sx={{ mr: 0.5, color: TEXT_SECONDARY }} />
                    {classData.teacher}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', color: "text.secondary" }}>
                        <TimeIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                        {classData.time}
                    </Typography>
                    {classData.room && (
                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', color: "text.secondary" }}>
                            <RoomIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                            {classData.room}
                        </Typography>
                    )}
                </Box>
            </CardContent>
        </Card>
    );

    // Handle day change for day view
    const handleDayChange = (day) => {
        setSelectedDay(day);
        setCurrentView("day");
    };

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
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    // Check if student has any batches
    const hasBatches = studentBatches.length > 0;
    // Get today's date for header
    const today = format(new Date(), 'EEEE, MMMM d, yyyy');

    return (
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
            {/* Breadcrumbs */}
            <Breadcrumbs
                sx={{ mb: 2 }}
                separator="›"
                aria-label="breadcrumb"
            >
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
                    backgroundImage: "linear-gradient(120deg, #fdfbfb 0%, #ebedee 100%)",
                    borderRadius: 2,
                    borderLeft: `4px solid ${PRIMARY_BLUE}`,
                }}
            >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1, flexWrap: "wrap" }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        <ScheduleIcon sx={{ mr: 1.5, color: PRIMARY_BLUE, fontSize: 30 }} />
                        <Box>
                            <Typography
                                variant="h4"
                                component="h1"
                                sx={{
                                    fontSize: { xs: "1.25rem", sm: "1.5rem", md: "1.75rem" },
                                    fontWeight: 600,
                                    color: TEXT_DARK,
                                }}
                            >
                                My Class Schedule
                            </Typography>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                            >
                                {today}
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ display: "flex", gap: 1, mt: { xs: 2, sm: 0 } }}>
                        <Button
                            startIcon={<CalendarIcon />}
                            variant={currentView === "week" ? "contained" : "outlined"}
                            size="small"
                            onClick={() => setCurrentView("week")}
                            sx={{
                                backgroundColor: currentView === "week" ? PRIMARY_BLUE : "transparent",
                                color: currentView === "week" ? "white" : "text.primary",
                                "&:hover": {
                                    backgroundColor: currentView === "week" ? DARK_BLUE : alpha(PRIMARY_BLUE, 0.1),
                                }
                            }}
                        >
                            Week View
                        </Button>
                        <Button
                            startIcon={<TodayIcon />}
                            variant={currentView === "day" ? "contained" : "outlined"}
                            size="small"
                            onClick={() => {
                                setCurrentView("day");
                                // If current day has no classes, keep the selected day
                            }}
                            sx={{
                                backgroundColor: currentView === "day" ? PRIMARY_BLUE : "transparent",
                                color: currentView === "day" ? "white" : "text.primary",
                                "&:hover": {
                                    backgroundColor: currentView === "day" ? DARK_BLUE : alpha(PRIMARY_BLUE, 0.1),
                                }
                            }}
                        >
                            Day View
                        </Button>
                    </Box>
                </Box>
            </Paper>

            {/* Day selection tabs for mobile/tablet view in day mode */}
            {currentView === "day" && (
                <Box sx={{
                    overflowX: "auto",
                    mb: 2,
                    pb: 1,
                    display: "flex",
                    gap: 1,
                }}>
                    {weekdays.map((day) => (
                        <Chip
                            key={day}
                            label={day}
                            onClick={() => setSelectedDay(day)}
                            variant={selectedDay === day ? "filled" : "outlined"}
                            color={selectedDay === day ? "primary" : "default"}
                            disabled={!dayHasClasses[day]}
                            icon={day === getCurrentDay() ? <TodayIcon /> : null}
                            sx={{
                                opacity: dayHasClasses[day] ? 1 : 0.5,
                                backgroundColor: selectedDay === day ? PRIMARY_BLUE : "transparent",
                                color: selectedDay === day ? "white" : dayHasClasses[day] ? "text.primary" : "text.disabled",
                                fontWeight: selectedDay === day ? 600 : 400,
                            }}
                        />
                    ))}
                </Box>
            )}

            {!hasBatches ? (
                <Alert severity="info" sx={{ mb: 3 }}>
                    You are not enrolled in any batches yet. Your schedule will appear here once you're enrolled.
                </Alert>
            ) : (
                <>
                    {/* Day View */}
                    {currentView === "day" && (
                        <Card sx={{ mb: 3, borderRadius: 2 }}>
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
                                    <EventIcon sx={{ mr: 1, color: PRIMARY_BLUE }} />
                                    {selectedDay}
                                    {selectedDay === getCurrentDay() && (
                                        <Chip
                                            label="Today"
                                            size="small"
                                            color="primary"
                                            sx={{
                                                ml: 1,
                                                fontWeight: 500,
                                                backgroundColor: alpha(PRIMARY_BLUE, 0.15),
                                                color: PRIMARY_BLUE,
                                                border: `1px solid ${PRIMARY_BLUE}`,
                                            }}
                                        />
                                    )}
                                </Typography>
                                <Divider sx={{ mb: 2 }} />

                                {!dayHasClasses[selectedDay] ? (
                                    <Alert severity="info" sx={{ mb: 3 }}>
                                        No classes scheduled for {selectedDay}.
                                    </Alert>
                                ) : (
                                    <>
                                        {Object.entries(schedule[selectedDay] || {}).map(([timeSlot, classes]) => {
                                            if (!classes || classes.length === 0) return null;

                                            return (
                                                <Box key={timeSlot} sx={{ mb: 2 }}>
                                                    <Typography
                                                        variant="subtitle2"
                                                        sx={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            mb: 1,
                                                            color: "text.secondary",
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        <TimeIcon sx={{ mr: 1, fontSize: "1rem", color: PRIMARY_BLUE }} />
                                                        {timeSlot}
                                                    </Typography>
                                                    {classes.map((classItem) => (
                                                        <ClassCard key={classItem.id} classData={classItem} />
                                                    ))}
                                                </Box>
                                            );
                                        })}
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Weekly View */}
                    {currentView === "week" && (
                        <>
                            {isTablet ? (
                                // Mobile/Tablet View - List format
                                <Box>
                                    {weekdays.map((day) => {
                                        const daySchedule = schedule[day];
                                        const hasClasses = dayHasClasses[day];

                                        if (!hasClasses) return null;

                                        return (
                                            <Card
                                                key={day}
                                                sx={{
                                                    mb: 3,
                                                    borderRadius: 2,
                                                    ...(day === getCurrentDay() ? {
                                                        border: `1px solid ${PRIMARY_BLUE}`,
                                                        boxShadow: `0 0 10px ${alpha(PRIMARY_BLUE, 0.3)}`,
                                                    } : {})
                                                }}
                                            >
                                                <CardContent>
                                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                        <Typography
                                                            variant="h6"
                                                            sx={{
                                                                fontWeight: "bold",
                                                                mb: 2,
                                                                display: "flex",
                                                                alignItems: "center",
                                                            }}
                                                        >
                                                            <EventIcon sx={{ mr: 1, color: PRIMARY_BLUE }} />
                                                            {day}
                                                        </Typography>

                                                        {day === getCurrentDay() && (
                                                            <Chip
                                                                label="Today"
                                                                size="small"
                                                                color="primary"
                                                                sx={{
                                                                    fontWeight: 500,
                                                                    backgroundColor: alpha(PRIMARY_BLUE, 0.15),
                                                                    color: PRIMARY_BLUE,
                                                                    border: `1px solid ${PRIMARY_BLUE}`,
                                                                }}
                                                            />
                                                        )}
                                                    </Box>
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
                                                                        fontWeight: 600,
                                                                    }}
                                                                >
                                                                    <TimeIcon sx={{ mr: 1, fontSize: "1rem", color: PRIMARY_BLUE }} />
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
                                // Desktop View - Table format with improved styling
                                <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: "hidden" }}>
                                    <Table aria-label="schedule table">
                                        <TableHead>
                                            <TableRow sx={{ backgroundColor: alpha(PRIMARY_BLUE, 0.05) }}>
                                                <TableCell sx={{ fontWeight: "bold", width: "15%" }}>Time</TableCell>
                                                {weekdays.map((day) => (
                                                    <TableCell
                                                        key={day}
                                                        sx={{
                                                            fontWeight: "bold",
                                                            ...(day === getCurrentDay() ? {
                                                                backgroundColor: alpha(PRIMARY_BLUE, 0.1),
                                                                borderBottom: `2px solid ${PRIMARY_BLUE}`,
                                                            } : {})
                                                        }}
                                                    >
                                                        <Box sx={{ display: "flex", alignItems: "center" }}>
                                                            {day}
                                                            {day === getCurrentDay() && (
                                                                <Chip
                                                                    label="Today"
                                                                    size="small"
                                                                    sx={{
                                                                        ml: 1,
                                                                        height: "20px",
                                                                        fontSize: "0.7rem",
                                                                        fontWeight: 500,
                                                                        backgroundColor: alpha(PRIMARY_BLUE, 0.15),
                                                                        color: PRIMARY_BLUE,
                                                                        border: `1px solid ${PRIMARY_BLUE}`,
                                                                    }}
                                                                />
                                                            )}
                                                        </Box>
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {timeSlots.map((slot) => {
                                                const hasAnyClass = weekdays.some(
                                                    (day) => schedule[day][slot.display]?.length > 0
                                                );

                                                if (!hasAnyClass) return null;

                                                return (
                                                    <TableRow key={slot.display} hover>
                                                        <TableCell sx={{ whiteSpace: "nowrap", fontWeight: "medium", color: "text.secondary" }}>
                                                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                                                <TimeIcon sx={{ mr: 1, fontSize: "1rem", color: PRIMARY_BLUE }} />
                                                                {slot.display}
                                                            </Box>
                                                        </TableCell>

                                                        {weekdays.map((day) => {
                                                            const classes = schedule[day][slot.display] || [];
                                                            const isToday = day === getCurrentDay();

                                                            return (
                                                                <TableCell
                                                                    key={`${day}-${slot.display}`}
                                                                    sx={{
                                                                        ...(isToday ? {
                                                                            backgroundColor: alpha(PRIMARY_BLUE, 0.05),
                                                                        } : {})
                                                                    }}
                                                                >
                                                                    {classes.map((classItem) => (
                                                                        <Box
                                                                            key={classItem.id}
                                                                            sx={{
                                                                                p: 1.5,
                                                                                borderRadius: 1,
                                                                                backgroundColor: BG_LIGHT_GRAY,
                                                                                mb: 1,
                                                                                borderLeft: `3px solid ${PRIMARY_BLUE}`,
                                                                                transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                                                                                "&:hover": {
                                                                                    transform: "translateY(-3px)",
                                                                                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                                                                                }
                                                                            }}
                                                                        >
                                                                            <Typography
                                                                                variant="body2"
                                                                                sx={{ fontWeight: "bold", color: PRIMARY_BLUE }}
                                                                            >
                                                                                {classItem.subject}
                                                                            </Typography>
                                                                            <Typography variant="caption" display="block">
                                                                                {classItem.name}
                                                                            </Typography>
                                                                            <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
                                                                                <Typography variant="caption" sx={{ display: "flex", alignItems: "center", mr: 1 }}>
                                                                                    <PersonIcon sx={{ fontSize: "0.8rem", mr: 0.5 }} />
                                                                                    {classItem.teacher}
                                                                                </Typography>

                                                                                {classItem.room && (
                                                                                    <Typography variant="caption" sx={{ display: "flex", alignItems: "center" }}>
                                                                                        <RoomIcon sx={{ fontSize: "0.8rem", mr: 0.5 }} />
                                                                                        {classItem.room}
                                                                                    </Typography>
                                                                                )}
                                                                            </Box>
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
                </>
            )}
        </Box>
    );
};

export default StudentSchedule; 