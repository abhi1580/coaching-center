import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Alert,
  Chip,
  Card,
  CardContent,
  CardActions,
  Stack,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  ExpandMore as ExpandMoreIcon,
  Filter as FilterIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import {
  fetchBatches,
  createBatch,
  updateBatch,
  deleteBatch,
  resetStatus,
} from "../store/slices/batchSlice";
import { fetchStandards } from "../store/slices/standardSlice";
import { fetchSubjects } from "../store/slices/subjectSlice";
import { fetchTeachers } from "../store/slices/teacherSlice";
import RefreshButton from "../components/RefreshButton";
import { alpha } from "@mui/material/styles";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const STATUS_OPTIONS = ["upcoming", "active", "completed", "cancelled"];

const Batches = () => {
  const dispatch = useDispatch();
  const { batches, loading, error, success } = useSelector(
    (state) => state.batches
  );
  const { standards } = useSelector((state) => state.standards);
  const { subjects } = useSelector((state) => state.subjects);
  const { teachers } = useSelector((state) => state.teachers);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    standard: "",
    subject: "",
    startDate: "",
    endDate: "",
    schedule: {
      days: [],
      startTime: "",
      endTime: "",
    },
    capacity: "",
    fees: "",
    status: "upcoming",
    description: "",
    teacher: "",
  });

  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [nameFilter, setNameFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [standardFilter, setStandardFilter] = useState("");
  const [teacherFilter, setTeacherFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Helper function to format error message
  const formatErrorMessage = (error) => {
    if (typeof error === "string") return error;
    if (error?.message) return error.message;
    if (error?.errors) {
      if (Array.isArray(error.errors)) return error.errors.join(", ");
      if (typeof error.errors === "object")
        return Object.values(error.errors).join(", ");
    }
    return "An error occurred";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await dispatch(
          fetchBatches({
            populateEnrolledStudents: true,
          })
        ).unwrap();
        // console.log("Fetched batches:", result);
      } catch (err) {
        console.error("Error fetching batches:", err);
      }
    };

    fetchData();
    dispatch(fetchStandards());
    dispatch(fetchSubjects());
    dispatch(fetchTeachers());
  }, [dispatch]);

  // Add debug logging for batches
  useEffect(() => {
    // console.log("Current batches:", batches);
  }, [batches]);

  useEffect(() => {
    if (success) {
      handleClose();
      // Refresh the batches data after successful operation
      dispatch(fetchBatches());
      dispatch(resetStatus());
    }
  }, [success, dispatch]);

  // Initialize filtered batches when batches data loads
  useEffect(() => {
    setFilteredBatches(getBatchesArray(batches) || []);
  }, [batches]);

  // Apply filters whenever batches data or filter values change
  useEffect(() => {
    const batchesArray = getBatchesArray(batches);
    if (!batchesArray || batchesArray.length === 0) {
      setFilteredBatches([]);
      return;
    }

    let results = [...batchesArray];

    // Filter by name
    if (nameFilter) {
      const searchTerm = nameFilter.toLowerCase();
      results = results.filter((batch) =>
        batch.name?.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by subject
    if (subjectFilter) {
      results = results.filter(
        (batch) =>
          batch.subject?._id === subjectFilter ||
          batch.subject === subjectFilter
      );
    }

    // Filter by standard
    if (standardFilter) {
      results = results.filter(
        (batch) =>
          batch.standard?._id === standardFilter ||
          batch.standard === standardFilter
      );
    }

    // Filter by teacher
    if (teacherFilter) {
      results = results.filter(
        (batch) =>
          batch.teacher?._id === teacherFilter ||
          batch.teacher === teacherFilter
      );
    }

    // Filter by status
    if (statusFilter) {
      results = results.filter((batch) => batch.status === statusFilter);
    }

    setFilteredBatches(results);
  }, [
    batches,
    nameFilter,
    subjectFilter,
    standardFilter,
    teacherFilter,
    statusFilter,
  ]);

  // Add debug logging for related data
  useEffect(() => {
    // console.log("Standards:", standards);
    // console.log("Subjects:", subjects);
    // console.log("Teachers:", teachers);
  }, [standards, subjects, teachers]);

  const handleOpen = (batch = null) => {
    if (batch) {
      // console.log("Opening edit form with batch:", batch);
      setSelectedBatch(batch);

      // Filter subjects based on the batch's standard
      const relatedStandard = standards.find(
        (s) => s._id === batch.standard?._id || s._id === batch.standard
      );
      const standardSubjects = relatedStandard
        ? subjects.filter((subject) =>
            relatedStandard.subjects?.some((s) => (s._id || s) === subject._id)
          )
        : [];
      setFilteredSubjects(standardSubjects);

      // Filter teachers for the batch's subject
      const subjectId = batch.subject?._id || batch.subject;
      const subjectTeachers = teachers.filter((teacher) =>
        teacher.subjects?.some((s) => (s._id || s) === subjectId)
      );
      setFilteredTeachers(subjectTeachers);

      // Format the dates properly
      const startDate = batch.startDate
        ? new Date(batch.startDate).toISOString().split("T")[0]
        : "";
      const endDate = batch.endDate
        ? new Date(batch.endDate).toISOString().split("T")[0]
        : "";

      // Set the form data with proper formatting
      setFormData({
        name: batch.name || "",
        standard: batch.standard?._id || batch.standard || "",
        subject: batch.subject?._id || batch.subject || "",
        startDate: startDate,
        endDate: endDate,
        schedule: {
          days: batch.schedule?.days || [],
          startTime: batch.schedule?.startTime || "",
          endTime: batch.schedule?.endTime || "",
        },
        capacity: batch.capacity || "",
        fees: batch.fees || "",
        status: batch.status || "upcoming",
        description: batch.description || "",
        teacher: batch.teacher?._id || batch.teacher || "",
      });

      // console.log("Set form data for editing:", {
      //   name: batch.name,
      //   standard: batch.standard?._id || batch.standard,
      //   subject: batch.subject?._id || batch.subject,
      //   startDate,
      //   endDate,
      //   schedule: {
      //     days: batch.schedule?.days,
      //     startTime: batch.schedule?.startTime,
      //     endTime: batch.schedule?.endTime,
      //   },
      //   capacity: batch.capacity,
      //   fees: batch.fees,
      //   status: batch.status,
      //   description: batch.description,
      //   teacher: batch.teacher?._id || batch.teacher,
      // });
    } else {
      // Reset form data for creating a new batch
      setSelectedBatch(null);
      setFilteredSubjects([]);
      setFilteredTeachers([]);
      setFormData({
        name: "",
        standard: "",
        subject: "",
        startDate: "",
        endDate: "",
        schedule: {
          days: [],
          startTime: "",
          endTime: "",
        },
        capacity: "",
        fees: "",
        status: "upcoming",
        description: "",
        teacher: "",
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedBatch(null);
    setFilteredSubjects([]);
    setFilteredTeachers([]);
    setFormData({
      name: "",
      standard: "",
      subject: "",
      startDate: "",
      endDate: "",
      schedule: {
        days: [],
        startTime: "",
        endTime: "",
      },
      capacity: "",
      fees: "",
      status: "upcoming",
      description: "",
      teacher: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (selectedBatch) {
        await dispatch(
          updateBatch({ id: selectedBatch._id, data: formData })
        ).unwrap();
      } else {
        await dispatch(createBatch(formData)).unwrap();
      }
    } catch (error) {
      console.error("Error submitting batch:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this batch?")) {
      dispatch(deleteBatch(id));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "standard") {
      // When standard changes, filter subjects based on selected standard
      const standard = standards.find((s) => s._id === value);
      const standardSubjects = standard
        ? subjects.filter((subject) =>
            standard.subjects?.some((s) => (s._id || s) === subject._id)
          )
        : [];
      setFilteredSubjects(standardSubjects);
      setFilteredTeachers([]);
      setFormData({
        ...formData,
        standard: value,
        subject: "",
        teacher: "",
      });
    } else if (name === "subject") {
      // When subject changes, filter teachers based on selected subject
      const subjectTeachers = teachers.filter((teacher) =>
        teacher.subjects?.some((s) => (s._id || s) === value)
      );
      setFilteredTeachers(subjectTeachers);
      setFormData({
        ...formData,
        subject: value,
        teacher: "",
      });
    } else if (name.startsWith("schedule.")) {
      const scheduleField = name.split(".")[1];
      setFormData({
        ...formData,
        schedule: {
          ...formData.schedule,
          [scheduleField]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleDayToggle = (day) => {
    const days = [...formData.schedule.days];
    const index = days.indexOf(day);
    if (index === -1) {
      days.push(day);
    } else {
      days.splice(index, 1);
    }
    setFormData({
      ...formData,
      schedule: {
        ...formData.schedule,
        days,
      },
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "upcoming":
        return "info";
      case "completed":
        return "warning";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const clearFilters = () => {
    setNameFilter("");
    setSubjectFilter("");
    setStandardFilter("");
    setTeacherFilter("");
    setStatusFilter("");
  };

  const handleViewDetails = (batch) => {
    setSelectedBatch(batch);
    setDetailsOpen(true);
  };

  // Helper function to safely get batches array
  const getBatchesArray = (batchesData) => {
    if (!batchesData) return [];
    if (Array.isArray(batchesData)) return batchesData;
    if (batchesData.batches && Array.isArray(batchesData.batches))
      return batchesData.batches;
    return [];
  };

  // Get related entity name
  const getRelatedData = (id, array) => {
    if (!id || !array || !Array.isArray(array)) return "Not assigned";
    const found = array.find((item) => item._id === id);
    return found ? found.name : "Not assigned";
  };

  // Get teacher full name
  const getTeacherName = (teacher) => {
    if (!teacher) return "Not assigned";

    // Handle populated teacher object with firstName/lastName
    if (typeof teacher === "object") {
      const firstName = teacher.firstName || teacher.name || "";
      const lastName = teacher.lastName || "";
      if (firstName || lastName) {
        return `${firstName} ${lastName}`.trim();
      }
    }

    // Handle teacher ID by looking up in teachers array
    if (typeof teacher === "string") {
      const foundTeacher = teachers.find((t) => t._id === teacher);
      if (foundTeacher) {
        const firstName = foundTeacher.firstName || foundTeacher.name || "";
        const lastName = foundTeacher.lastName || "";
        return `${firstName} ${lastName}`.trim();
      }
    }

    return "Not assigned";
  };

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return "";
    try {
      // Handle different formats
      if (timeString.includes(":")) {
        const [hours, minutes] = timeString.split(":");
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? "PM" : "AM";
        const hour12 = hour % 12 || 12; // Convert 0 to 12 for 12 AM
        return `${hour12}:${minutes} ${ampm}`;
      }
      return timeString;
    } catch (error) {
      console.error("Error formatting time:", error);
      return timeString;
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  // Add loadAllData function for refresh button
  const loadAllData = useCallback(() => {
    dispatch(fetchBatches());
    dispatch(fetchStandards());
    dispatch(fetchSubjects());
    dispatch(fetchTeachers());
  }, [dispatch]);

  // Get students count safely for a batch
  const getStudentsCount = (batch) => {
    let enrolledCount = 0;

    // Check if enrolledStudents exists and is an array (main way students are tracked in batch model)
    if (batch.enrolledStudents && Array.isArray(batch.enrolledStudents)) {
      enrolledCount = batch.enrolledStudents.length;
    }
    // Check if students exists and is an array (secondary way)
    else if (batch.students && Array.isArray(batch.students)) {
      enrolledCount = batch.students.length;
    }
    // Check if studentCount property exists (API might provide this)
    else if (typeof batch.studentCount === "number") {
      enrolledCount = batch.studentCount;
    }

    const capacity = batch.capacity ? parseInt(batch.capacity, 10) : 0;
    const remainingSeats = Math.max(0, capacity - enrolledCount);

    return {
      enrolled: enrolledCount,
      capacity: capacity,
      remaining: remainingSeats,
    };
  };

  // Get color for remaining seats
  const getRemainingSeatsColor = (batch) => {
    const { remaining, capacity } = getStudentsCount(batch);

    if (remaining === 0) return "error";
    if (capacity > 0) {
      const percentRemaining = (remaining / capacity) * 100;
      if (percentRemaining <= 10) return "error";
      if (percentRemaining <= 25) return "warning";
    }
    return "success";
  };

  if (loading && getBatchesArray(batches).length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          mb: 3,
          gap: { xs: 1, sm: 0 },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" } }}
          >
            Batches
          </Typography>
          <RefreshButton
            onRefresh={loadAllData}
            tooltip="Refresh batches data"
            sx={{ ml: 1 }}
          />
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Batch
        </Button>
      </Box>

      {/* Filters */}
      <Accordion
        expanded={filtersExpanded}
        onChange={() => setFiltersExpanded(!filtersExpanded)}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FilterIcon color="primary" />
            <Typography>Filters</Typography>
            {(nameFilter ||
              subjectFilter ||
              standardFilter ||
              teacherFilter ||
              statusFilter) && (
              <Chip
                label={`${[
                  nameFilter ? 1 : 0,
                  subjectFilter ? 1 : 0,
                  standardFilter ? 1 : 0,
                  teacherFilter ? 1 : 0,
                  statusFilter ? 1 : 0,
                ].reduce((a, b) => a + b, 0)} active`}
                size="small"
                color="primary"
              />
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Search by Name"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: nameFilter && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setNameFilter("")}
                      >
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                select
                fullWidth
                label="Filter by Subject"
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
              >
                <MenuItem value="">All Subjects</MenuItem>
                {subjects.map((subject) => (
                  <MenuItem key={subject._id} value={subject._id}>
                    {subject.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                select
                fullWidth
                label="Filter by Standard"
                value={standardFilter}
                onChange={(e) => setStandardFilter(e.target.value)}
              >
                <MenuItem value="">All Standards</MenuItem>
                {standards.map((standard) => (
                  <MenuItem key={standard._id} value={standard._id}>
                    {standard.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                select
                fullWidth
                label="Filter by Teacher"
                value={teacherFilter}
                onChange={(e) => setTeacherFilter(e.target.value)}
              >
                <MenuItem value="">All Teachers</MenuItem>
                {teachers.map((teacher) => (
                  <MenuItem key={teacher._id} value={teacher._id}>
                    {teacher.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                select
                fullWidth
                label="Filter by Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={clearFilters}
                  disabled={
                    !nameFilter &&
                    !subjectFilter &&
                    !standardFilter &&
                    !teacherFilter &&
                    !statusFilter
                  }
                >
                  Clear Filters
                </Button>
              </Box>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Results count */}
      <Box
        sx={{
          mb: 2,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: { xs: 1, sm: 0 },
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Showing {filteredBatches.length} of {getBatchesArray(batches).length}{" "}
          batches
        </Typography>
        {filteredBatches.length === 0 &&
          getBatchesArray(batches).length > 0 && (
            <Alert
              severity="info"
              sx={{ py: 0, width: { xs: "100%", sm: "auto" } }}
            >
              No batches match your filter criteria
            </Alert>
          )}
      </Box>

      {isMobile ? (
        // Mobile view - cards instead of table
        <Stack spacing={2}>
          {filteredBatches.length > 0 ? (
            filteredBatches.map((batch) => (
              <Card
                key={batch._id}
                sx={{
                  width: "100%",
                  borderRadius: 2,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: 6,
                    transform: "translateY(-2px)",
                  },
                }}
                elevation={2}
              >
                <CardContent sx={{ pb: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant="h6"
                      component="div"
                      sx={{
                        fontSize: "1.1rem",
                        fontWeight: 600,
                        color: theme.palette.primary.main,
                      }}
                    >
                      {batch.name}
                    </Typography>
                    <Chip
                      label={
                        batch.status.charAt(0).toUpperCase() +
                        batch.status.slice(1)
                      }
                      size="small"
                      color={getStatusColor(batch.status)}
                      sx={{ ml: 1 }}
                    />
                  </Box>

                  <Box
                    sx={{
                      mt: 2,
                      display: "flex",
                      flexDirection: "column",
                      gap: 1.5,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mr: 1, fontWeight: 600, minWidth: "80px" }}
                      >
                        Standard:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {batch.standard?.name || "Not specified"}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mr: 1, fontWeight: 600, minWidth: "80px" }}
                      >
                        Subject:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {batch.subject?.name || "Not specified"}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mr: 1, fontWeight: 600, minWidth: "80px" }}
                      >
                        Teacher:
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <PersonIcon
                          fontSize="small"
                          color="primary"
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="body2" fontWeight="medium">
                          {getTeacherName(batch.teacher)}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mr: 1, fontWeight: 600, minWidth: "80px" }}
                      >
                        Schedule:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {batch.schedule
                          ? `${formatTime(
                              batch.schedule.startTime
                            )} - ${formatTime(batch.schedule.endTime)}, ${
                              batch.schedule.days?.join(", ") || "No days set"
                            }`
                          : "Not set"}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mr: 1, fontWeight: 600, minWidth: "80px" }}
                      >
                        Students:
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 0.8,
                        }}
                      >
                        <Chip
                          label={`${getStudentsCount(batch).enrolled} enrolled`}
                          size="small"
                          color={
                            getStudentsCount(batch).enrolled > 0
                              ? "primary"
                              : "default"
                          }
                          sx={{ fontWeight: 500 }}
                        />
                        <Chip
                          label={`${
                            getStudentsCount(batch).remaining
                          } seats remaining`}
                          size="small"
                          color={getRemainingSeatsColor(batch)}
                          sx={{ fontWeight: 500 }}
                        />
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
                <CardActions
                  sx={{
                    px: 2,
                    pb: 2,
                    pt: 1,
                    justifyContent: "flex-start",
                    gap: 1,
                  }}
                >
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<VisibilityIcon />}
                    onClick={() => handleViewDetails(batch)}
                  >
                    View
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    startIcon={<EditIcon />}
                    onClick={() => handleOpen(batch)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDelete(batch._id)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            ))
          ) : (
            <Typography align="center" sx={{ py: 3 }}>
              No batches found
            </Typography>
          )}
        </Stack>
      ) : (
        // Desktop/tablet view - table
        <TableContainer
          component={Paper}
          sx={{ borderRadius: 2, overflow: "hidden" }}
        >
          <Table size={isTablet ? "small" : "medium"}>
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  "&:hover": {
                    backgroundColor: theme.palette.primary.main,
                  },
                }}
              >
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                  }}
                >
                  Name
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                  }}
                >
                  Standard
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                  }}
                >
                  Subject
                </TableCell>
                {!isTablet && (
                  <TableCell
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Teacher
                  </TableCell>
                )}
                {!isTablet && (
                  <TableCell
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Schedule
                  </TableCell>
                )}
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                  }}
                >
                  Students
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                  }}
                >
                  Status
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBatches.length > 0 ? (
                filteredBatches.map((batch) => (
                  <TableRow
                    key={batch._id}
                    sx={{
                      "&:nth-of-type(odd)": {
                        backgroundColor: theme.palette.action.hover,
                      },
                      "&:hover": {
                        backgroundColor: alpha(
                          theme.palette.primary.light,
                          0.1
                        ),
                      },
                      cursor: "pointer",
                    }}
                    onClick={() => handleViewDetails(batch)}
                  >
                    <TableCell sx={{ fontWeight: 500, whiteSpace: "nowrap" }}>
                      {batch.name || "—"}
                    </TableCell>
                    <TableCell>{batch.standard?.name || "—"}</TableCell>
                    <TableCell>{batch.subject?.name || "—"}</TableCell>
                    {!isTablet && (
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <PersonIcon
                            fontSize="small"
                            color="primary"
                            sx={{ mr: 1 }}
                          />
                          <Typography variant="body2" fontWeight="medium">
                            {getTeacherName(batch.teacher)}
                          </Typography>
                        </Box>
                      </TableCell>
                    )}
                    {!isTablet && (
                      <TableCell>
                        {batch.schedule
                          ? `${formatTime(
                              batch.schedule.startTime
                            )} - ${formatTime(batch.schedule.endTime)}, ${
                              batch.schedule.days?.join(", ") || ""
                            }`
                          : "—"}
                      </TableCell>
                    )}
                    <TableCell sx={{ fontWeight: "medium" }}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 0.8,
                        }}
                      >
                        <Chip
                          label={`${getStudentsCount(batch).enrolled} enrolled`}
                          size="small"
                          color={
                            getStudentsCount(batch).enrolled > 0
                              ? "primary"
                              : "default"
                          }
                          sx={{ fontWeight: 500 }}
                        />
                        <Chip
                          label={`${
                            getStudentsCount(batch).remaining
                          } seats remaining`}
                          size="small"
                          color={getRemainingSeatsColor(batch)}
                          sx={{ fontWeight: 500 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          batch.status.charAt(0).toUpperCase() +
                          batch.status.slice(1)
                        }
                        size="small"
                        color={getStatusColor(batch.status)}
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: 1,
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(batch);
                          }}
                          title="View Details"
                          sx={{
                            color: theme.palette.primary.main,
                            "&:hover": {
                              backgroundColor: alpha(
                                theme.palette.primary.main,
                                0.1
                              ),
                            },
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpen(batch);
                          }}
                          title="Edit Batch"
                          sx={{
                            color: theme.palette.primary.main,
                            "&:hover": {
                              backgroundColor: alpha(
                                theme.palette.primary.main,
                                0.1
                              ),
                            },
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(batch._id);
                          }}
                          title="Delete Batch"
                          sx={{
                            color: theme.palette.error.main,
                            "&:hover": {
                              backgroundColor: alpha(
                                theme.palette.error.main,
                                0.1
                              ),
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={isTablet ? 6 : 8} align="center">
                    No batches found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 2,
            overflow: "hidden",
          },
        }}
      >
        {selectedBatch && (
          <>
            <DialogTitle
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: theme.palette.primary.main,
                color: "white",
                p: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography
                  variant="h6"
                  component="div"
                  sx={{ flexGrow: 1, fontWeight: 600 }}
                >
                  {selectedBatch.name}
                </Typography>
              </Box>
              <Chip
                label={
                  selectedBatch.status.charAt(0).toUpperCase() +
                  selectedBatch.status.slice(1)
                }
                size="small"
                color={getStatusColor(selectedBatch.status)}
                sx={{
                  color: "white",
                  backgroundColor: theme.palette.primary.dark,
                  fontWeight: 500,
                }}
              />
            </DialogTitle>
            <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      height: "100%",
                      border: `1px solid ${alpha(
                        theme.palette.primary.main,
                        0.1
                      )}`,
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      fontWeight="bold"
                      color="primary"
                      sx={{
                        pb: 1,
                        borderBottom: `1px solid ${alpha(
                          theme.palette.primary.main,
                          0.2
                        )}`,
                      }}
                    >
                      Batch Information
                    </Typography>
                    <Box
                      sx={{
                        mt: 2,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          pb: 1,
                          borderBottom: `1px solid ${alpha(
                            theme.palette.divider,
                            0.3
                          )}`,
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontWeight={500}
                        >
                          Standard:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {selectedBatch.standard?.name || "Not specified"}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          pb: 1,
                          borderBottom: `1px solid ${alpha(
                            theme.palette.divider,
                            0.3
                          )}`,
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontWeight={500}
                        >
                          Subject:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {selectedBatch.subject?.name || "Not specified"}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          pb: 1,
                          borderBottom: `1px solid ${alpha(
                            theme.palette.divider,
                            0.3
                          )}`,
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontWeight={500}
                        >
                          Teacher:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {getTeacherName(selectedBatch.teacher)}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          pb: 1,
                          borderBottom: `1px solid ${alpha(
                            theme.palette.divider,
                            0.3
                          )}`,
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontWeight={500}
                        >
                          Duration:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {`${formatDate(
                            selectedBatch.startDate
                          )} - ${formatDate(selectedBatch.endDate)}`}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          pb: 1,
                          borderBottom: `1px solid ${alpha(
                            theme.palette.divider,
                            0.3
                          )}`,
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontWeight={500}
                        >
                          Capacity:
                        </Typography>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {selectedBatch.capacity
                              ? `${getStudentsCount(selectedBatch).enrolled}/${
                                  selectedBatch.capacity
                                }`
                              : "Not specified"}
                          </Typography>
                          {selectedBatch.capacity && (
                            <Box sx={{ mt: 0.5 }}>
                              <Chip
                                label={`${
                                  getStudentsCount(selectedBatch).remaining
                                } seats remaining`}
                                size="small"
                                color={getRemainingSeatsColor(selectedBatch)}
                                sx={{ fontWeight: 500, fontSize: "0.7rem" }}
                              />
                            </Box>
                          )}
                        </Box>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          pb: 1,
                          borderBottom: `1px solid ${alpha(
                            theme.palette.divider,
                            0.3
                          )}`,
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontWeight={500}
                        >
                          Fees:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {selectedBatch.fees
                            ? `$${selectedBatch.fees}`
                            : "Not specified"}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      height: "100%",
                      border: `1px solid ${alpha(
                        theme.palette.primary.main,
                        0.1
                      )}`,
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      fontWeight="bold"
                      color="primary"
                      sx={{
                        pb: 1,
                        borderBottom: `1px solid ${alpha(
                          theme.palette.primary.main,
                          0.2
                        )}`,
                      }}
                    >
                      Schedule
                    </Typography>
                    <Box
                      sx={{
                        mt: 2,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          pb: 1,
                          borderBottom: `1px solid ${alpha(
                            theme.palette.divider,
                            0.3
                          )}`,
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontWeight={500}
                        >
                          Days:
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 0.5,
                            justifyContent: "flex-end",
                          }}
                        >
                          {selectedBatch.schedule?.days &&
                          selectedBatch.schedule.days.length > 0 ? (
                            selectedBatch.schedule.days.map((day) => (
                              <Chip
                                key={day}
                                label={day}
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ height: 24, fontWeight: 500 }}
                              />
                            ))
                          ) : (
                            <Typography variant="body2">
                              Not specified
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          pb: 1,
                          borderBottom: `1px solid ${alpha(
                            theme.palette.divider,
                            0.3
                          )}`,
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontWeight={500}
                        >
                          Time:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {selectedBatch.schedule?.startTime &&
                          selectedBatch.schedule?.endTime
                            ? `${formatTime(
                                selectedBatch.schedule.startTime
                              )} - ${formatTime(
                                selectedBatch.schedule.endTime
                              )}`
                            : "Not specified"}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
                {selectedBatch.description && (
                  <Grid item xs={12}>
                    <Paper
                      elevation={1}
                      sx={{
                        p: 2.5,
                        borderRadius: 2,
                        border: `1px solid ${alpha(
                          theme.palette.primary.main,
                          0.1
                        )}`,
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        gutterBottom
                        fontWeight="bold"
                        color="primary"
                        sx={{
                          pb: 1,
                          borderBottom: `1px solid ${alpha(
                            theme.palette.primary.main,
                            0.2
                          )}`,
                        }}
                      >
                        Description
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1.5 }}>
                        {selectedBatch.description}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      border: `1px solid ${alpha(
                        theme.palette.primary.main,
                        0.1
                      )}`,
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      fontWeight="bold"
                      color="primary"
                      sx={{
                        pb: 1,
                        borderBottom: `1px solid ${alpha(
                          theme.palette.primary.main,
                          0.2
                        )}`,
                      }}
                    >
                      Students ({getStudentsCount(selectedBatch).enrolled})
                    </Typography>
                    {selectedBatch.enrolledStudents &&
                    selectedBatch.enrolledStudents.length > 0 ? (
                      <TableContainer sx={{ mt: 1.5 }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow
                              sx={{
                                backgroundColor: alpha(
                                  theme.palette.primary.main,
                                  0.1
                                ),
                              }}
                            >
                              <TableCell sx={{ fontWeight: 600 }}>
                                Name
                              </TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>
                                Email
                              </TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>
                                Phone
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedBatch.enrolledStudents.map((student) => (
                              <TableRow
                                key={student._id}
                                sx={{
                                  "&:hover": {
                                    backgroundColor: alpha(
                                      theme.palette.primary.light,
                                      0.05
                                    ),
                                  },
                                }}
                              >
                                <TableCell>
                                  {student.name ||
                                    `${student.firstName || ""} ${
                                      student.lastName || ""
                                    }`}
                                </TableCell>
                                <TableCell>{student.email}</TableCell>
                                <TableCell>{student.phone}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : selectedBatch.students &&
                      selectedBatch.students.length > 0 ? (
                      <TableContainer sx={{ mt: 1.5 }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow
                              sx={{
                                backgroundColor: alpha(
                                  theme.palette.primary.main,
                                  0.1
                                ),
                              }}
                            >
                              <TableCell sx={{ fontWeight: 600 }}>
                                Name
                              </TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>
                                Email
                              </TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>
                                Phone
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedBatch.students.map((student) => (
                              <TableRow
                                key={student._id}
                                sx={{
                                  "&:hover": {
                                    backgroundColor: alpha(
                                      theme.palette.primary.light,
                                      0.05
                                    ),
                                  },
                                }}
                              >
                                <TableCell>
                                  {student.name ||
                                    `${student.firstName || ""} ${
                                      student.lastName || ""
                                    }`}
                                </TableCell>
                                <TableCell>{student.email}</TableCell>
                                <TableCell>{student.phone}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Box
                        sx={{
                          mt: 2,
                          p: 2,
                          borderRadius: 1,
                          backgroundColor: alpha(
                            theme.palette.primary.light,
                            0.05
                          ),
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary" }}
                        >
                          No students enrolled in this batch yet.
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<EditIcon />}
                onClick={() => {
                  setDetailsOpen(false);
                  handleOpen(selectedBatch);
                }}
                sx={{ borderRadius: 2 }}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => {
                  setDetailsOpen(false);
                  handleDelete(selectedBatch._id);
                }}
                sx={{ borderRadius: 2 }}
              >
                Delete
              </Button>
              <Button
                onClick={() => setDetailsOpen(false)}
                variant="contained"
                sx={{ ml: "auto", borderRadius: 2 }}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Add/Edit Batch Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 2,
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: "white",
            p: 2,
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            {selectedBatch ? "Edit Batch" : "Add New Batch"}
          </Typography>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Fill in the details below to{" "}
                {selectedBatch ? "update" : "create"} a batch. Fields marked
                with * are required.
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography
                  variant="subtitle1"
                  color="primary"
                  fontWeight={600}
                  gutterBottom
                >
                  Basic Information
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="name"
                  label="Batch Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  InputProps={{
                    sx: { borderRadius: 1 },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required variant="outlined">
                  <InputLabel>Standard</InputLabel>
                  <Select
                    name="standard"
                    value={formData.standard}
                    onChange={handleChange}
                    label="Standard"
                    sx={{ borderRadius: 1 }}
                  >
                    {standards.map((standard) => (
                      <MenuItem key={standard._id} value={standard._id}>
                        {standard.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl
                  fullWidth
                  required
                  disabled={!formData.standard}
                  variant="outlined"
                >
                  <InputLabel>Subject</InputLabel>
                  <Select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    label="Subject"
                    sx={{ borderRadius: 1 }}
                  >
                    {filteredSubjects.map((subject) => (
                      <MenuItem key={subject._id} value={subject._id}>
                        {subject.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl
                  fullWidth
                  disabled={!formData.subject}
                  variant="outlined"
                >
                  <InputLabel>Teacher</InputLabel>
                  <Select
                    name="teacher"
                    value={formData.teacher}
                    onChange={handleChange}
                    label="Teacher"
                    sx={{ borderRadius: 1 }}
                  >
                    {filteredTeachers.map((teacher) => (
                      <MenuItem key={teacher._id} value={teacher._id}>
                        {teacher.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sx={{ mt: 1 }}>
                <Typography
                  variant="subtitle1"
                  color="primary"
                  fontWeight={600}
                  gutterBottom
                >
                  Date and Time
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="startDate"
                  label="Start Date"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  required
                  variant="outlined"
                  InputProps={{
                    sx: { borderRadius: 1 },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="endDate"
                  label="End Date"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  required
                  variant="outlined"
                  InputProps={{
                    sx: { borderRadius: 1 },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    backgroundColor: alpha(theme.palette.primary.light, 0.05),
                    border: `1px solid ${alpha(
                      theme.palette.primary.main,
                      0.1
                    )}`,
                    mb: 1,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    color="primary"
                    fontWeight={600}
                    gutterBottom
                  >
                    Schedule Days
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}
                  >
                    {DAYS_OF_WEEK.map((day) => (
                      <Chip
                        key={day}
                        label={day}
                        onClick={() => handleDayToggle(day)}
                        color={
                          formData.schedule.days.includes(day)
                            ? "primary"
                            : "default"
                        }
                        variant={
                          formData.schedule.days.includes(day)
                            ? "filled"
                            : "outlined"
                        }
                        sx={{ fontWeight: 500 }}
                      />
                    ))}
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="schedule.startTime"
                  label="Start Time"
                  type="time"
                  value={formData.schedule.startTime}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  required
                  variant="outlined"
                  InputProps={{
                    sx: { borderRadius: 1 },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="schedule.endTime"
                  label="End Time"
                  type="time"
                  value={formData.schedule.endTime}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  required
                  variant="outlined"
                  InputProps={{
                    sx: { borderRadius: 1 },
                  }}
                />
              </Grid>

              <Grid item xs={12} sx={{ mt: 1 }}>
                <Typography
                  variant="subtitle1"
                  color="primary"
                  fontWeight={600}
                  gutterBottom
                >
                  Capacity and Fees
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  name="capacity"
                  label="Capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{
                    inputProps: { min: 1 },
                    sx: { borderRadius: 1 },
                  }}
                  helperText="Maximum number of students that can be enrolled"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="fees"
                  label="Fees"
                  type="number"
                  value={formData.fees}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                    sx: { borderRadius: 1 },
                  }}
                />
              </Grid>

              <Grid item xs={12} sx={{ mt: 1 }}>
                <Typography
                  variant="subtitle1"
                  color="primary"
                  fontWeight={600}
                  gutterBottom
                >
                  Additional Information
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required variant="outlined">
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    label="Status"
                    sx={{ borderRadius: 1 }}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="description"
                  label="Description"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{
                    sx: { borderRadius: 1 },
                  }}
                  placeholder="Add any additional details about this batch"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
            <Button
              onClick={handleClose}
              disabled={submitting}
              sx={{ borderRadius: 2 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={submitting}
              sx={{ borderRadius: 2, px: 3 }}
            >
              {submitting ? (
                <CircularProgress size={24} />
              ) : selectedBatch ? (
                "Update Batch"
              ) : (
                "Create Batch"
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Batches;
