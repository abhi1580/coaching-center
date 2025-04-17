import {
  Add as AddIcon,
  AttachMoney as AttachMoneyIcon,
  Cancel as CancelIcon,
  Clear as ClearIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  ErrorOutline as ErrorOutlineIcon,
  Event as EventIcon,
  ExpandMore as ExpandMoreIcon,
  Female as FemaleIcon,
  FilterList as FilterIcon,
  History as HistoryIcon,
  LocationOn as LocationOnIcon,
  Male as MaleIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Save as SaveIcon,
  School as SchoolIcon,
  Search as SearchIcon,
  Warning as WarningIcon,
  Work as WorkIcon,
} from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Form, Formik } from "formik";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import RefreshButton from "../../components/RefreshButton";
import { fetchSubjects } from "../../store/slices/subjectSlice";
import {
  createTeacher,
  deleteTeacher,
  fetchTeachers,
  updateTeacher,
} from "../../store/slices/teacherSlice";

const validationSchema = (isEdit) =>
  Yup.object({
    name: Yup.string().required("Name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: isEdit
      ? Yup.string()
          .nullable()
          .test(
            "password-optional",
            "Password must be at least 6 characters",
            function (value) {
              return !value || value === "" || value.length >= 6;
            }
          )
      : Yup.string()
          .required("Password is required")
          .min(6, "Password must be at least 6 characters"),
    phone: Yup.string()
      .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
      .required("Phone number is required"),
    gender: Yup.string().required("Gender is required"),
    address: Yup.string().required("Address is required"),
    subjects: Yup.array()
      .of(Yup.string())
      .min(1, "At least one subject is required"),
    qualification: Yup.string().required("Qualification is required"),
    experience: Yup.number()
      .required("Experience is required")
      .min(0, "Experience cannot be negative"),
    joiningDate: Yup.date().required("Joining date is required"),
    salary: Yup.number()
      .required("Salary is required")
      .min(0, "Salary must be a positive number"),
    status: Yup.string().required("Status is required"),
  });

const Teachers = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const { subjects } = useSelector((state) => state.subjects);
  const {
    teachers,
    loading,
    error: reduxError,
  } = useSelector((state) => state.teachers);
  const [open, setOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Filter state
  const [nameFilter, setNameFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [qualificationFilter, setQualificationFilter] = useState("");
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [filterExpanded, setFilterExpanded] = useState(false);

  // Add state for delete confirmation
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0); // Add state for triggering re-renders

  // Clear error and success messages
  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  // Add loadAllData function for refresh button
  const loadAllData = useCallback(() => {
    clearMessages();
    dispatch(fetchTeachers());
    dispatch(fetchSubjects());
    setReloadKey((prevKey) => prevKey + 1); // Increment reload key to force re-render
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchTeachers());
    dispatch(fetchSubjects());
  }, [dispatch, reloadKey]); // Add reloadKey as dependency to trigger refetch

  // Initialize filtered teachers when teachers data loads
  useEffect(() => {
    setFilteredTeachers(teachers || []);
    // Clear any Redux errors
    if (reduxError) {
      setError(reduxError);
    }
  }, [teachers, reduxError]);

  // Auto-clear success messages after 3 seconds
  useEffect(() => {
    let timer;
    if (success) {
      timer = setTimeout(() => {
        setSuccess(null);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [success]);

  // Auto-clear error messages after 5 seconds
  useEffect(() => {
    let timer;
    if (error) {
      timer = setTimeout(() => {
        setError(null);
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [error]);

  // Apply filters whenever teachers data or filter values change
  useEffect(() => {
    if (!teachers || teachers.length === 0) {
      setFilteredTeachers([]);
      return;
    }

    let results = [...teachers];

    // Filter by name
    if (nameFilter) {
      const searchTerm = nameFilter.toLowerCase();
      results = results.filter(
        (teacher) =>
          teacher.name.toLowerCase().includes(searchTerm) ||
          teacher.email.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by subject
    if (subjectFilter) {
      results = results.filter(
        (teacher) =>
          teacher.subjects && teacher.subjects.includes(subjectFilter)
      );
    }

    // Filter by status
    if (statusFilter) {
      results = results.filter(
        (teacher) => teacher.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Filter by qualification
    if (qualificationFilter) {
      const searchQual = qualificationFilter.toLowerCase();
      results = results.filter(
        (teacher) =>
          teacher.qualification &&
          teacher.qualification.toLowerCase().includes(searchQual)
      );
    }

    setFilteredTeachers(results);
  }, [teachers, nameFilter, subjectFilter, statusFilter, qualificationFilter]);

  const clearFilters = () => {
    setNameFilter("");
    setSubjectFilter("");
    setStatusFilter("");
    setQualificationFilter("");
  };

  // Handle dialog open with reset messages
  const handleOpen = (teacher = null) => {
    setSelectedTeacher(teacher);
    clearMessages(); // Clear any existing messages when opening dialog
    setOpen(true);
  };

  const handleClose = () => {
    setSelectedTeacher(null);
    setOpen(false);
  };

  const handleSubmit = async (
    values,
    { setSubmitting, resetForm, setErrors }
  ) => {
    try {
      setSubmitting(true);

      const subjectIds = Array.isArray(values.subjects)
        ? values.subjects.filter((id) => id && id.trim() !== "")
        : [];

      // Format date properly - ensure we have a valid date
      let formattedJoiningDate = null;
      if (values.joiningDate) {
        const date = new Date(values.joiningDate);
        if (!isNaN(date.getTime())) {
          formattedJoiningDate = date.toISOString();
        }
      }

      // Create the payload
      const payload = {
        ...values,
        subjects: subjectIds,
        joiningDate: formattedJoiningDate,
      };

      // Remove password if it's empty in edit mode
      if (selectedTeacher && !values.password) {
        delete payload.password;
      }

      if (selectedTeacher) {
        await dispatch(
          updateTeacher({ id: selectedTeacher._id, data: payload })
        ).unwrap();
        setSuccess("Teacher updated successfully");
      } else {
        await dispatch(createTeacher(payload)).unwrap();
        setSuccess("Teacher created successfully");
        resetForm();
      }

      // Reload data to ensure UI is up-to-date
      setTimeout(() => {
        loadAllData();
      }, 300);

      // Close the dialog
      handleClose();
    } catch (err) {
      console.error("Error saving teacher:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Error saving teacher. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (teacher) => {
    setTeacherToDelete(teacher);
    setConfirmDelete(true);
  };

  const confirmDeleteTeacher = async () => {
    if (!teacherToDelete || !teacherToDelete._id) return;

    try {
      setDeleting(true);
      await dispatch(deleteTeacher(teacherToDelete._id)).unwrap();
      setSuccess("Teacher deleted successfully");
      setConfirmDelete(false);
      setTeacherToDelete(null);

      // Reload data to ensure UI is up-to-date
      setTimeout(() => {
        loadAllData();
      }, 300);
    } catch (err) {
      console.error("Error deleting teacher:", err);
      setError(err.message || "Failed to delete teacher");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Enhanced Header with Gradient */}
      <Paper
        elevation={2}
        sx={{
          mb: 3,
          borderRadius: 2,
          overflow: "hidden",
          background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        }}
      >
        <Box
          sx={{
            p: { xs: 2, md: 3 },
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: { xs: 2, sm: 0 },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <SchoolIcon
              sx={{
                color: "white",
                mr: 2,
                fontSize: { xs: 30, sm: 36, md: 40 },
              }}
            />
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontSize: { xs: "1.5rem", sm: "1.8rem", md: "2.2rem" },
                fontWeight: 600,
                color: "white",
              }}
            >
              Teachers
            </Typography>
            <RefreshButton
              onRefresh={loadAllData}
              tooltip="Refresh teachers data"
              sx={{ ml: 1, color: "white" }}
            />
          </Box>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
            sx={{
              px: 2,
              py: 1,
              borderRadius: 2,
              boxShadow: 3,
              bgcolor: alpha("#fff", 0.9),
              color: theme.palette.primary.main,
              fontWeight: 600,
              "&:hover": {
                bgcolor: "#fff",
                boxShadow: 4,
              },
            }}
          >
            Add Teacher
          </Button>
        </Box>
      </Paper>

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.light, 0.1),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              display: "flex",
              flexDirection: "column",
              height: "100%",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: 4,
                transform: "translateY(-3px)",
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Avatar
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.8),
                  width: 40,
                  height: 40,
                  mr: 1,
                }}
              >
                <PersonIcon />
              </Avatar>
              <Typography variant="h6" fontWeight={600} color="primary">
                Total Teachers
              </Typography>
            </Box>
            <Typography
              variant="h3"
              component="div"
              sx={{ fontWeight: 600, color: theme.palette.primary.main, mb: 1 }}
            >
              {teachers.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total number of registered teachers
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.success.light, 0.1),
              border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
              display: "flex",
              flexDirection: "column",
              height: "100%",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: 4,
                transform: "translateY(-3px)",
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Avatar
                sx={{
                  bgcolor: alpha(theme.palette.success.main, 0.8),
                  width: 40,
                  height: 40,
                  mr: 1,
                }}
              >
                <WorkIcon />
              </Avatar>
              <Typography variant="h6" fontWeight={600} color="success.main">
                Active
              </Typography>
            </Box>
            <Typography
              variant="h3"
              component="div"
              sx={{ fontWeight: 600, color: theme.palette.success.main, mb: 1 }}
            >
              {
                teachers.filter((t) => t.status?.toLowerCase() === "active")
                  .length
              }
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Currently active teachers
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.warning.light, 0.1),
              border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
              display: "flex",
              flexDirection: "column",
              height: "100%",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: 4,
                transform: "translateY(-3px)",
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Avatar
                sx={{
                  bgcolor: alpha(theme.palette.warning.main, 0.8),
                  width: 40,
                  height: 40,
                  mr: 1,
                }}
              >
                <HistoryIcon />
              </Avatar>
              <Typography variant="h6" fontWeight={600} color="warning.main">
                Inactive
              </Typography>
            </Box>
            <Typography
              variant="h3"
              component="div"
              sx={{ fontWeight: 600, color: theme.palette.warning.main, mb: 1 }}
            >
              {
                teachers.filter((t) => t.status?.toLowerCase() === "inactive")
                  .length
              }
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Currently inactive teachers
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.info.light, 0.1),
              border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
              display: "flex",
              flexDirection: "column",
              height: "100%",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: 4,
                transform: "translateY(-3px)",
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Avatar
                sx={{
                  bgcolor: alpha(theme.palette.info.main, 0.8),
                  width: 40,
                  height: 40,
                  mr: 1,
                }}
              >
                <FilterIcon />
              </Avatar>
              <Typography variant="h6" fontWeight={600} color="info.main">
                Filtered
              </Typography>
            </Box>
            <Typography
              variant="h3"
              component="div"
              sx={{ fontWeight: 600, color: theme.palette.info.main, mb: 1 }}
            >
              {filteredTeachers.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Teachers matching current filters
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {(error || reduxError) && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
            borderRadius: 1,
            animation: "fadeIn 0.3s",
            "@keyframes fadeIn": {
              "0%": { opacity: 0, transform: "translateY(-10px)" },
              "100%": { opacity: 1, transform: "translateY(0)" },
            },
          }}
          onClose={() => setError(null)}
        >
          {error || reduxError}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{
            mb: 2,
            borderRadius: 1,
            animation: "fadeIn 0.3s",
            "@keyframes fadeIn": {
              "0%": { opacity: 0, transform: "translateY(-10px)" },
              "100%": { opacity: 1, transform: "translateY(0)" },
            },
          }}
          onClose={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}

      {/* Enhanced Filter Accordion */}
      <Accordion
        expanded={filterExpanded}
        onChange={() => setFilterExpanded(!filterExpanded)}
        sx={{
          mb: 2,
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: filterExpanded ? 3 : 1,
          "&:before": {
            display: "none",
          },
          transition: "all 0.3s ease",
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            backgroundColor: alpha(theme.palette.primary.light, 0.05),
            "&:hover": {
              backgroundColor: alpha(theme.palette.primary.light, 0.1),
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FilterIcon color="primary" />
            <Typography fontWeight={500}>Filters</Typography>
            {(nameFilter ||
              subjectFilter ||
              statusFilter ||
              qualificationFilter) && (
              <Chip
                label={`${[
                  nameFilter ? 1 : 0,
                  subjectFilter ? 1 : 0,
                  statusFilter ? 1 : 0,
                  qualificationFilter ? 1 : 0,
                ].reduce((a, b) => a + b, 0)} active`}
                size="small"
                color="primary"
                sx={{ fontWeight: 500 }}
              />
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ p: { xs: 2, sm: 3 }, pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Search by Name/Email"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: nameFilter && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setNameFilter("")}
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                          "&:hover": {
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                          },
                        }}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 1 },
                }}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Filter by Subject"
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                InputProps={{
                  sx: { borderRadius: 1 },
                }}
                variant="outlined"
                size="small"
              >
                <MenuItem value="">All Subjects</MenuItem>
                {subjects.map((subject) => (
                  <MenuItem key={subject._id} value={subject._id}>
                    {subject.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Filter by Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                InputProps={{
                  sx: { borderRadius: 1 },
                }}
                variant="outlined"
                size="small"
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Filter by Qualification"
                value={qualificationFilter}
                onChange={(e) => setQualificationFilter(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SchoolIcon color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: qualificationFilter && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setQualificationFilter("")}
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                          "&:hover": {
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                          },
                        }}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 1 },
                }}
                variant="outlined"
                size="small"
              />
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
                    !statusFilter &&
                    !qualificationFilter
                  }
                  sx={{
                    borderRadius: 1.5,
                    color: theme.palette.primary.main,
                  }}
                  size="small"
                >
                  Clear Filters
                </Button>
              </Box>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Results count - enhanced styling */}
      <Box
        sx={{
          mb: 2,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: { xs: 1, sm: 0 },
          p: 1.5,
          backgroundColor: alpha(theme.palette.primary.light, 0.05),
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        }}
      >
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          Showing {filteredTeachers.length} of {teachers.length} teachers
        </Typography>
        {filteredTeachers.length === 0 && teachers.length > 0 && (
          <Alert
            severity="info"
            sx={{ py: 0, width: { xs: "100%", sm: "auto" }, borderRadius: 1 }}
          >
            No teachers match your filter criteria
          </Alert>
        )}
      </Box>

      {loading && filteredTeachers.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "60vh",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          {isMobile ? (
            // Enhanced Mobile card view
            <Stack spacing={2}>
              {filteredTeachers.length > 0 ? (
                filteredTeachers.map((teacher) => (
                  <Card
                    key={teacher._id}
                    sx={{
                      width: "100%",
                      borderRadius: 2,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: 3,
                      },
                      overflow: "hidden",
                    }}
                    elevation={2}
                  >
                    <Box
                      sx={{
                        backgroundColor: theme.palette.primary.main,
                        p: 1.5,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Avatar
                          sx={{
                            bgcolor: alpha("#fff", 0.2),
                            color: "white",
                            width: 32,
                            height: 32,
                            mr: 1.5,
                            fontSize: 16,
                          }}
                        >
                          {teacher.name
                            ? teacher.name.charAt(0).toUpperCase()
                            : "T"}
                        </Avatar>
                        <Typography
                          variant="subtitle1"
                          fontWeight={600}
                          color="white"
                        >
                          {teacher.name}
                        </Typography>
                      </Box>
                      <Chip
                        label={teacher.status}
                        color={
                          teacher.status?.toLowerCase() === "active"
                            ? "success"
                            : "default"
                        }
                        size="small"
                        sx={{
                          fontWeight: 500,
                          height: 24,
                          "& .MuiChip-label": { px: 1 },
                        }}
                      />
                    </Box>

                    <CardContent sx={{ p: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 1.5,
                          pb: 1.5,
                          borderBottom: `1px solid ${alpha(
                            theme.palette.divider,
                            0.1
                          )}`,
                        }}
                      >
                        <PhoneIcon
                          fontSize="small"
                          color="primary"
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="body2" fontWeight={500}>
                          {teacher.phone}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 1.5,
                          pb: 1.5,
                          borderBottom: `1px solid ${alpha(
                            theme.palette.divider,
                            0.1
                          )}`,
                        }}
                      >
                        <EmailIcon
                          fontSize="small"
                          color="primary"
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="body2" fontWeight={500}>
                          {teacher.email}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          mb: 1.5,
                          pb: 1.5,
                          borderBottom: `1px solid ${alpha(
                            theme.palette.divider,
                            0.1
                          )}`,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mb: 1,
                          }}
                        >
                          <SchoolIcon
                            fontSize="small"
                            color="primary"
                            sx={{ mr: 1 }}
                          />
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            color="primary"
                          >
                            Subjects
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 0.5,
                            pl: 3.5,
                          }}
                        >
                          {teacher.subjects?.length > 0 ? (
                            teacher.subjects.map((subjectId) => {
                              const subject = subjects.find(
                                (s) =>
                                  s._id === subjectId || s._id === subjectId._id
                              );
                              return subject ? (
                                <Chip
                                  key={subject._id}
                                  label={subject.name}
                                  size="small"
                                  sx={{
                                    borderRadius: 1,
                                    fontWeight: 500,
                                  }}
                                  color="primary"
                                  variant="outlined"
                                />
                              ) : null;
                            })
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No subjects assigned
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      <Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mb: 0.5,
                          }}
                        >
                          <WorkIcon
                            fontSize="small"
                            color="primary"
                            sx={{ mr: 1 }}
                          />
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            color="primary"
                          >
                            Qualification
                          </Typography>
                        </Box>
                        <Box sx={{ pl: 3.5 }}>
                          <Typography variant="body2">
                            {teacher.qualification || "Not specified"}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              mt: 0.5,
                              display: "flex",
                              alignItems: "center",
                              color: alpha(theme.palette.text.primary, 0.7),
                            }}
                          >
                            <HistoryIcon sx={{ mr: 0.5, fontSize: 16 }} />
                            {teacher.experience || 0} years experience
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>

                    <CardActions
                      sx={{
                        px: 2,
                        pb: 2,
                        pt: 0,
                        borderTop: `1px solid ${alpha(
                          theme.palette.divider,
                          0.1
                        )}`,
                        justifyContent: "flex-end",
                      }}
                    >
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => handleOpen(teacher)}
                        color="primary"
                        sx={{
                          mr: 1,
                          borderRadius: 1.5,
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(teacher)}
                        color="error"
                        sx={{ borderRadius: 1.5 }}
                      >
                        Delete
                      </Button>
                    </CardActions>
                  </Card>
                ))
              ) : (
                <Box
                  sx={{
                    p: 3,
                    textAlign: "center",
                    backgroundColor: alpha(theme.palette.primary.light, 0.05),
                    borderRadius: 2,
                    border: `1px dashed ${alpha(
                      theme.palette.primary.main,
                      0.2
                    )}`,
                    mb: 3,
                  }}
                >
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    fontWeight={500}
                  >
                    No teachers found
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    sx={{ mt: 2, borderRadius: 1.5 }}
                    onClick={() => handleOpen()}
                  >
                    Add Teacher
                  </Button>
                </Box>
              )}
            </Stack>
          ) : (
            // Enhanced Desktop Table View
            <Paper
              elevation={2}
              sx={{
                overflow: "hidden",
                borderRadius: 2,
                transition: "all 0.3s ease",
                mb: 2,
                "&:hover": {
                  boxShadow: 4,
                },
              }}
            >
              <TableContainer sx={{ maxHeight: 650, minHeight: 200 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          backgroundColor: theme.palette.primary.main,
                          color: "white",
                          fontWeight: 600,
                          fontSize: "0.875rem",
                        }}
                      >
                        Teacher
                      </TableCell>
                      <TableCell
                        sx={{
                          backgroundColor: theme.palette.primary.main,
                          color: "white",
                          fontWeight: 600,
                          fontSize: "0.875rem",
                        }}
                      >
                        Contact
                      </TableCell>
                      <TableCell
                        sx={{
                          backgroundColor: theme.palette.primary.main,
                          color: "white",
                          fontWeight: 600,
                          fontSize: "0.875rem",
                        }}
                      >
                        Subjects
                      </TableCell>
                      {!isTablet && (
                        <TableCell
                          sx={{
                            backgroundColor: theme.palette.primary.main,
                            color: "white",
                            fontWeight: 600,
                            fontSize: "0.875rem",
                          }}
                        >
                          Qualification
                        </TableCell>
                      )}
                      {!isTablet && (
                        <TableCell
                          sx={{
                            backgroundColor: theme.palette.primary.main,
                            color: "white",
                            fontWeight: 600,
                            fontSize: "0.875rem",
                          }}
                        >
                          Experience
                        </TableCell>
                      )}
                      <TableCell
                        sx={{
                          backgroundColor: theme.palette.primary.main,
                          color: "white",
                          fontWeight: 600,
                          fontSize: "0.875rem",
                        }}
                      >
                        Status
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          backgroundColor: theme.palette.primary.main,
                          color: "white",
                          fontWeight: 600,
                          fontSize: "0.875rem",
                        }}
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredTeachers.length > 0 ? (
                      filteredTeachers.map((teacher, index) => (
                        <TableRow
                          key={teacher._id}
                          sx={{
                            "&:hover": {
                              backgroundColor: alpha(
                                theme.palette.primary.light,
                                0.1
                              ),
                            },
                            ...(index % 2
                              ? {
                                  bgcolor: alpha(
                                    theme.palette.primary.light,
                                    0.03
                                  ),
                                }
                              : {}),
                          }}
                        >
                          <TableCell
                            sx={{ display: "flex", alignItems: "center" }}
                          >
                            <Avatar
                              sx={{
                                bgcolor: alpha(theme.palette.primary.main, 0.8),
                                width: 32,
                                height: 32,
                                mr: 1.5,
                                fontSize: 14,
                              }}
                            >
                              {teacher.name
                                ? teacher.name.charAt(0).toUpperCase()
                                : "T"}
                            </Avatar>
                            <Typography fontWeight={500}>
                              {teacher.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 0.5,
                              }}
                            >
                              <EmailIcon
                                color="primary"
                                fontSize="small"
                                sx={{ mr: 0.5 }}
                              />
                              <Typography variant="body2">
                                {teacher.email}
                              </Typography>
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <PhoneIcon
                                color="primary"
                                fontSize="small"
                                sx={{ mr: 0.5 }}
                              />
                              <Typography variant="body2">
                                {teacher.phone}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 0.5,
                              }}
                            >
                              {teacher.subjects?.length > 0 ? (
                                teacher.subjects.map((subjectId) => {
                                  const subject = subjects.find(
                                    (s) =>
                                      s._id === subjectId ||
                                      s._id === subjectId._id
                                  );
                                  return subject ? (
                                    <Chip
                                      key={subject._id}
                                      label={subject.name}
                                      size="small"
                                      color="primary"
                                      variant="outlined"
                                      sx={{
                                        borderRadius: 1,
                                        fontWeight: 500,
                                      }}
                                    />
                                  ) : null;
                                })
                              ) : (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  No subjects
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          {!isTablet && (
                            <TableCell>
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                <SchoolIcon
                                  color="primary"
                                  fontSize="small"
                                  sx={{ mr: 0.5 }}
                                />
                                <Typography variant="body2" fontWeight={500}>
                                  {teacher.qualification || "Not specified"}
                                </Typography>
                              </Box>
                            </TableCell>
                          )}
                          {!isTablet && (
                            <TableCell>
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                <HistoryIcon
                                  color="primary"
                                  fontSize="small"
                                  sx={{ mr: 0.5 }}
                                />
                                <Typography variant="body2" fontWeight={500}>
                                  {teacher.experience || "0"} years
                                </Typography>
                              </Box>
                            </TableCell>
                          )}
                          <TableCell>
                            <Chip
                              label={teacher.status}
                              color={
                                teacher.status?.toLowerCase() === "active"
                                  ? "success"
                                  : "default"
                              }
                              size="small"
                              sx={{
                                fontWeight: 500,
                                height: 24,
                                minWidth: 80,
                              }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                              }}
                            >
                              <Tooltip title="Edit Teacher" arrow>
                                <IconButton
                                  color="primary"
                                  size="small"
                                  onClick={() => handleOpen(teacher)}
                                  sx={{
                                    mr: 1,
                                    bgcolor: alpha(
                                      theme.palette.primary.main,
                                      0.05
                                    ),
                                    "&:hover": {
                                      bgcolor: alpha(
                                        theme.palette.primary.main,
                                        0.1
                                      ),
                                    },
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Teacher" arrow>
                                <IconButton
                                  color="error"
                                  size="small"
                                  onClick={() => handleDelete(teacher)}
                                  sx={{
                                    bgcolor: alpha(
                                      theme.palette.error.main,
                                      0.05
                                    ),
                                    "&:hover": {
                                      bgcolor: alpha(
                                        theme.palette.error.main,
                                        0.1
                                      ),
                                    },
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={isTablet ? 5 : 7}
                          align="center"
                          sx={{ py: 3 }}
                        >
                          <Box
                            sx={{
                              p: 3,
                              textAlign: "center",
                              backgroundColor: alpha(
                                theme.palette.primary.light,
                                0.05
                              ),
                              borderRadius: 2,
                              border: `1px dashed ${alpha(
                                theme.palette.primary.main,
                                0.2
                              )}`,
                              my: 2,
                              maxWidth: 400,
                              mx: "auto",
                            }}
                          >
                            <Typography
                              variant="body1"
                              color="text.secondary"
                              fontWeight={500}
                            >
                              No teachers found
                            </Typography>
                            <Button
                              variant="contained"
                              color="primary"
                              startIcon={<AddIcon />}
                              sx={{ mt: 2, borderRadius: 1.5 }}
                              onClick={() => handleOpen()}
                            >
                              Add Teacher
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </>
      )}

      {/* Enhanced Add/Edit Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: { xs: "100%", sm: "90vh" },
            position: "relative",
          },
        }}
      >
        <DialogTitle
          sx={{
            px: { xs: 2, sm: 3 },
            py: 2.5,
            bgcolor: theme.palette.primary.main,
            color: "white",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {selectedTeacher ? <EditIcon /> : <AddIcon />}
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            {selectedTeacher ? "Edit Teacher" : "Add Teacher"}
          </Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleClose}
            aria-label="close"
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "white",
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <Formik
          initialValues={{
            name: selectedTeacher?.name || "",
            email: selectedTeacher?.email || "",
            password: "",
            phone: selectedTeacher?.phone || "",
            gender: selectedTeacher?.gender || "male",
            address: selectedTeacher?.address || "",
            subjects:
              selectedTeacher?.subjects?.map((s) =>
                typeof s === "object" ? s._id : s
              ) || [],
            qualification: selectedTeacher?.qualification || "",
            experience: selectedTeacher?.experience || "",
            joiningDate: selectedTeacher?.joiningDate
              ? new Date(selectedTeacher.joiningDate)
                  .toISOString()
                  .split("T")[0]
              : new Date().toISOString().split("T")[0],
            salary: selectedTeacher?.salary || "",
            status: selectedTeacher?.status || "active",
          }}
          validationSchema={validationSchema(!!selectedTeacher)}
          onSubmit={handleSubmit}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
            setFieldValue,
          }) => (
            <Form onSubmit={handleSubmit}>
              <DialogContent dividers sx={{ p: 3 }}>
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                    fontWeight={500}
                  >
                    Complete the form below. Fields marked with{" "}
                    <Box component="span" sx={{ color: "error.main" }}>
                      *
                    </Box>{" "}
                    are required.
                  </Typography>

                  <Divider sx={{ mb: 3 }} />

                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    color="primary"
                    sx={{ mb: 2 }}
                  >
                    Personal Information
                  </Typography>

                  <Grid container spacing={2.5}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Name"
                        name="name"
                        value={values.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.name && Boolean(errors.name)}
                        helperText={touched.name && errors.name}
                        margin="dense"
                        required
                        InputProps={{
                          sx: {
                            borderRadius: 1,
                            fontSize: { xs: "0.95rem", sm: "1rem" },
                          },
                        }}
                        sx={{
                          "& .MuiInputBase-root": {
                            minHeight: { xs: 48, sm: "auto" },
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.email && Boolean(errors.email)}
                        helperText={touched.email && errors.email}
                        margin="dense"
                        required
                        InputProps={{ sx: { borderRadius: 1 } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label={
                          selectedTeacher
                            ? "New Password (optional)"
                            : "Password"
                        }
                        name="password"
                        type="password"
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.password && Boolean(errors.password)}
                        helperText={
                          (touched.password && errors.password) ||
                          (selectedTeacher &&
                            "Leave blank to keep current password")
                        }
                        margin="dense"
                        required={!selectedTeacher}
                        InputProps={{ sx: { borderRadius: 1 } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone"
                        name="phone"
                        value={values.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.phone && Boolean(errors.phone)}
                        helperText={touched.phone && errors.phone}
                        margin="dense"
                        required
                        InputProps={{
                          sx: { borderRadius: 1 },
                          startAdornment: (
                            <InputAdornment position="start">
                              <PhoneIcon color="primary" fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        fullWidth
                        label="Gender"
                        name="gender"
                        value={values.gender}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.gender && Boolean(errors.gender)}
                        helperText={touched.gender && errors.gender}
                        margin="dense"
                        required
                        InputProps={{ sx: { borderRadius: 1 } }}
                      >
                        <MenuItem value="male">
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <MaleIcon
                              fontSize="small"
                              sx={{ mr: 1, color: theme.palette.primary.main }}
                            />
                            Male
                          </Box>
                        </MenuItem>
                        <MenuItem value="female">
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <FemaleIcon
                              fontSize="small"
                              sx={{ mr: 1, color: "#e91e63" }}
                            />
                            Female
                          </Box>
                        </MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Address"
                        name="address"
                        value={values.address}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.address && Boolean(errors.address)}
                        helperText={touched.address && errors.address}
                        margin="dense"
                        required
                        InputProps={{
                          sx: { borderRadius: 1 },
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationOnIcon
                                color="primary"
                                fontSize="small"
                              />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 3 }} />

                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    color="primary"
                    sx={{ mb: 2 }}
                  >
                    Professional Information
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        select
                        fullWidth
                        SelectProps={{ multiple: true }}
                        label="Subjects"
                        name="subjects"
                        value={values.subjects}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.subjects && Boolean(errors.subjects)}
                        helperText={touched.subjects && errors.subjects}
                        margin="dense"
                        required
                        InputProps={{ sx: { borderRadius: 1 } }}
                      >
                        {subjects.map((subject) => (
                          <MenuItem key={subject._id} value={subject._id}>
                            {subject.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Qualification"
                        name="qualification"
                        value={values.qualification}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={
                          touched.qualification && Boolean(errors.qualification)
                        }
                        helperText={
                          touched.qualification && errors.qualification
                        }
                        margin="dense"
                        required
                        InputProps={{
                          sx: { borderRadius: 1 },
                          startAdornment: (
                            <InputAdornment position="start">
                              <SchoolIcon color="primary" fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Experience (Years)"
                        name="experience"
                        type="number"
                        value={values.experience}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.experience && Boolean(errors.experience)}
                        helperText={touched.experience && errors.experience}
                        inputProps={{ min: 0 }}
                        margin="dense"
                        required
                        InputProps={{
                          sx: { borderRadius: 1 },
                          startAdornment: (
                            <InputAdornment position="start">
                              <HistoryIcon color="primary" fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Joining Date"
                        name="joiningDate"
                        type="date"
                        value={values.joiningDate}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={
                          touched.joiningDate && Boolean(errors.joiningDate)
                        }
                        helperText={touched.joiningDate && errors.joiningDate}
                        InputLabelProps={{ shrink: true }}
                        margin="dense"
                        required
                        InputProps={{
                          sx: { borderRadius: 1 },
                          startAdornment: (
                            <InputAdornment position="start">
                              <EventIcon color="primary" fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Salary"
                        name="salary"
                        type="number"
                        value={values.salary}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.salary && Boolean(errors.salary)}
                        helperText={touched.salary && errors.salary}
                        InputProps={{
                          sx: { borderRadius: 1 },
                          startAdornment: (
                            <InputAdornment position="start">
                              <AttachMoneyIcon
                                color="primary"
                                fontSize="small"
                              />
                            </InputAdornment>
                          ),
                        }}
                        inputProps={{ min: 0 }}
                        margin="dense"
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        fullWidth
                        label="Status"
                        name="status"
                        value={values.status}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.status && Boolean(errors.status)}
                        helperText={touched.status && errors.status}
                        margin="dense"
                        required
                        InputProps={{ sx: { borderRadius: 1 } }}
                      >
                        <MenuItem value="active">
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Chip
                              size="small"
                              label="Active"
                              color="success"
                              sx={{ mr: 1, minWidth: 60, fontWeight: 500 }}
                            />
                            <Typography variant="body2">
                              Available to teach
                            </Typography>
                          </Box>
                        </MenuItem>
                        <MenuItem value="inactive">
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Chip
                              size="small"
                              label="Inactive"
                              color="default"
                              sx={{ mr: 1, minWidth: 60, fontWeight: 500 }}
                            />
                            <Typography variant="body2">
                              Not available to teach
                            </Typography>
                          </Box>
                        </MenuItem>
                      </TextField>
                    </Grid>
                  </Grid>
                </Box>
              </DialogContent>
              <DialogActions
                sx={{
                  px: { xs: 2, sm: 3 },
                  py: { xs: 2, sm: 2 },
                  bgcolor: alpha(theme.palette.primary.light, 0.05),
                }}
              >
                <Button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  startIcon={<CancelIcon />}
                  variant="outlined"
                  sx={{ borderRadius: 1.5 }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                  startIcon={
                    isSubmitting ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : selectedTeacher ? (
                      <SaveIcon />
                    ) : (
                      <AddIcon />
                    )
                  }
                  sx={{ ml: 1, borderRadius: 1.5 }}
                >
                  {isSubmitting
                    ? "Saving..."
                    : selectedTeacher
                    ? "Update Teacher"
                    : "Add Teacher"}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: 10,
            position: "relative",
          },
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle
          sx={{
            bgcolor: theme.palette.error.main,
            color: "white",
            p: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <WarningIcon sx={{ mr: 1 }} />
            <Typography variant="h6" fontWeight={600}>
              Confirm Delete
            </Typography>
          </Box>
          <IconButton
            aria-label="close"
            onClick={() => setConfirmDelete(false)}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "white",
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ pt: 3, pb: 1 }}>
          <Box sx={{ textAlign: "center", py: 2 }}>
            <ErrorOutlineIcon
              color="error"
              sx={{ fontSize: 60, mb: 2, opacity: 0.8 }}
            />
            <Typography variant="subtitle1" fontWeight={500} gutterBottom>
              Are you sure you want to delete this teacher?
            </Typography>
            {teacherToDelete && (
              <Box
                sx={{
                  mt: 2,
                  mb: 3,
                  p: 2,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.error.light, 0.1),
                  border: `1px dashed ${alpha(theme.palette.error.main, 0.2)}`,
                }}
              >
                <Typography fontWeight={600} variant="body1">
                  {teacherToDelete.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {teacherToDelete.email}
                </Typography>
              </Box>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              This action cannot be undone. All related data will be permanently
              removed.
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
            bgcolor: alpha(theme.palette.background.paper, 0.9),
          }}
        >
          <Button
            variant="outlined"
            onClick={() => setConfirmDelete(false)}
            sx={{
              borderRadius: 1.5,
              mr: 1,
            }}
            startIcon={<CancelIcon />}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmDeleteTeacher}
            disabled={deleting}
            startIcon={
              deleting ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <DeleteIcon />
              )
            }
            sx={{ borderRadius: 1.5 }}
          >
            {deleting ? "Deleting..." : "Delete Teacher"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Teachers;
