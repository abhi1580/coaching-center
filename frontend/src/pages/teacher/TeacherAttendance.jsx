import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  useTheme,
  alpha,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  Card,
  CardContent,
  Grid,
  InputAdornment,
  Snackbar,
  Stack,
} from "@mui/material";
import {
  Save as SaveIcon,
  CalendarToday as CalendarIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  History as HistoryIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { format } from "date-fns";

// Import Redux actions
import {
  fetchBatchAttendance,
  submitBatchAttendance,
  fetchStudentAttendance,
  clearSuccess,
  clearError,
} from "../../store/slices/attendanceSlice";

// Create a much simpler notification system
const useNotification = () => {
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "info"
  });
  
  // Add reference to track if a specific notification was already shown
  const shownNotifications = useRef(new Set());

  // Only show one notification at a time - no complex timeouts
  const showNotification = useCallback((message, severity = "info", uniqueId = null) => {
    // If this is a unique notification and we've already shown it, don't show again
    if (uniqueId && shownNotifications.current.has(uniqueId)) {
      return;
    }
    
    // Always close first
    setNotification({ open: false, message: "", severity: "info" });
    
    // Show new notification after a small delay
    setTimeout(() => {
      setNotification({ open: true, message, severity });
      
      // If this is a unique notification, mark it as shown
      if (uniqueId) {
        shownNotifications.current.add(uniqueId);
      }
    }, 100);
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);
  
  // Reset tracked notifications (useful when dependencies change)
  const resetTracking = useCallback(() => {
    shownNotifications.current.clear();
  }, []);

  return { notification, showNotification, hideNotification, resetTracking };
};

