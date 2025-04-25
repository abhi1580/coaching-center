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
  FormHelperText,
  Tooltip,
  Tab,
  Tabs,
  RadioGroup,
  Radio,
  Backdrop,
  Fade,
  Modal,
  ButtonGroup,
} from "@mui/material";
import {
  Save as SaveIcon,
  CalendarToday as CalendarIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  History as HistoryIcon,
  Close as CloseIcon,
  AccessTime as LateIcon,
  MedicalServices as ExcusedIcon,
  Comment as CommentIcon,
  Edit as EditIcon,
  EditAttributes as BulkEditIcon,
  SelectAll as SelectAllIcon,
  ClearAll as ClearSelectionIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { format } from "date-fns";
import AttendanceManagement from "../../components/attendance/AttendanceManagement";
import AttendanceHistory from "../../components/attendance/AttendanceHistory";

// Import Redux actions
import {
  fetchBatchAttendance,
  submitBatchAttendance,
  fetchStudentAttendance,
  updateAttendanceRecord,
  updateAttendanceInState,
  clearSuccess,
  clearError,
} from "../../store/slices/attendanceSlice";

// Create a simple notification system
const useNotification = () => {
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // Add reference to track if a specific notification was already shown
  const shownNotifications = useRef(new Set());

  // Only show one notification at a time
  const showNotification = useCallback(
    (message, severity = "info", uniqueId = null) => {
      // If this is a unique notification and we've already shown it, don't show again
      if (uniqueId && shownNotifications.current.has(uniqueId)) {
        return;
      }

      // Close first
      setNotification({ open: false, message: "", severity: "info" });

      // Show new notification after a small delay
      setTimeout(() => {
        setNotification({ open: true, message, severity });

        // If this is a unique notification, mark it as shown
        if (uniqueId) {
          shownNotifications.current.add(uniqueId);
        }
      }, 100);
    },
    []
  );

  const hideNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, open: false }));
  }, []);

  // Reset tracked notifications
  const resetTracking = useCallback(() => {
    shownNotifications.current.clear();
  }, []);

  return { notification, showNotification, hideNotification, resetTracking };
};

