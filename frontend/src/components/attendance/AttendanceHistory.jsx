import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  IconButton,
  Chip,
  CircularProgress,
  TextField,
  InputAdornment,
  useTheme,
  alpha,
  Tooltip,
  Stack,
  Button,
  Divider,
  Alert,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  CalendarMonth as CalendarIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as AccessTimeIcon,
  MedicalServices as MedicalServicesIcon,
  Event as EventIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import format from "date-fns/format";
import * as XLSX from "xlsx";
import axios from "axios";

const AttendanceHistory = ({ classId, students, date }) => {
  const theme = useTheme();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);

  useEffect(() => {
    const fetchAttendanceHistory = async () => {
      if (!classId || !date) return;
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const baseUrl =
          import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const formattedDate =
          date instanceof Date ? date.toISOString().slice(0, 10) : date;
        const response = await axios.get(
          `${baseUrl}/attendance/${classId}/${formattedDate}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAttendanceRecords(response.data.data || []);
      } catch (err) {
        setError("Failed to load attendance records. Please try again later.");
        setAttendanceRecords([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendanceHistory();
  }, [classId, date]);

  // Format date for display
  const formatDate = (date) => {
    if (!date) return "N/A";
    try {
      return format(new Date(date), "PPP");
    } catch (error) {
      return "Invalid date";
    }
  };

  // Get status icon based on attendance status
  const getStatusIcon = (status) => {
    switch (status) {
      case "present":
        return <CheckCircleIcon sx={{ color: theme.palette.success.main }} />;
      case "absent":
        return <CancelIcon sx={{ color: theme.palette.error.main }} />;
      case "late":
        return <AccessTimeIcon sx={{ color: theme.palette.warning.main }} />;
      case "excused":
        return <MedicalServicesIcon sx={{ color: theme.palette.info.main }} />;
      default:
        return null;
    }
  };

  // Get status color based on attendance status
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
      default:
        return theme.palette.grey[500];
    }
  };

  // Filter records for the selected date and search/status
  const filteredRecords = attendanceRecords.filter((record) => {
    const recordDate = format(new Date(record.date), "yyyy-MM-dd");
    const selectedDate = format(new Date(date), "yyyy-MM-dd");
    const matchesDate = recordDate === selectedDate;
    const matchesSearch =
      searchQuery === "" ||
      record.studentId?.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      record.remarks?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || record.status === statusFilter;
    return matchesDate && matchesSearch && matchesStatus;
  });

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          p: 2,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
        }}
      >
        <Typography variant="h6" component="h2">
          Attendance History for {date ? formatDate(date) : "—"}
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
        <TextField
          placeholder="Search by student name or remarks"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          variant="outlined"
          size="small"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Status:
          </Typography>
          <Chip
            icon={<CheckCircleIcon />}
            label="Present"
            onClick={() =>
              setStatusFilter(statusFilter === "present" ? null : "present")
            }
            color={statusFilter === "present" ? "success" : "default"}
            variant={statusFilter === "present" ? "filled" : "outlined"}
            size="small"
          />
          <Chip
            icon={<CancelIcon />}
            label="Absent"
            onClick={() =>
              setStatusFilter(statusFilter === "absent" ? null : "absent")
            }
            color={statusFilter === "absent" ? "error" : "default"}
            variant={statusFilter === "absent" ? "filled" : "outlined"}
            size="small"
          />
          <Chip
            icon={<AccessTimeIcon />}
            label="Late"
            onClick={() =>
              setStatusFilter(statusFilter === "late" ? null : "late")
            }
            color={statusFilter === "late" ? "warning" : "default"}
            variant={statusFilter === "late" ? "filled" : "outlined"}
            size="small"
          />
          <Chip
            icon={<MedicalServicesIcon />}
            label="Excused"
            onClick={() =>
              setStatusFilter(statusFilter === "excused" ? null : "excused")
            }
            color={statusFilter === "excused" ? "info" : "default"}
            variant={statusFilter === "excused" ? "filled" : "outlined"}
            size="small"
          />
        </Stack>
      </Box>
      {error && (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      )}
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="attendance history table">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Student</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Remarks</TableCell>
                <TableCell>Last Updated</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={40} />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Loading attendance records...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1">
                      No attendance records found for this date
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((record) => (
                    <TableRow hover key={record._id}>
                      <TableCell>{formatDate(record.date)}</TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {record.studentId?.name || "Unknown"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {record.studentId?.email || "No email"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(record.status)}
                          label={
                            record.status.charAt(0).toUpperCase() +
                            record.status.slice(1)
                          }
                          size="small"
                          sx={{
                            bgcolor: alpha(getStatusColor(record.status), 0.1),
                            color: getStatusColor(record.status),
                            borderColor: getStatusColor(record.status),
                            fontWeight: 500,
                          }}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            maxWidth: 200,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {record.remarks || "—"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(record.updatedAt)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredRecords.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={setPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>
    </Box>
  );
};

export default AttendanceHistory;
