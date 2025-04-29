import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Alert,
    Radio,
    RadioGroup,
    FormControlLabel,
    Snackbar,
    IconButton,
    Divider,
    Tab,
    Tabs,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format } from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchBatchAttendance,
    submitBatchAttendance,
    fetchBatchAttendanceHistory,
    fetchStudentAttendance,
    updateAttendanceRecord,
    clearSuccess,
    clearError,
} from "../../store/slices/attendanceSlice";
import {
    Check as PresentIcon,
    Close as AbsentIcon,
    AccessTime as LateIcon,
    Info as InfoIcon,
    Search as SearchIcon,
    Close as CloseIcon,
    PieChart as PieChartIcon,
} from "@mui/icons-material";
import { batchService, teacherService } from "../../services/api";

const TeacherAttendance = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const {
        batchAttendance,
        attendanceHistory,
        studentAttendance,
        loading,
        submitting,
        error,
        success,
    } = useSelector((state) => state.attendance);

    // Add a validation function for MongoDB ObjectIds
    const isValidObjectId = (id) => {
        return id && /^[0-9a-fA-F]{24}$/.test(id);
    };

    // Local state
    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState("");
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [batchesLoading, setBatchesLoading] = useState(false);
    const [tabIndex, setTabIndex] = useState(0);
    const [startDate, setStartDate] = useState(
        new Date(new Date().setDate(new Date().getDate() - 30))
    );
    const [endDate, setEndDate] = useState(new Date());
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const [historyDialog, setHistoryDialog] = useState(false);
    const [currentHistoryDate, setCurrentHistoryDate] = useState(null);
    const [currentHistoryRecords, setCurrentHistoryRecords] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState("");
    const [studentsLoading, setStudentsLoading] = useState(false);

    // Calculate the date range for attendance marking (past 2 days + today)
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    const minDate = new Date();
    minDate.setDate(today.getDate() - 2); // Two days ago
    minDate.setHours(0, 0, 0, 0); // Start of that day

    // Function to check if a date is within the allowed range
    const isDateAllowed = (date) => {
        const dateToCheck = new Date(date);
        dateToCheck.setHours(12, 0, 0, 0); // Noon to avoid timezone issues
        const minAllowed = new Date(minDate);
        minAllowed.setHours(12, 0, 0, 0);
        const maxAllowed = new Date(today);
        maxAllowed.setHours(12, 0, 0, 0);

        return dateToCheck >= minAllowed && dateToCheck <= maxAllowed;
    };

    // Function to display a date validation message
    const getDateValidationMessage = () => {
        return `You can only mark attendance for the past 2 days and today (${format(minDate, 'dd MMM yyyy')} to ${format(today, 'dd MMM yyyy')})`;
    };

    // Fetch only teacher's assigned batches
    useEffect(() => {
        const fetchTeacherBatches = async () => {
            if (!user) {
                console.error("No user available");
                return;
            }

            setBatchesLoading(true);
            try {
                // Get batches assigned to this teacher
                const response = await teacherService.getBatches();
                const fetchedBatches = response.data.data || [];
                console.log("Fetched teacher's batches:", fetchedBatches);

                // Check if batches have valid ObjectIds
                const validBatches = fetchedBatches.filter(batch => {
                    const isValid = isValidObjectId(batch._id);
                    if (!isValid) {
                        console.error("Invalid batch ObjectId:", batch._id, "for batch:", batch.name);
                    }
                    return isValid;
                });

                console.log("Valid teacher's batches count:", validBatches.length, "of", fetchedBatches.length);
                setBatches(validBatches);
            } catch (error) {
                console.error("Error fetching teacher's batches:", error);
                setBatches([]);
            } finally {
                setBatchesLoading(false);
            }
        };

        fetchTeacherBatches();
    }, [user]);

    // Handle success and error states
    useEffect(() => {
        if (success) {
            setSnackbarMessage(success);
            setSnackbarSeverity("success");
            setSnackbarOpen(true);
            dispatch(clearSuccess());
        }
        if (error) {
            setSnackbarMessage(error);
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            dispatch(clearError());
        }
    }, [success, error, dispatch]);

    // Fetch students for current batch when batch changes
    useEffect(() => {
        const fetchStudentsForBatch = async () => {
            if (!selectedBatch || !isValidObjectId(selectedBatch)) {
                setStudents([]);
                return;
            }

            setStudentsLoading(true);
            try {
                const response = await batchService.getById(selectedBatch, { populateEnrolledStudents: true });

                if (response.data && response.data.data && response.data.data.enrolledStudents) {
                    console.log("Fetched students for batch:", response.data.data.enrolledStudents);
                    setStudents(response.data.data.enrolledStudents);
                } else {
                    console.log("No students found for batch");
                    setStudents([]);
                }
            } catch (error) {
                console.error("Error fetching students:", error);
                setStudents([]);
            } finally {
                setStudentsLoading(false);
            }
        };

        fetchStudentsForBatch();
    }, [selectedBatch]);

    // Handle batch selection
    const handleBatchChange = (e) => {
        const batchId = e.target.value;
        console.log("Selected batch ID:", batchId);
        console.log("Batch ID type:", typeof batchId, "Length:", batchId.length);
        console.log("Is valid ObjectId:", isValidObjectId(batchId));

        // If empty or invalid, just update the state without API calls
        if (!batchId || !isValidObjectId(batchId)) {
            setSelectedBatch(batchId);
            return;
        }

        setSelectedBatch(batchId);
        if (tabIndex === 0) {
            const formattedDate = format(selectedDate, "yyyy-MM-dd");
            console.log("Fetching attendance with params:", { batchId, date: formattedDate });

            dispatch(
                fetchBatchAttendance({
                    batchId,
                    date: formattedDate,
                })
            );
        } else if (tabIndex === 1) {
            dispatch(
                fetchBatchAttendanceHistory({
                    batchId,
                    startDate: format(startDate, "yyyy-MM-dd"),
                    endDate: format(endDate, "yyyy-MM-dd"),
                })
            );
        }
    };

    // Handle date change with validation
    const handleDateChange = (date) => {
        // Check if date is within allowed range
        if (!isDateAllowed(date)) {
            setSnackbarMessage(getDateValidationMessage());
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        setSelectedDate(date);
        if (selectedBatch && isValidObjectId(selectedBatch)) {
            const formattedDate = format(date, "yyyy-MM-dd");
            console.log("Fetching attendance for date change:", { batchId: selectedBatch, date: formattedDate });

            dispatch(
                fetchBatchAttendance({
                    batchId: selectedBatch,
                    date: formattedDate,
                })
            );
        }
    };

    // Handle attendance status change
    const handleStatusChange = (studentId, status) => {
        dispatch(updateAttendanceRecord({ studentId, status }));
    };

    // Handle submit attendance
    const handleSubmitAttendance = () => {
        if (!selectedBatch || !isValidObjectId(selectedBatch)) {
            setSnackbarMessage("Invalid batch ID format");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        // Check if date is within allowed range
        if (!isDateAllowed(selectedDate)) {
            setSnackbarMessage(getDateValidationMessage());
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        const records = batchAttendance.map((record) => ({
            studentId: record.studentId,
            status: record.status,
            remarks: record.remarks || "",
        }));

        dispatch(
            submitBatchAttendance({
                batchId: selectedBatch,
                date: format(selectedDate, "yyyy-MM-dd"),
                records,
            })
        );
    };

    // Handle tab change
    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
        if (newValue === 1 && selectedBatch) {
            dispatch(
                fetchBatchAttendanceHistory({
                    batchId: selectedBatch,
                    startDate: format(startDate, "yyyy-MM-dd"),
                    endDate: format(endDate, "yyyy-MM-dd"),
                })
            );
        }
    };

    // Handle history date range search
    const handleHistorySearch = () => {
        if (selectedBatch && isValidObjectId(selectedBatch)) {
            dispatch(
                fetchBatchAttendanceHistory({
                    batchId: selectedBatch,
                    startDate: format(startDate, "yyyy-MM-dd"),
                    endDate: format(endDate, "yyyy-MM-dd"),
                })
            );
        } else if (selectedBatch) {
            // Show error if batch ID is invalid
            setSnackbarMessage("Invalid batch ID format");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        }
    };

    // Handle view details for a specific date
    const handleViewDateDetails = (date, records) => {
        setCurrentHistoryDate(date);
        setCurrentHistoryRecords(records);
        setHistoryDialog(true);
    };

    // Handle student selection
    const handleStudentChange = (e) => {
        const studentId = e.target.value;
        setSelectedStudent(studentId);

        if (studentId && isValidObjectId(studentId) && selectedBatch && isValidObjectId(selectedBatch)) {
            dispatch(
                fetchStudentAttendance({
                    studentId,
                    startDate: format(startDate, "yyyy-MM-dd"),
                    endDate: format(endDate, "yyyy-MM-dd"),
                    batchId: selectedBatch
                })
            );
        }
    };

    // Handle student attendance search
    const handleStudentSearch = () => {
        if (!selectedBatch || !isValidObjectId(selectedBatch)) {
            setSnackbarMessage("Please select a valid batch first");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        if (selectedStudent && isValidObjectId(selectedStudent)) {
            console.log("Searching student attendance with params:", {
                studentId: selectedStudent,
                batchId: selectedBatch,
                startDate: format(startDate, "yyyy-MM-dd"),
                endDate: format(endDate, "yyyy-MM-dd")
            });

            dispatch(
                fetchStudentAttendance({
                    studentId: selectedStudent,
                    batchId: selectedBatch,
                    startDate: format(startDate, "yyyy-MM-dd"),
                    endDate: format(endDate, "yyyy-MM-dd")
                })
            );
        } else if (selectedStudent) {
            // Show error if student ID is invalid
            setSnackbarMessage("Invalid student ID format");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        } else {
            setSnackbarMessage("Please select a student");
            setSnackbarSeverity("warning");
            setSnackbarOpen(true);
        }
    };

    // Get status icon
    const getStatusIcon = (status) => {
        switch (status) {
            case "present":
                return <PresentIcon style={{ color: "green" }} />;
            case "absent":
                return <AbsentIcon style={{ color: "red" }} />;
            case "late":
                return <LateIcon style={{ color: "orange" }} />;
            default:
                return null;
        }
    };

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>
                Attendance Management
            </Typography>

            {/* Debug info */}
            {batchesLoading ? (
                <Alert severity="info">Loading teacher's batches...</Alert>
            ) : batches.length > 0 ? (
                <Alert severity="success" sx={{ mb: 2 }}>
                    Found {batches.length} batches assigned to you
                </Alert>
            ) : (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    No batches found assigned to you. Please contact an administrator.
                </Alert>
            )}

            <Paper sx={{ p: 3, mb: 3 }}>
                <FormControl fullWidth margin="normal">
                    <InputLabel>Select Batch</InputLabel>
                    <Select
                        value={selectedBatch}
                        onChange={handleBatchChange}
                        disabled={batchesLoading}
                    >
                        <MenuItem value="">
                            <em>Select a batch</em>
                        </MenuItem>
                        {batches.map((batch) => (
                            <MenuItem key={batch._id} value={batch._id}>
                                {batch.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Tabs
                    value={tabIndex}
                    onChange={handleTabChange}
                    indicatorColor="primary"
                    textColor="primary"
                    sx={{ mt: 2, mb: 3 }}
                >
                    <Tab label="Mark Attendance" />
                    <Tab label="Batch History" />
                    <Tab label="Student-wise" />
                </Tabs>

                {tabIndex === 0 ? (
                    <Box>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                label="Select Date"
                                value={selectedDate}
                                onChange={handleDateChange}
                                renderInput={(params) => <TextField {...params} fullWidth />}
                                maxDate={today}
                                minDate={minDate}
                                shouldDisableDate={(date) => !isDateAllowed(date)}
                                onError={(error) => {
                                    if (error) {
                                        setSnackbarMessage(getDateValidationMessage());
                                        setSnackbarSeverity("warning");
                                        setSnackbarOpen(true);
                                    }
                                }}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                {getDateValidationMessage()}
                            </Typography>
                        </LocalizationProvider>

                        {loading ? (
                            <Box
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                                my={4}
                            >
                                <CircularProgress />
                            </Box>
                        ) : selectedBatch && batchAttendance.length > 0 ? (
                            <Box mt={4}>
                                <Typography variant="h6" gutterBottom>
                                    Mark Attendance for {format(selectedDate, "dd MMMM yyyy")}
                                </Typography>
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell width="40%">Student Name</TableCell>
                                                <TableCell width="60%">Status</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {batchAttendance.map((record) => (
                                                <TableRow key={record.studentId}>
                                                    <TableCell>{record.studentName}</TableCell>
                                                    <TableCell>
                                                        <RadioGroup
                                                            row
                                                            value={record.status}
                                                            onChange={(e) =>
                                                                handleStatusChange(
                                                                    record.studentId,
                                                                    e.target.value
                                                                )
                                                            }
                                                        >
                                                            <FormControlLabel
                                                                value="present"
                                                                control={<Radio color="success" />}
                                                                label="Present"
                                                            />
                                                            <FormControlLabel
                                                                value="absent"
                                                                control={<Radio color="error" />}
                                                                label="Absent"
                                                            />
                                                            <FormControlLabel
                                                                value="late"
                                                                control={<Radio color="warning" />}
                                                                label="Late"
                                                            />
                                                        </RadioGroup>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                                <Box mt={3} display="flex" justifyContent="flex-end">
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleSubmitAttendance}
                                        disabled={submitting}
                                    >
                                        {submitting ? (
                                            <CircularProgress size={24} color="inherit" />
                                        ) : (
                                            "Save Attendance"
                                        )}
                                    </Button>
                                </Box>
                            </Box>
                        ) : selectedBatch ? (
                            <Alert severity="info" sx={{ mt: 3 }}>
                                No student records found for this batch.
                            </Alert>
                        ) : (
                            <Alert severity="info" sx={{ mt: 3 }}>
                                Please select a batch and date to mark attendance.
                            </Alert>
                        )}
                    </Box>
                ) : tabIndex === 1 ? (
                    <Box>
                        <Box display="flex" gap={2} mb={3}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    label="Start Date"
                                    value={startDate}
                                    onChange={setStartDate}
                                    renderInput={(params) => <TextField {...params} fullWidth />}
                                    maxDate={endDate}
                                />
                            </LocalizationProvider>

                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    label="End Date"
                                    value={endDate}
                                    onChange={setEndDate}
                                    renderInput={(params) => <TextField {...params} fullWidth />}
                                    minDate={startDate}
                                    maxDate={new Date()}
                                />
                            </LocalizationProvider>

                            <Button
                                variant="contained"
                                onClick={handleHistorySearch}
                                disabled={!selectedBatch || loading}
                                startIcon={<SearchIcon />}
                            >
                                Search
                            </Button>
                        </Box>

                        {loading ? (
                            <Box
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                                my={4}
                            >
                                <CircularProgress />
                            </Box>
                        ) : selectedBatch && attendanceHistory.length > 0 ? (
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Date</TableCell>
                                            <TableCell>Present</TableCell>
                                            <TableCell>Absent</TableCell>
                                            <TableCell>Late</TableCell>
                                            <TableCell>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {attendanceHistory.map((item) => {
                                            const presentCount = item.records.filter(
                                                (r) => r.status === "present"
                                            ).length;
                                            const absentCount = item.records.filter(
                                                (r) => r.status === "absent"
                                            ).length;
                                            const lateCount = item.records.filter(
                                                (r) => r.status === "late"
                                            ).length;

                                            return (
                                                <TableRow key={item.date}>
                                                    <TableCell>
                                                        {format(new Date(item.date), "dd MMM yyyy")}
                                                    </TableCell>
                                                    <TableCell>{presentCount}</TableCell>
                                                    <TableCell>{absentCount}</TableCell>
                                                    <TableCell>{lateCount}</TableCell>
                                                    <TableCell>
                                                        <Button
                                                            startIcon={<InfoIcon />}
                                                            onClick={() =>
                                                                handleViewDateDetails(item.date, item.records)
                                                            }
                                                        >
                                                            Details
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : selectedBatch ? (
                            <Alert severity="info">
                                No attendance records found for the selected date range.
                            </Alert>
                        ) : (
                            <Alert severity="info">
                                Please select a batch and date range to view attendance history.
                            </Alert>
                        )}
                    </Box>
                ) : (
                    <Box>
                        <FormControl fullWidth margin="normal" disabled={!selectedBatch || studentsLoading}>
                            <InputLabel>Select Student</InputLabel>
                            <Select
                                value={selectedStudent}
                                onChange={handleStudentChange}
                                disabled={!selectedBatch || studentsLoading}
                            >
                                <MenuItem value="">
                                    <em>Select a student</em>
                                </MenuItem>
                                {students.map((student) => (
                                    <MenuItem key={student._id} value={student._id}>
                                        {student.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Box display="flex" gap={2} mb={3} mt={3}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    label="Start Date"
                                    value={startDate}
                                    onChange={setStartDate}
                                    renderInput={(params) => <TextField {...params} fullWidth />}
                                    maxDate={endDate}
                                />
                            </LocalizationProvider>

                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    label="End Date"
                                    value={endDate}
                                    onChange={setEndDate}
                                    renderInput={(params) => <TextField {...params} fullWidth />}
                                    minDate={startDate}
                                    maxDate={new Date()}
                                />
                            </LocalizationProvider>

                            <Button
                                variant="contained"
                                onClick={handleStudentSearch}
                                disabled={!selectedStudent || loading}
                                startIcon={<SearchIcon />}
                            >
                                Search
                            </Button>
                        </Box>

                        {loading ? (
                            <Box
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                                my={4}
                            >
                                <CircularProgress />
                            </Box>
                        ) : selectedStudent && studentAttendance ? (
                            <Box mt={3}>
                                <Typography variant="h6" gutterBottom>
                                    Attendance Summary for {studentAttendance.student.name}
                                </Typography>

                                {/* Attendance Statistics Summary */}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        gap: 2,
                                        flexWrap: 'wrap',
                                        mb: 4,
                                        mt: 2
                                    }}
                                >
                                    <Paper
                                        sx={{
                                            p: 2,
                                            flex: '1 1 200px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            bgcolor: 'success.light'
                                        }}
                                    >
                                        <Typography variant="h6">Present</Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                            <PresentIcon color="success" sx={{ mr: 1 }} />
                                            <Typography variant="h4">
                                                {studentAttendance.statistics.presentPercentage}%
                                            </Typography>
                                        </Box>
                                    </Paper>

                                    <Paper
                                        sx={{
                                            p: 2,
                                            flex: '1 1 200px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            bgcolor: 'error.light'
                                        }}
                                    >
                                        <Typography variant="h6">Absent</Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                            <AbsentIcon color="error" sx={{ mr: 1 }} />
                                            <Typography variant="h4">
                                                {studentAttendance.statistics.absentPercentage}%
                                            </Typography>
                                        </Box>
                                    </Paper>

                                    <Paper
                                        sx={{
                                            p: 2,
                                            flex: '1 1 200px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            bgcolor: 'warning.light'
                                        }}
                                    >
                                        <Typography variant="h6">Late</Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                            <LateIcon color="warning" sx={{ mr: 1 }} />
                                            <Typography variant="h4">
                                                {studentAttendance.statistics.latePercentage}%
                                            </Typography>
                                        </Box>
                                    </Paper>

                                    <Paper
                                        sx={{
                                            p: 2,
                                            flex: '1 1 200px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            bgcolor: 'info.light'
                                        }}
                                    >
                                        <Typography variant="h6">Total Classes</Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                            <PieChartIcon color="info" sx={{ mr: 1 }} />
                                            <Typography variant="h4">
                                                {studentAttendance.statistics.totalClasses}
                                            </Typography>
                                        </Box>
                                    </Paper>
                                </Box>

                                {/* Monthly Breakdown */}
                                {studentAttendance.statistics.monthlyBreakdown.length > 0 && (
                                    <Box mt={4}>
                                        <Typography variant="h6" gutterBottom>
                                            Monthly Breakdown
                                        </Typography>
                                        <TableContainer>
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Month</TableCell>
                                                        <TableCell>Present</TableCell>
                                                        <TableCell>Absent</TableCell>
                                                        <TableCell>Late</TableCell>
                                                        <TableCell>Total Classes</TableCell>
                                                        <TableCell>Attendance %</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {studentAttendance.statistics.monthlyBreakdown.map((month) => (
                                                        <TableRow key={month.month}>
                                                            <TableCell>
                                                                {new Date(month.month + "-01").toLocaleString('default', { month: 'long', year: 'numeric' })}
                                                            </TableCell>
                                                            <TableCell>{month.present}</TableCell>
                                                            <TableCell>{month.absent}</TableCell>
                                                            <TableCell>{month.late}</TableCell>
                                                            <TableCell>{month.total}</TableCell>
                                                            <TableCell>
                                                                <Typography
                                                                    color={
                                                                        month.presentPercentage >= 75
                                                                            ? "success.main"
                                                                            : month.presentPercentage >= 60
                                                                                ? "warning.main"
                                                                                : "error.main"
                                                                    }
                                                                    fontWeight="bold"
                                                                >
                                                                    {month.presentPercentage}%
                                                                </Typography>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Box>
                                )}

                                {/* Detailed Attendance Records */}
                                {studentAttendance.records.length > 0 && (
                                    <Box mt={4}>
                                        <Typography variant="h6" gutterBottom>
                                            Detailed Attendance Records
                                        </Typography>
                                        <TableContainer>
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Date</TableCell>
                                                        <TableCell>Batch</TableCell>
                                                        <TableCell>Status</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {studentAttendance.records.map((record) => (
                                                        <TableRow key={record._id}>
                                                            <TableCell>
                                                                {format(new Date(record.date), "dd MMM yyyy")}
                                                            </TableCell>
                                                            <TableCell>{record.batchName}</TableCell>
                                                            <TableCell>
                                                                <Box display="flex" alignItems="center">
                                                                    {getStatusIcon(record.status)}
                                                                    <Typography sx={{ ml: 1 }} variant="body2">
                                                                        {record.status.charAt(0).toUpperCase() +
                                                                            record.status.slice(1)}
                                                                    </Typography>
                                                                </Box>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Box>
                                )}
                            </Box>
                        ) : selectedStudent ? (
                            <Alert severity="info">
                                No attendance records found for the selected student in the given date range.
                            </Alert>
                        ) : (
                            <Alert severity="info">
                                Please select a batch and then a student to view attendance records.
                            </Alert>
                        )}
                    </Box>
                )}
            </Paper>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                message={snackbarMessage}
                action={
                    <IconButton
                        size="small"
                        color="inherit"
                        onClick={() => setSnackbarOpen(false)}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                }
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            />

            {/* Dialog for viewing attendance details */}
            <Dialog
                open={historyDialog}
                onClose={() => setHistoryDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Attendance for {currentHistoryDate
                        ? format(new Date(currentHistoryDate), "dd MMMM yyyy")
                        : ""}
                </DialogTitle>
                <DialogContent>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Student Name</TableCell>
                                    <TableCell>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {currentHistoryRecords.map((record) => (
                                    <TableRow key={record.studentId}>
                                        <TableCell>{record.studentName}</TableCell>
                                        <TableCell>
                                            <Box display="flex" alignItems="center">
                                                {getStatusIcon(record.status)}
                                                <Typography sx={{ ml: 1 }} variant="body2">
                                                    {record.status.charAt(0).toUpperCase() +
                                                        record.status.slice(1)}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setHistoryDialog(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TeacherAttendance;