const TeacherAttendance = () => {
  const theme = useTheme();
  const dispatch = useDispatch();

  // Use the custom notification hook instead of direct state
  const { notification, showNotification, hideNotification, resetTracking } = useNotification();

  // Improved media queries for more precise breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isSmallScreen = useMediaQuery("(max-width:600px)");

  // Get user from auth state
  const { user } = useSelector((state) => state.auth);

  // Get attendance state from Redux
  const {
    loading: attendanceLoading,
    submitting,
    error: attendanceError,
    success: attendanceSuccess,
    batchAttendance,
    studentAttendance,
  } = useSelector((state) => state.attendance);

  // State variables
  const [loading, setLoading] = useState(true);
  const [batchesLoading, setBatchesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [students, setStudents] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Format date for display
  const formatDate = (date) => {
    return format(new Date(date), "MMM dd, yyyy");
  };

  // Format date for API
  const formatDateForAPI = (date) => {
    return format(new Date(date), "yyyy-MM-dd");
  };

  // Calculate date restrictions
  const getMinAttendanceDate = () => {
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(today.getDate() - 3); // 3 days before today
    return minDate;
  };

  // Reset notification tracking when batch or date changes
  useEffect(() => {
    resetTracking();
  }, [selectedBatch, attendanceDate, resetTracking]);

  // Show notification based on Redux state (success or error)
  useEffect(() => {
    if (attendanceSuccess) {
      const message = typeof attendanceSuccess === "string"
        ? attendanceSuccess
        : "Attendance submitted successfully";
      showNotification(message, "success");
      dispatch(clearSuccess());
    }

    if (attendanceError) {
      const message = typeof attendanceError === "string"
        ? attendanceError
        : "Error submitting attendance";
      showNotification(message, "error");
      dispatch(clearError());
    }
  }, [attendanceSuccess, attendanceError, dispatch, showNotification]);

  // Fetch teacher's batches
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setBatchesLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication required");
          setBatchesLoading(false);
          return;
        }

        const baseUrl =
          import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const response = await axios.get(`${baseUrl}/teachers/batches`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const batchesData = response.data.data || response.data || [];
        setBatches(Array.isArray(batchesData) ? batchesData : []);
        setError(null);
      } catch (err) {
        console.error("Error fetching batches:", err);
        setError(err.response?.data?.message || "Failed to load batches");
      } finally {
        setBatchesLoading(false);
      }
    };

    fetchBatches();
  }, [user]);

  // Fetch students when batch is selected
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedBatch) {
        setStudents([]);
        setFilteredStudents([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication required");
          setLoading(false);
          return;
        }

        const baseUrl =
          import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const response = await axios.get(
          `${baseUrl}/batches/${selectedBatch}?populate=enrolledStudents`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const batchData = response.data.data || response.data;
        const enrolledStudents = batchData.enrolledStudents || [];

        // Initialize attendance records with default values (absent)
        const records = enrolledStudents.map((student) => ({
          studentId: student._id,
          name: student.name,
          email: student.email,
          present: false,
          date: formatDateForAPI(attendanceDate),
          batchId: selectedBatch,
        }));

        setStudents(enrolledStudents);
        setFilteredStudents(enrolledStudents);
        setAttendanceRecords(records);

        // Fetch existing attendance using Redux action - only when batch is explicitly selected
        if (selectedBatch && attendanceDate) {
          // Quick check to prevent multiple fetches
          if (enrolledStudents.length > 0) {
            dispatch(
              fetchBatchAttendance({
                batchId: selectedBatch,
                date: formatDateForAPI(attendanceDate),
              })
            );
          }
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching students:", err);
        setError(err.response?.data?.message || "Failed to load students");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedBatch, attendanceDate, dispatch]);

  // Update attendance records when redux state changes
  useEffect(() => {
    if (batchAttendance && batchAttendance.length > 0 && selectedBatch) {
      // Only update records if we have a selected batch
      setAttendanceRecords((prevRecords) => {
        return prevRecords.map((record) => {
          const existingRecord = batchAttendance.find(
            (r) => r.studentId?._id === record.studentId
          );
          if (existingRecord) {
            return {
              ...record,
              present: existingRecord.present,
              _id: existingRecord._id,
            };
          }
          return record;
        });
      });

      // Only show notification if this is an intentional fetch (batch is selected)
      // Use a unique ID based on batch, date, and result type to prevent duplicate notifications
      if (selectedBatch && attendanceDate) {
        const notificationId = `${selectedBatch}_${formatDateForAPI(attendanceDate)}_loaded`;
        showNotification("Attendance records loaded for this date", "info", notificationId);
      }
    } else if (
      batchAttendance &&
      Array.isArray(batchAttendance) &&
      batchAttendance.length === 0 &&
      selectedBatch &&
      attendanceDate
    ) {
      // When no attendance records found, reset all students to absent
      if (students.length > 0) {
        const resetRecords = students.map((student) => ({
          studentId: student._id,
          name: student.name,
          email: student.email,
          present: false,
          date: formatDateForAPI(attendanceDate),
          batchId: selectedBatch,
        }));
        setAttendanceRecords(resetRecords);
      }
      
      // Only show notification if we have an actual batch selected
      // Use a unique ID based on batch, date, and result type to prevent duplicate notifications
      if (selectedBatch && attendanceDate) {
        const notificationId = `${selectedBatch}_${formatDateForAPI(attendanceDate)}_not_found`;
        showNotification("No attendance records found for this date", "warning", notificationId);
      }
    }
  }, [batchAttendance, selectedBatch, attendanceDate, students, formatDateForAPI, showNotification]);

  // Filter students based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredStudents(students);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = students.filter(
      (student) =>
        student.name?.toLowerCase().includes(query) ||
        student.email?.toLowerCase().includes(query)
    );

    setFilteredStudents(filtered);
  }, [students, searchQuery]);

  // Handle batch selection
  const handleBatchChange = (e) => {
    setSelectedBatch(e.target.value);
    // Clear search query when batch changes
    setSearchQuery("");
  };

  // Handle date change
  const handleDateChange = (newDate) => {
    setAttendanceDate(newDate);
    // Clear search query when date changes
    setSearchQuery("");
    
    // Reset attendance records to default (all absent) when date changes
    if (students.length > 0) {
      const records = students.map((student) => ({
        studentId: student._id,
        name: student.name,
        email: student.email,
        present: false,
        date: formatDateForAPI(newDate),
        batchId: selectedBatch,
      }));
      setAttendanceRecords(records);
      
      // Notify user that a new date has been selected
      showNotification(`Loading attendance for ${formatDate(newDate)}...`, "info");
    }
  };

  // Toggle student attendance status
  const toggleAttendance = (studentId) => {
    setAttendanceRecords((prevRecords) => {
      return prevRecords.map((record) => {
        if (record.studentId === studentId) {
          return { ...record, present: !record.present };
        }
        return record;
      });
    });
  };

  // Mark all students as present
  const markAllPresent = () => {
    setAttendanceRecords((prevRecords) => {
      return prevRecords.map((record) => {
        return { ...record, present: true };
      });
    });
  };

  // Mark all students as absent
  const markAllAbsent = () => {
    setAttendanceRecords((prevRecords) => {
      return prevRecords.map((record) => {
        return { ...record, present: false };
      });
    });
  };

  // Submit attendance using Redux action
  const handleSubmitAttendance = () => {
    if (!selectedBatch || attendanceRecords.length === 0) return;

    // Show immediate feedback - don't track this one as unique since we want to show it each time
    showNotification("Submitting attendance...", "info");
    
    dispatch(
      submitBatchAttendance({
        batchId: selectedBatch,
        date: formatDateForAPI(attendanceDate),
        records: attendanceRecords.map(({ studentId, present }) => ({
          studentId,
          present,
          date: formatDateForAPI(attendanceDate),
        })),
      })
    );
  };

  // View student attendance history
  const viewStudentHistory = (student) => {
    setSelectedStudent(student);
    setHistoryLoading(true);
    setHistoryDialogOpen(true);

    // Dispatch Redux action to get student attendance history
    dispatch(
      fetchStudentAttendance({
        studentId: student._id,
        batchId: selectedBatch,
      })
    );
  };

  // Close history dialog
  const handleCloseHistoryDialog = () => {
    setHistoryDialogOpen(false);
    setSelectedStudent(null);
  };

  // Mobile view - Card for each student
  const StudentCards = () => (
    <Box sx={{ width: "100%" }}>
      {filteredStudents.map((student) => {
        const record = attendanceRecords.find(
          (r) => r.studentId === student._id
        );
        const isPresent = record ? record.present : false;

        return (
          <Card
            key={student._id}
            sx={{
              borderRadius: 1.5,
              borderLeft: "4px solid",
              borderLeftColor: isPresent
                ? theme.palette.success.main
                : theme.palette.error.main,
              boxShadow: 1,
              width: "100%",
              mb: 1,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 1,
              }}
            >
              <Box sx={{ overflow: "hidden", width: "70%" }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {student.name}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: "block",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {student.email}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Checkbox
                  checked={isPresent}
                  onChange={() => toggleAttendance(student._id)}
                  color="success"
                  size="small"
                  sx={{ p: 0.5 }}
                />
                <IconButton
                  size="small"
                  onClick={() => viewStudentHistory(student)}
                  color="primary"
                  sx={{ p: 0.5 }}
                >
                  <HistoryIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Card>
        );
      })}
    </Box>
  );

  // Loading state
  if (loading && batchesLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
          width: "100%",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        overflow: "hidden",
        px: { xs: 0.5, sm: 1, md: 2 }, // Add responsive padding to the main container
      }}
    >
      {/* Header section */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, sm: 2 },
          mb: 2,
          backgroundColor: (theme) => alpha(theme.palette.primary.light, 0.05),
          borderRadius: 1.5,
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
        }}
      >
        <Typography
          variant="h5"
          component="h1"
          sx={{
            fontSize: { xs: "1.1rem", sm: "1.3rem", md: "1.5rem" },
            fontWeight: 600,
            color: "primary.main",
            mb: 0.5,
          }}
        >
          Attendance Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Mark attendance for students in your batches
        </Typography>
      </Paper>

      {/* Filters section */}
      <Paper
        sx={{
          p: { xs: 1.5, sm: 2 },
          mb: 2,
          borderRadius: 1.5,
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
        }}
      >
        <Stack spacing={2}>
          <FormControl fullWidth size="small">
            <InputLabel id="batch-select-label">Select Batch</InputLabel>
            <Select
              labelId="batch-select-label"
              id="batch-select"
              value={selectedBatch}
              label="Select Batch"
              onChange={handleBatchChange}
              disabled={batchesLoading}
            >
              <MenuItem value="">
                <em>Select a batch</em>
              </MenuItem>
              {batches.map((batch) => (
                <MenuItem key={batch._id} value={batch._id}>
                  {batch.name} - {batch.subject?.name || "No subject"}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Attendance Date"
              value={attendanceDate}
              onChange={handleDateChange}
              maxDate={new Date()} // Today
              minDate={getMinAttendanceDate()} // 3 days before today
              disableFuture
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: "small",
                  helperText: "Only dates from 3 days ago to today are allowed",
                }
              }}
            />
          </LocalizationProvider>

          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={!selectedBatch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Stack>
      </Paper>

      {/* Error alert */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2, width: "100%", boxSizing: "border-box" }}
        >
          {error}
        </Alert>
      )}

      {/* No batch selected message */}
      {!selectedBatch && !loading && (
        <Paper
          sx={{
            p: { xs: 2, sm: 3 },
            textAlign: "center",
            borderRadius: 1.5,
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <CalendarIcon
            color="primary"
            sx={{ fontSize: 40, mb: 1.5, opacity: 0.7 }}
          />
          <Typography
            variant="h6"
            gutterBottom
            sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
          >
            Select a batch to mark attendance
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Choose a batch from the dropdown menu to view and mark student
            attendance
          </Typography>
        </Paper>
      )}

      {/* Attendance section */}
      {selectedBatch && !loading && (
        <Paper
          sx={{
            borderRadius: 1.5,
            overflow: { xs: "hidden", sm: "visible" },
            width: "100%",
            maxWidth: "100%",
            boxSizing: "border-box",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              bgcolor: theme.palette.primary.light,
              color: theme.palette.primary.contrastText,
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <Stack spacing={1.5} sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Box sx={{ overflow: "hidden" }}>
                <Typography
                  variant="subtitle1"
                  component="h2"
                  sx={{
                    fontWeight: 600,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {batches.find((b) => b._id === selectedBatch)?.name ||
                    "Selected Batch"}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    opacity: 0.9,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  Attendance for {formatDate(attendanceDate)}
                </Typography>
              </Box>

              <Stack
                direction="row"
                spacing={1}
                sx={{
                  width: "100%",
                  boxSizing: "border-box",
                }}
              >
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  onClick={markAllPresent}
                  disabled={filteredStudents.length === 0}
                  startIcon={isMobile ? null : <CheckCircleIcon />}
                  sx={{ flex: 1 }}
                >
                  {isMobile ? "All P" : "All Present"}
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={markAllAbsent}
                  disabled={filteredStudents.length === 0}
                  startIcon={isMobile ? null : <CancelIcon />}
                  sx={{ flex: 1 }}
                >
                  {isMobile ? "All A" : "All Absent"}
                </Button>
              </Stack>
            </Stack>
          </Box>

          <Divider />

          {/* No students message */}
          {filteredStudents.length === 0 && (
            <Box sx={{ p: { xs: 2, sm: 3 }, textAlign: "center" }}>
              <Typography variant="body1">
                No students found in this batch
              </Typography>
            </Box>
          )}

          {/* Student list */}
          {filteredStudents.length > 0 && (
            <Box
              sx={{
                p: { xs: 0.5, sm: 1.5 },
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              {isMobile ? (
                <StudentCards />
              ) : (
                <TableContainer sx={{ maxHeight: "60vh" }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Student Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell align="center">Attendance</TableCell>
                        <TableCell align="center">History</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredStudents.map((student) => {
                        const record = attendanceRecords.find(
                          (r) => r.studentId === student._id
                        );
                        const isPresent = record ? record.present : false;

                        return (
                          <TableRow key={student._id}>
                            <TableCell>{student.name}</TableCell>
                            <TableCell>{student.email}</TableCell>
                            <TableCell align="center">
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={isPresent}
                                    onChange={() =>
                                      toggleAttendance(student._id)
                                    }
                                    color="success"
                                  />
                                }
                                label={isPresent ? "Present" : "Absent"}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                color="primary"
                                onClick={() => viewStudentHistory(student)}
                              >
                                <HistoryIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}

          {/* Submit button */}
          {filteredStudents.length > 0 && (
            <Box
              sx={{
                p: { xs: 1.5, sm: 2 },
                borderTop: `1px solid ${theme.palette.divider}`,
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleSubmitAttendance}
                disabled={submitting}
                startIcon={!isMobile && <SaveIcon />}
                size={isMobile ? "small" : "medium"}
                sx={{
                  py: { xs: 0.75, sm: 1 },
                }}
              >
                {submitting ? (
                  <CircularProgress size={20} />
                ) : (
                  "Submit Attendance"
                )}
              </Button>
            </Box>
          )}
        </Paper>
      )}

      {/* Student history dialog */}
      <Dialog
        open={historyDialogOpen}
        onClose={handleCloseHistoryDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            width: { xs: "90%", sm: "400px" },
            maxWidth: "100%",
            m: { xs: 0.5, sm: "auto" },
            borderRadius: { xs: 1, sm: 1.5 },
          },
        }}
      >
        <DialogTitle
          sx={{
            pr: 5,
            p: { xs: 1.5, sm: 2 },
            fontSize: { xs: "1rem", sm: "1.25rem" },
          }}
        >
          <Typography
            noWrap
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              fontSize: { xs: "0.9rem", sm: "1rem" },
            }}
          >
            {selectedStudent?.name} History
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleCloseHistoryDialog}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: theme.palette.grey[500],
              padding: { xs: 0.5, sm: 1 },
            }}
          >
            <CloseIcon fontSize={isMobile ? "small" : "medium"} />
          </IconButton>
        </DialogTitle>
        <DialogContent
          dividers
          sx={{
            p: { xs: 1, sm: 1.5 },
            maxHeight: { xs: "60vh", sm: "70vh" },
          }}
        >
          {attendanceLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress size={30} />
            </Box>
          ) : studentAttendance.length === 0 ? (
            <Typography variant="body2" sx={{ textAlign: "center", p: 2 }}>
              No attendance records found
            </Typography>
          ) : (
            <TableContainer sx={{ maxHeight: "50vh" }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {studentAttendance.map((record) => (
                    <TableRow key={record._id}>
                      <TableCell>{formatDate(record.date)}</TableCell>
                      <TableCell align="right">
                        <Chip
                          label={record.present ? "Present" : "Absent"}
                          color={record.present ? "success" : "error"}
                          variant="outlined"
                          size="small"
                          sx={{ minWidth: 70 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions sx={{ p: { xs: 1, sm: 1.5 } }}>
          <Button
            onClick={handleCloseHistoryDialog}
            color="primary"
            fullWidth
            variant="contained"
            size={isMobile ? "small" : "medium"}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Simplified Snackbar implementation */}
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={hideNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{ mb: 2 }}
      >
        <Alert
          onClose={hideNotification}
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TeacherAttendance;
