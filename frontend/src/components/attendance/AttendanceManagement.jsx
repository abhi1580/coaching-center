import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Checkbox,
  CircularProgress,
  Alert,
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
  useMediaQuery,
  Grid,
  InputAdornment,
  FormHelperText,
  Tooltip,
  ButtonGroup,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";
import {
  Save as SaveIcon,
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
import { useDispatch } from "react-redux";
import { format } from "date-fns";
import {
  fetchBatchAttendance,
  submitBatchAttendance,
  updateAttendanceRecord,
} from "../../store/slices/attendanceSlice";
import EditAttendanceDialog from "./EditAttendanceDialog";

const AttendanceManagement = ({
  batches,
  selectedBatch,
  setSelectedBatch,
  attendanceDate,
  setAttendanceDate,
  attendanceRecords,
  setAttendanceRecords,
  students,
  filteredStudents,
  setFilteredStudents,
  searchQuery,
  setSearchQuery,
  loading,
  batchesLoading,
  attendanceLoading,
  submitting,
  error,
  formatDate,
  formatDateForAPI,
  getMinAttendanceDate,
  showNotification,
  onViewHistory,
}) => {
  const theme = useTheme();
  const dispatch = useDispatch();

  // Media queries for responsive design
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isSmallScreen = useMediaQuery("(max-width:600px)");

  // State for component
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);

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

  // Handle batch change
  const handleBatchChange = (e) => {
    setSelectedBatch(e.target.value);
    setSearchQuery("");
    setFilteredStudents([]);
    setSelectedStudents([]);
    setSelectAll(false);
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

  // Toggle attendance status
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

  // Mark all students as a specific status
  const markAllAs = (status) => {
    const updatedRecords = attendanceRecords.map((record) => ({
      ...record,
      status,
    }));
    setAttendanceRecords(updatedRecords);
    showNotification(`All students marked as ${status}`, "success");
  };

  // Bulk status change
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

  // Format records for submission
  const formatRecordsForSubmission = () => {
    return attendanceRecords.map((record) => ({
      studentId: record.studentId._id,
      status: record.status,
      remarks: record.remarks || "",
    }));
  };

  // Submit attendance
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

  // Improve the handleStatusUpdate function with better validation and error handling
  const handleStatusUpdate = (id, status, remarks) => {
    // Validate ID and status
    if (!id || !status) {
      // Only show warning for real errors, not for virtual records
      return;
    }

    // Verify status is valid
    if (
      !["present", "absent", "late", "excused", "cancelled"].includes(status)
    ) {
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
          // Only show warning if the record has a real _id (not a virtual record)
          if (id) {
            showNotification(
              "Failed to update attendance. Please try again later.",
              "warning"
            );
          }
        });
    } catch (error) {
      // Only show warning if the record has a real _id (not a virtual record)
      if (id) {
        showNotification(
          "Failed to update attendance. Please try again later.",
          "warning"
        );
      }
    }
  };

  // Open edit dialog for a record
  const openEditDialog = (record) => {
    setCurrentRecord(record);
    setEditDialogOpen(true);
  };

  // Handle save edit
  const handleSaveEdit = (record, status, remarks) => {
    if (!record) return;

    if (record._id) {
      // First update the UI immediately for better UX
      const updatedRecords = attendanceRecords.map((r) => {
        if (r._id === record._id) {
          return {
            ...r,
            status,
            remarks,
          };
        }
        return r;
      });
      setAttendanceRecords(updatedRecords);

      // Then send update to the server
      handleStatusUpdate(record._id, status, remarks);
    } else {
      // For virtual records (not yet saved to DB)
      const updatedRecords = attendanceRecords.map((r) => {
        if (r.studentId._id === record.studentId._id) {
          return {
            ...r,
            status,
            remarks,
          };
        }
        return r;
      });
      setAttendanceRecords(updatedRecords);

      // Show feedback to user
      showNotification(
        "Record updated locally. Save attendance to persist changes.",
        "info"
      );
    }

    setEditDialogOpen(false);
    setCurrentRecord(null);
  };

  // Status chip component
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

  // Render the attendance table
  const AttendanceTable = () => (
    <TableContainer component={Paper} sx={{ mt: 2, p: { xs: 0, sm: 2 } }}>
      <Table size={isSmallScreen ? "small" : "medium"}>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                color="primary"
                checked={selectAll}
                onChange={handleSelectAll}
                sx={{ p: { xs: 0.5, sm: 1 } }}
              />
            </TableCell>
            <TableCell sx={{ fontSize: { xs: "0.85rem", sm: "1rem" } }}>
              No.
            </TableCell>
            <TableCell sx={{ fontSize: { xs: "0.85rem", sm: "1rem" } }}>
              Student Name
            </TableCell>
            <TableCell sx={{ fontSize: { xs: "0.85rem", sm: "1rem" } }}>
              Email
            </TableCell>
            <TableCell
              align="center"
              sx={{ fontSize: { xs: "0.85rem", sm: "1rem" } }}
            >
              Status
            </TableCell>
            <TableCell sx={{ fontSize: { xs: "0.85rem", sm: "1rem" } }}>
              Remarks
            </TableCell>
            <TableCell
              align="center"
              sx={{ fontSize: { xs: "0.85rem", sm: "1rem" } }}
            >
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredStudents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center">
                No students found.
              </TableCell>
            </TableRow>
          ) : (
            filteredStudents.map((student, index) => {
              const record = attendanceRecords.find(
                (r) => r.studentId._id === student._id
              ) || {
                studentId: {
                  _id: student._id,
                  name: student.name,
                  email: student.email,
                },
                status: "absent",
                remarks: "",
              };

              return (
                <TableRow
                  key={student._id}
                  selected={isStudentSelected(student._id)}
                  hover
                  sx={{
                    fontSize: { xs: "0.85rem", sm: "1rem" },
                    "& td": { py: { xs: 0.5, sm: 1 }, px: { xs: 0.5, sm: 2 } },
                  }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      checked={isStudentSelected(student._id)}
                      onChange={() => toggleStudentSelection(student._id)}
                      sx={{ p: { xs: 0.5, sm: 1 } }}
                    />
                  </TableCell>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell
                    sx={{
                      maxWidth: { xs: 90, sm: 200 },
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {student.email}
                  </TableCell>
                  <TableCell align="center">
                    <StatusChip
                      status={record.status}
                      studentId={student._id}
                      onClick={() => toggleAttendanceStatus(student._id)}
                    />
                  </TableCell>
                  <TableCell
                    sx={{
                      maxWidth: { xs: 90, sm: 200 },
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {record.remarks ? (
                      <Tooltip title={record.remarks}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <CommentIcon fontSize="small" sx={{ mr: 0.5 }} />
                          <Typography
                            variant="body2"
                            sx={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              maxWidth: { xs: 90, sm: 150 },
                            }}
                          >
                            {record.remarks}
                          </Typography>
                        </Box>
                      </Tooltip>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: "flex", justifyContent: "center" }}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => openEditDialog(record)}
                        aria-label="Edit attendance"
                        sx={{ p: { xs: 0.5, sm: 1 } }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  // Keyboard shortcuts helper
  const KeyboardShortcutHelp = () => (
    <Paper
      sx={{ p: 2, mb: 2, display: "flex", flexDirection: "column", gap: 1 }}
    >
      <Typography variant="subtitle1" fontWeight="bold">
        Keyboard Shortcuts
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6} sm={3} md={2}>
          <Tooltip title="Used when no class was arranged for this day">
            <Chip
              label="P = Mark Present"
              size="small"
              icon={<CheckCircleIcon />}
              sx={{ bgcolor: alpha(theme.palette.success.main, 0.1) }}
            />
          </Tooltip>
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

  // Effect to handle key shortcuts
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

  return (
    <Box>
      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth error={batchesLoading}>
              <InputLabel id="batch-label">Select Batch</InputLabel>
              <Select
                labelId="batch-label"
                value={selectedBatch}
                onChange={handleBatchChange}
                label="Select Batch"
                disabled={batchesLoading}
              >
                {batches.map((batch) => (
                  <MenuItem key={batch._id} value={batch._id}>
                    {batch.name} - {batch.subject?.name || "Unknown Subject"}
                  </MenuItem>
                ))}
              </Select>
              {batchesLoading && (
                <FormHelperText>Loading batches...</FormHelperText>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Attendance Date"
                value={attendanceDate}
                onChange={(newDate) => newDate && setAttendanceDate(newDate)}
                format="MMM dd, yyyy"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: "outlined",
                  },
                }}
                minDate={getMinAttendanceDate()}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search Students"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={!selectedBatch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>

        {selectedBatch && (
          <>
            {/* Display keyboard shortcuts when students are selected */}
            {selectedStudents.length > 0 && <KeyboardShortcutHelp />}

            <Box
              sx={{
                mt: 3,
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <ButtonGroup
                  variant="outlined"
                  size={isSmallScreen ? "small" : "medium"}
                >
                  <Button
                    startIcon={<SelectAllIcon />}
                    onClick={handleSelectAll}
                    color="inherit"
                  >
                    {selectAll ? "Deselect All" : "Select All"}
                  </Button>
                  {selectedStudents.length > 0 && (
                    <Button
                      startIcon={<ClearSelectionIcon />}
                      onClick={() => {
                        setSelectedStudents([]);
                        setSelectAll(false);
                      }}
                      color="inherit"
                    >
                      Clear ({selectedStudents.length})
                    </Button>
                  )}
                </ButtonGroup>

                {selectedStudents.length > 0 && (
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<BulkEditIcon />}
                    onClick={() =>
                      showNotification(
                        "Bulk edit functionality moved to keyboard shortcuts",
                        "info"
                      )
                    }
                    size={isSmallScreen ? "small" : "medium"}
                  >
                    Bulk Edit ({selectedStudents.length})
                  </Button>
                )}
              </Box>

              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Tooltip title="Mark this day as having no class arranged">
                  <Button
                    variant="outlined"
                    color="inherit"
                    startIcon={<CloseIcon />}
                    onClick={() => markAllAs("cancelled")}
                    disabled={loading || attendanceLoading}
                    size={isSmallScreen ? "small" : "medium"}
                  >
                    Class Cancelled
                  </Button>
                </Tooltip>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={handleSubmitAttendance}
                  disabled={submitting || loading || attendanceLoading}
                  size={isSmallScreen ? "small" : "medium"}
                >
                  {submitting ? "Saving..." : "Save"}
                </Button>
              </Box>
            </Box>

            {loading || attendanceLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", my: 5 }}>
                <CircularProgress />
              </Box>
            ) : (
              <AttendanceTable />
            )}
          </>
        )}
      </Paper>

      {/* Edit Dialog */}
      <EditAttendanceDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        record={currentRecord}
        onSave={handleSaveEdit}
        formatDate={formatDate}
      />
    </Box>
  );
};

export default AttendanceManagement;
