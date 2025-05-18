import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  useTheme,
  alpha,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
  InputAdornment,
  Button,
  Breadcrumbs,
  Link,
} from "@mui/material";
import {
  CalendarToday,
  Check,
  Close,
  ArrowBack,
  FilterList,
  Clear,
  Search,
  Home,
  Book,
  Assignment,
} from "@mui/icons-material";
import { fetchBatches } from "../../store/slices/batchSlice";
import { studentService } from "../../services/api";
import { useNavigate } from "react-router-dom";
import RefreshButton from "../../components/common/RefreshButton";

const StudentAttendance = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [studentData, setStudentData] = useState(null);

  // Filter states
  const [batchFilter, setBatchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [overallAttendance, setOverallAttendance] = useState({
    total: 0,
    present: 0,
    absent: 0,
    percentage: 0,
  });

  // Load data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("Fetching student attendance data for user:", user?.id);

        // Fetch student details to get batches info
        const studentResponse = await studentService.getStudentDetails(
          user?.id
        );
        console.log("Student details response:", studentResponse);

        // Extract the actual student data from the nested response
        const actualStudentData = studentResponse.data.data;
        console.log("Actual student data:", actualStudentData);

        if (!actualStudentData) {
          throw new Error("Invalid data structure in student response");
        }

        setStudentData(actualStudentData);

        // Fetch student attendance - pass proper parameters
        const attendanceResponse = await studentService.getStudentAttendance(
          user?.id,
          batchFilter || null, // Pass the current batch filter if available
          null, // startDate - not used in this component
          null // endDate - not used in this component
        );
        console.log("Attendance response:", attendanceResponse);

        // Extract the attendance data from the nested structure
        // The API response structure is { data: { data: actualAttendanceData } }
        const actualAttendanceData = attendanceResponse.data.data || [];
        console.log("Actual attendance data:", actualAttendanceData);

        // If no attendance data is available yet, initialize with empty array
        setAttendanceData(actualAttendanceData);
        setFilteredAttendance(actualAttendanceData);

        // Calculate overall attendance
        calculateOverallAttendance(actualAttendanceData);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to load attendance data");
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchData();
    }
  }, [dispatch, user?.id, batchFilter]);

  // Apply filters whenever filter values change
  useEffect(() => {
    if (!Array.isArray(attendanceData)) {
      console.error("attendanceData is not an array:", attendanceData);
      setFilteredAttendance([]);
      calculateOverallAttendance([]);
      return;
    }

    console.log("Applying filters to attendance data:", attendanceData);
    let results = [...attendanceData];

    // Filter by batch
    if (batchFilter) {
      results = results.filter((record) => record.batch === batchFilter);
    }

    // Filter by status
    if (statusFilter) {
      results = results.filter((record) => record.status === statusFilter);
    }

    // Filter by date
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      results = results.filter((record) => {
        const recordDate = new Date(record.date);
        return recordDate.toDateString() === filterDate.toDateString();
      });
    }

    console.log("Filtered results:", results);
    setFilteredAttendance(results);

    // Calculate overall attendance for filtered data
    calculateOverallAttendance(results);
  }, [attendanceData, batchFilter, statusFilter, dateFilter]);

  // Helper function to calculate overall attendance
  const calculateOverallAttendance = (records) => {
    if (!Array.isArray(records)) {
      console.error(
        "Records is not an array in calculateOverallAttendance:",
        records
      );
      setOverallAttendance({
        total: 0,
        present: 0,
        absent: 0,
        percentage: 0,
      });
      return;
    }

    const total = records.length;
    const present = records.filter(
      (record) => record.status === "present"
    ).length;
    const absent = records.filter(
      (record) => record.status === "absent"
    ).length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    setOverallAttendance({
      total,
      present,
      absent,
      percentage,
    });
  };

  // Helper function to format date
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
      return dateString;
    }
  };

  // Helper function to get batch name from ID
  const getBatchName = (batchId) => {
    if (!studentData?.batches) return "Unknown Batch";

    const batch = studentData.batches.find((b) => b._id === batchId);
    return batch?.name || "Unknown Batch";
  };

  // Helper function to clear all filters
  const clearFilters = () => {
    setBatchFilter("");
    setStatusFilter("");
    setDateFilter("");
  };

  // Helper function to get status chip
  const getStatusChip = (status) => {
    if (status === "present") {
      return (
        <Chip
          icon={<Check fontSize="small" />}
          label="Present"
          size="small"
          color="success"
          sx={{ fontWeight: 500 }}
        />
      );
    } else if (status === "absent") {
      return (
        <Chip
          icon={<Close fontSize="small" />}
          label="Absent"
          size="small"
          color="error"
          sx={{ fontWeight: 500 }}
        />
      );
    } else {
      return (
        <Chip
          label={status || "Unknown"}
          size="small"
          color="default"
          sx={{ fontWeight: 500, textTransform: "capitalize" }}
        />
      );
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
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

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
          <Assignment sx={{ mr: 0.5 }} fontSize="small" />
          Attendance
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
          Attendance History
        </Typography>
                  {/* Removed Back to Dashboard button since we have breadcrumbs */}
      </Box>

      {/* Attendance Summary */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card
            sx={{
              borderRadius: 2,
              bgcolor: alpha(theme.palette.info.light, 0.1),
            }}
          >
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total Classes
              </Typography>
              <Typography variant="h3" fontWeight="bold" color="info.main">
                {overallAttendance.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card
            sx={{
              borderRadius: 2,
              bgcolor: alpha(theme.palette.success.light, 0.1),
            }}
          >
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Present
              </Typography>
              <Typography variant="h3" fontWeight="bold" color="success.main">
                {overallAttendance.present}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card
            sx={{
              borderRadius: 2,
              bgcolor: alpha(theme.palette.error.light, 0.1),
            }}
          >
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Absent
              </Typography>
              <Typography variant="h3" fontWeight="bold" color="error.main">
                {overallAttendance.absent}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card
            sx={{
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.light, 0.1),
            }}
          >
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Attendance Rate
              </Typography>
              <Typography
                variant="h3"
                fontWeight="bold"
                color={
                  overallAttendance.percentage >= 90
                    ? "success.main"
                    : overallAttendance.percentage >= 75
                      ? "info.main"
                      : overallAttendance.percentage >= 60
                        ? "warning.main"
                        : "error.main"
                }
              >
                {overallAttendance.percentage}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <FilterList color="primary" sx={{ mr: 1 }} />
          <Typography variant="subtitle1" fontWeight="bold">
            Filters
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Batch</InputLabel>
              <Select
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
                label="Batch"
              >
                <MenuItem value="">All Batches</MenuItem>
                {studentData?.batches?.map((batch) => (
                  <MenuItem key={batch._id} value={batch._id}>
                    {batch.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="present">Present</MenuItem>
                <MenuItem value="absent">Absent</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              label="Date"
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              InputProps={{
                endAdornment: dateFilter && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setDateFilter("")}
                      edge="end"
                    >
                      <Clear fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Box sx={{ display: "flex", gap: 1 }}>
            <RefreshButton
              onClick={() => {
                setLoading(true);
                studentService
                  .getStudentAttendance(
                    user?.id,
                    batchFilter || null,
                    null,
                    null
                  )
                  .then((response) => {
                    console.log("Refresh attendance response:", response);
                    // Extract the actual attendance data from the nested structure
                    const actualData = response.data.data || [];
                    console.log(
                      "Refreshed actual attendance data:",
                      actualData
                    );

                    setAttendanceData(actualData);
                    setFilteredAttendance(actualData);
                    calculateOverallAttendance(actualData);
                  })
                  .catch((err) => {
                    console.error("Error refreshing attendance:", err);
                    setError(
                      err.message || "Failed to refresh attendance data"
                    );
                  })
                  .finally(() => setLoading(false));
              }}
              loading={loading}
            />

            <Button
              variant="outlined"
              startIcon={<Clear />}
              onClick={clearFilters}
              disabled={!batchFilter && !statusFilter && !dateFilter}
            >
              Clear Filters
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Attendance Records Table */}
      <Paper sx={{ borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead
              sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}
            >
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Batch</TableCell>
                <TableCell>Topic</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell>Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAttendance.length > 0 ? (
                filteredAttendance.map((record) => (
                  <TableRow key={record._id} hover>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <CalendarToday fontSize="small" color="action" />
                        <Typography variant="body2">
                          {formatDate(record.date)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{getBatchName(record.batch)}</TableCell>
                    <TableCell>{record.topic || "General"}</TableCell>
                    <TableCell align="center">
                      {getStatusChip(record.status)}
                    </TableCell>
                    <TableCell>{record.notes || "-"}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    <Typography color="text.secondary">
                      {attendanceData.length > 0
                        ? "No records match the selected filters"
                        : "No attendance records found"}
                    </Typography>
                    {attendanceData.length > 0 &&
                      (batchFilter || statusFilter || dateFilter) && (
                        <Button
                          variant="text"
                          size="small"
                          onClick={clearFilters}
                          sx={{ mt: 1 }}
                          startIcon={<Clear fontSize="small" />}
                        >
                          Clear Filters
                        </Button>
                      )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default StudentAttendance;