const TeacherAttendance = () => {
  const theme = useTheme();
  const dispatch = useDispatch();

  // Use the custom notification hook
  const { notification, showNotification, hideNotification, resetTracking } =
    useNotification();

  // Media queries for responsive design
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
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [editStatus, setEditStatus] = useState("");
  const [editRemarks, setEditRemarks] = useState("");

  // Add bulk edit state
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [bulkEditStatus, setBulkEditStatus] = useState("present");
  const [bulkEditRemarks, setBulkEditRemarks] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [historyDate, setHistoryDate] = useState(new Date());

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
    minDate.setDate(today.getDate() - 7); // Allow marking attendance for up to 7 days before
    return minDate;
  };

  // Reset notification tracking when batch or date changes
  useEffect(() => {
    resetTracking();
  }, [selectedBatch, attendanceDate, resetTracking]);

  // Show notification based on Redux state (success or error)
  useEffect(() => {
    if (attendanceSuccess) {
      const message =
        typeof attendanceSuccess === "string"
          ? attendanceSuccess
          : "Operation completed successfully";
      showNotification(message, "success");
      dispatch(clearSuccess());
    }

    if (attendanceError) {
      const message =
        typeof attendanceError === "string"
          ? attendanceError
          : "Error during operation";
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
        const response = await axios.get(`${baseUrl}/teacher/batches`, {
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

        setStudents(enrolledStudents);
        setFilteredStudents(enrolledStudents);
        setError(null);
      } catch (err) {
        console.error("Error fetching students:", err);
        setError(err.response?.data?.message || "Failed to load students");
        setStudents([]);
        setFilteredStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedBatch]);

  // Fetch attendance when batch and date are selected
  useEffect(() => {
    if (selectedBatch && attendanceDate) {
      dispatch(
        fetchBatchAttendance({
          batchId: selectedBatch,
          date: formatDateForAPI(attendanceDate),
        })
      );
    }
  }, [selectedBatch, attendanceDate, dispatch]);

  // Update local attendance records when batch attendance changes
  useEffect(() => {
    if (batchAttendance && batchAttendance.length > 0) {
      setAttendanceRecords(batchAttendance);
    } else {
      // If no attendance records found, create default records for all students
      const defaultRecords = students.map((student) => ({
        _id: null, // No ID means this is a new record
        studentId: {
          _id: student._id,
          name: student.name,
          email: student.email,
        },
        batchId: selectedBatch,
        date: attendanceDate,
        status: "absent",
        remarks: "",
        isVirtual: true,
      }));
      setAttendanceRecords(defaultRecords);
    }
  }, [batchAttendance, students, selectedBatch, attendanceDate]);

  // Filter students when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredStudents(students);
      return;
    }

    const lowercaseQuery = searchQuery.toLowerCase();
    const filtered = students.filter(
      (student) =>
        student.name.toLowerCase().includes(lowercaseQuery) ||
        student.email.toLowerCase().includes(lowercaseQuery)
    );
    setFilteredStudents(filtered);
  }, [searchQuery, students]);

  // Handle batch change
  const handleBatchChange = (e) => {
    setSelectedBatch(e.target.value);
    setSearchQuery("");
    setFilteredStudents([]);
    setAttendanceRecords([]);
  };

  // Handle date change
  const handleDateChange = (newDate) => {
    if (newDate) {
      setAttendanceDate(newDate);
    }
  };

  // Improve the handleStatusUpdate function with better validation and error handling
  const handleStatusUpdate = (id, status, remarks) => {
    // Validate ID and status
    if (!id || !status) {
      console.error("Invalid ID or status for attendance update");
      return;
    }

    // Verify status is valid
    if (!["present", "absent", "late", "excused"].includes(status)) {
      console.error("Invalid status value:", status);
      return;
    }

    // Clean up remarks
    const cleanRemarks = typeof remarks === "string" ? remarks.trim() : "";

    try {
      // Update server
      dispatch(
        updateAttendanceRecord({
          id,
          data: {
            status,
            remarks: cleanRemarks,
          },
        })
      )
        .unwrap()
        .then((response) => {
          // Success handling if needed
        })
        .catch((error) => {
          console.error("Error updating attendance record:", error);
          showNotification(
            "Failed to update attendance. Changes will be saved when submitting.",
            "warning"
          );
        });
    } catch (error) {
      console.error("Exception when updating attendance:", error);
    }
  };

  // Modify toggleAttendanceStatus to include cancelled status
  const toggleAttendanceStatus = (studentId) => {
    const updatedRecords = attendanceRecords.map((record) => {
      if (record.studentId._id === studentId) {
        // Cycle through the statuses: absent -> present -> late -> excused -> cancelled -> absent
        let newStatus;
        switch (record.status) {
          case "absent":
            newStatus = "present";
            break;
          case "present":
            newStatus = "late";
            break;
          case "late":
            newStatus = "excused";
            break;
          case "excused":
            newStatus = "cancelled";
            break;
          case "cancelled":
            newStatus = "absent";
            break;
          default:
            newStatus = "absent";
        }

        return { ...record, status: newStatus };
      }
      return record;
    });

    setAttendanceRecords(updatedRecords);
  };

  // Simplify the bulk edit functionality
  const applyBulkEdit = () => {
    const updatedRecords = attendanceRecords.map((record) => {
      if (selectedStudents.includes(record.studentId._id)) {
        return {
          ...record,
          status: bulkEditStatus,
          remarks: bulkEditRemarks || record.remarks,
        };
      }
      return record;
    });

    setAttendanceRecords(updatedRecords);
    closeBulkEdit();

    // Clear selection after bulk edit
    setSelectedStudents([]);
    setSelectAll(false);

    showNotification(
      `Updated ${selectedStudents.length} student(s)`,
      "success"
    );
  };

  // Simplify handleBulkStatusChange to avoid server calls
  const handleBulkStatusChange = (status) => {
    const updatedRecords = attendanceRecords.map((record) => {
      if (selectedStudents.includes(record.studentId._id)) {
        return {
          ...record,
          status,
        };
      }
      return record;
    });

    setAttendanceRecords(updatedRecords);
  };

  // Modify handleSubmitAttendance to include better error handling
  const handleSubmitAttendance = () => {
    if (!selectedBatch || !attendanceDate) {
      showNotification("Please select a batch and date", "error");
      return;
    }

    try {
      const formattedRecords = formatRecordsForSubmission();
      dispatch(
        submitBatchAttendance({
          batchId: selectedBatch,
          date: formatDateForAPI(attendanceDate),
          records: formattedRecords,
        })
      )
        .unwrap()
        .then(() => {
          // Refresh attendance data after successful submission
          dispatch(
            fetchBatchAttendance({
              batchId: selectedBatch,
              date: formatDateForAPI(attendanceDate),
            })
          );
        })
        .catch((error) => {
          console.error("Failed to submit attendance:", error);
        });
    } catch (error) {
      console.error("Error formatting attendance data:", error);
      showNotification(
        "Error preparing attendance data. Please try again.",
        "error"
      );
    }
  };

  // View student attendance history
  const viewStudentHistory = (student) => {
    setSelectedStudent(student);
    setHistoryLoading(true);
    setHistoryDialogOpen(true);

    dispatch(
      fetchStudentAttendance({
        studentId: student._id,
        batchId: selectedBatch,
      })
    ).finally(() => {
      setHistoryLoading(false);
    });
  };

  // Close history dialog
  const handleCloseHistoryDialog = () => {
    setHistoryDialogOpen(false);
    setSelectedStudent(null);
  };

  // Open edit dialog for a record
  const openEditDialog = (record) => {
    setCurrentRecord(record);
    setEditStatus(record.status);
    setEditRemarks(record.remarks || "");
    setEditDialogOpen(true);
  };

  // Close edit dialog
  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setCurrentRecord(null);
    setEditStatus("");
    setEditRemarks("");
  };

  // Save edited record
  const handleSaveEdit = () => {
    if (!currentRecord) return;

    if (currentRecord._id) {
      // First update the UI immediately for better UX
      const updatedRecords = attendanceRecords.map((record) => {
        if (record._id === currentRecord._id) {
          return {
            ...record,
            status: editStatus,
            remarks: editRemarks,
          };
        }
        return record;
      });
      setAttendanceRecords(updatedRecords);

      // Then send update to the server
      handleStatusUpdate(currentRecord._id, editStatus, editRemarks);
    } else {
      // For virtual records (not yet saved to DB)
      const updatedRecords = attendanceRecords.map((record) => {
        if (record.studentId._id === currentRecord.studentId._id) {
          return {
            ...record,
            status: editStatus,
            remarks: editRemarks,
          };
        }
        return record;
      });
      setAttendanceRecords(updatedRecords);

      // Show feedback to user
      showNotification(
        "Record updated locally. Save attendance to persist changes.",
        "info"
      );
    }

    handleCloseEditDialog();
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "present":
        return theme.palette.success.main;
      case "absent":
        return theme.palette.error.main;
      case "late":
        return theme.palette.warning.main;
      case "excused":
        return theme.palette.info.main;
      case "cancelled":
        return theme.palette.grey[700];
      default:
        return theme.palette.grey[500];
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "present":
        return <CheckCircleIcon />;
      case "absent":
        return <CancelIcon />;
      case "late":
        return <LateIcon />;
      case "excused":
        return <ExcusedIcon />;
      case "cancelled":
        return <CloseIcon />;
      default:
        return null;
    }
  };

  // Add visual feedback when status changes
  const StatusChip = ({ status, studentId, onClick }) => {
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
      // Trigger animation when status changes
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 300);
      return () => clearTimeout(timer);
    }, [status]);

    // Get proper label for status
    const getStatusLabel = (status) => {
      if (status === "cancelled") {
        return "Cancelled";
      }
      return status.charAt(0).toUpperCase() + status.slice(1);
    };

    return (
      <Tooltip
        title={
          status === "cancelled"
            ? "No class was arranged for this day"
            : `Click to change status (currently ${status})`
        }
      >
        <Chip
          icon={getStatusIcon(status)}
          label={getStatusLabel(status)}
          onClick={onClick}
          sx={{
            bgcolor: alpha(getStatusColor(status), 0.1),
            color: getStatusColor(status),
            borderColor: getStatusColor(status),
            border: "1px solid",
            fontWeight: "bold",
            transform: animate ? "scale(1.1)" : "scale(1)",
            transition: "transform 0.3s ease-in-out",
          }}
        />
      </Tooltip>
    );
  };

  // Toggle select all students
  const handleSelectAll = () => {
    if (selectAll) {
      // If already selected all, clear selection
      setSelectedStudents([]);
    } else {
      // Select all filtered students
      setSelectedStudents(filteredStudents.map((student) => student._id));
    }
    setSelectAll(!selectAll);
  };

  // Toggle student selection
  const toggleStudentSelection = (studentId) => {
    setSelectedStudents((prev) => {
      if (prev.includes(studentId)) {
        return prev.filter((id) => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  // Check if a student is selected
  const isStudentSelected = (studentId) => {
    return selectedStudents.includes(studentId);
  };

  // Open bulk edit modal
  const openBulkEdit = () => {
    if (selectedStudents.length === 0) {
      showNotification("Please select at least one student", "warning");
      return;
    }
    setBulkEditOpen(true);
  };

  // Close bulk edit modal
  const closeBulkEdit = () => {
    setBulkEditOpen(false);
    setBulkEditStatus("present");
    setBulkEditRemarks("");
  };

  // Format records for submission
  const formatRecordsForSubmission = () => {
    return attendanceRecords.map((record) => ({
      studentId: record.studentId._id,
      status: record.status,
      remarks: record.remarks || "",
    }));
  };

  // Add keyboard shortcut handling
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Only activate shortcuts when we have selected students
      if (selectedStudents.length === 0) return;

      // Don't activate shortcuts when typing in text fields
      if (
        event.target.tagName === "INPUT" ||
        event.target.tagName === "TEXTAREA"
      )
        return;

      switch (event.key) {
        case "p":
          // Mark selected students as present
          handleBulkStatusChange("present");
          showNotification(
            `Marked ${selectedStudents.length} student(s) as present`,
            "success"
          );
          break;
        case "a":
          // Mark selected students as absent
          handleBulkStatusChange("absent");
          showNotification(
            `Marked ${selectedStudents.length} student(s) as absent`,
            "success"
          );
          break;
        case "l":
          // Mark selected students as late
          handleBulkStatusChange("late");
          showNotification(
            `Marked ${selectedStudents.length} student(s) as late`,
            "success"
          );
          break;
        case "e":
          // Mark selected students as excused
          handleBulkStatusChange("excused");
          showNotification(
            `Marked ${selectedStudents.length} student(s) as excused`,
            "success"
          );
          break;
        case "c":
          // Mark selected students as cancelled
          handleBulkStatusChange("cancelled");
          showNotification(
            `Marked ${selectedStudents.length} student(s) as cancelled`,
            "success"
          );
          break;
        case "Escape":
          // Clear selection
          setSelectedStudents([]);
          setSelectAll(false);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [selectedStudents]);

  // Add helper component to display keyboard shortcuts
  const KeyboardShortcutHelp = () => (
    <Paper
      sx={{ p: 2, mb: 2, display: "flex", flexDirection: "column", gap: 1 }}
    >
      <Typography variant="subtitle1" fontWeight="bold">
        Keyboard Shortcuts
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6} sm={3} md={2}>
          <Chip
            label="P = Mark Present"
            size="small"
            icon={<CheckCircleIcon />}
            sx={{ bgcolor: alpha(theme.palette.success.main, 0.1) }}
          />
        </Grid>
        <Grid item xs={6} sm={3} md={2}>
          <Chip
            label="A = Mark Absent"
            size="small"
            icon={<CancelIcon />}
            sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}
          />
        </Grid>
        <Grid item xs={6} sm={3} md={2}>
          <Chip
            label="L = Mark Late"
            size="small"
            icon={<LateIcon />}
            sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1) }}
          />
        </Grid>
        <Grid item xs={6} sm={3} md={2}>
          <Chip
            label="E = Mark Excused"
            size="small"
            icon={<ExcusedIcon />}
            sx={{ bgcolor: alpha(theme.palette.info.main, 0.1) }}
          />
        </Grid>
        <Grid item xs={6} sm={3} md={2}>
          <Tooltip title="Used when no class was arranged for this day">
            <Chip
              label="C = Class Cancelled"
              size="small"
              icon={<CloseIcon />}
              sx={{ bgcolor: alpha(theme.palette.grey[700], 0.1) }}
            />
          </Tooltip>
        </Grid>
      </Grid>
    </Paper>
  );

  // Restore the markAllAs function
  const markAllAs = (status) => {
    const updatedRecords = attendanceRecords.map((record) => ({
      ...record,
      status,
    }));
    setAttendanceRecords(updatedRecords);
    showNotification(`All students marked as ${status}`, "success");
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Attendance
      </Typography>
      <Divider sx={{ mb: 3 }} />
      <Tabs
        value={tabIndex}
        onChange={(_, v) => setTabIndex(v)}
        indicatorColor="primary"
        textColor="primary"
        sx={{ mb: 3 }}
      >
        <Tab label="Attendance Management" />
        <Tab label="Attendance History" />
      </Tabs>
      {tabIndex === 0 && (
        <AttendanceManagement
          batches={batches}
          selectedBatch={selectedBatch}
          setSelectedBatch={setSelectedBatch}
          attendanceDate={attendanceDate}
          setAttendanceDate={setAttendanceDate}
          attendanceRecords={attendanceRecords}
          setAttendanceRecords={setAttendanceRecords}
          students={students}
          filteredStudents={filteredStudents}
          setFilteredStudents={setFilteredStudents}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          loading={loading}
          batchesLoading={batchesLoading}
          attendanceLoading={attendanceLoading}
          submitting={submitting}
          error={error}
          formatDate={formatDate}
          formatDateForAPI={formatDateForAPI}
          getMinAttendanceDate={getMinAttendanceDate}
          showNotification={showNotification}
          onViewHistory={viewStudentHistory}
        />
      )}
      {tabIndex === 1 && (
        <>
          <Box sx={{ mb: 2, maxWidth: 260 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="History Date"
                value={historyDate}
                onChange={setHistoryDate}
                format="MMM dd, yyyy"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: "outlined",
                  },
                }}
                maxDate={new Date()}
              />
            </LocalizationProvider>
          </Box>
          <AttendanceHistory
            classId={selectedBatch}
            students={students}
            date={historyDate}
          />
        </>
      )}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={hideNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={hideNotification}
          severity={notification.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TeacherAttendance;
