import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  ListSubheader,
  Checkbox,
  Divider,
  Avatar,
  Card,
  CardContent,
  CardActions,
  useMediaQuery,
  useTheme,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
  Tooltip,
  FormHelperText,
  Badge,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  Book as BookIcon,
  Info as InfoIcon,
  CalendarToday as CalendarTodayIcon,
  BarChart as BarChartIcon,
} from "@mui/icons-material";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  fetchStudents,
  updateStudent,
  deleteStudent,
  resetStatus,
} from "../../store/slices/studentSlice";
import { fetchStandards } from "../../store/slices/standardSlice";
import { fetchSubjects } from "../../store/slices/subjectSlice";
import { fetchBatches } from "../../store/slices/batchSlice";
import { dashboardService } from "../../services/api";
import RefreshButton from "../../components/RefreshButton";
import { alpha } from "@mui/material/styles";

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
    .required("Phone number is required"),
  standard: Yup.string().required("Standard is required"),
  subjects: Yup.array().of(Yup.string()),
  batches: Yup.array().of(Yup.string()),
  parentName: Yup.string().required("Parent name is required"),
  parentPhone: Yup.string()
    .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
    .required("Parent phone number is required"),
  address: Yup.string().required("Address is required"),
  dateOfBirth: Yup.date().required("Date of birth is required"),
  gender: Yup.string().required("Gender is required"),
  board: Yup.string().required("Board is required"),
  schoolName: Yup.string().required("School name is required"),
  previousPercentage: Yup.number()
    .typeError("Must be a number")
    .min(1, "Percentage must be at least 1")
    .max(100, "Percentage cannot exceed 100")
    .nullable()
    .transform((value) => (isNaN(value) ? null : value))
    .notRequired(),
  joiningDate: Yup.date().required("Joining date is required"),
});

const Students = () => {
  const dispatch = useDispatch();
  const { students, loading, error, success } = useSelector(
    (state) => state.students
  );
  const { standards, loading: standardsLoading } = useSelector(
    (state) => state.standards
  );
  const { subjects, loading: subjectsLoading } = useSelector(
    (state) => state.subjects
  );
  const { batches, loading: batchesLoading } = useSelector(
    (state) => state.batches
  );
  const [open, setOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [totalStudentCount, setTotalStudentCount] = useState(0);
  const [statsLoading, setStatsLoading] = useState(false);
  const [viewStudent, setViewStudent] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  // Filter state
  const [nameFilter, setNameFilter] = useState("");
  const [standardFilter, setStandardFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [filteredStudentsList, setFilteredStudentsList] = useState([]);
  const [filterExpanded, setFilterExpanded] = useState(false);

  // Apply filters whenever students data or filter values change
  useEffect(() => {
    if (!students || students.length === 0) {
      setFilteredStudentsList([]);
      return;
    }

    let results = [...students];

    // Filter by name/email/phone
    if (nameFilter) {
      const searchTerm = nameFilter.toLowerCase();
      results = results.filter(
        (student) =>
          student.name.toLowerCase().includes(searchTerm) ||
          student.email.toLowerCase().includes(searchTerm) ||
          student.phone.includes(searchTerm) ||
          student.parentName?.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by standard
    if (standardFilter) {
      results = results.filter(
        (student) =>
          student.standard?._id === standardFilter ||
          student.standard === standardFilter
      );
    }

    // Filter by gender
    if (genderFilter) {
      results = results.filter((student) => student.gender === genderFilter);
    }

    setFilteredStudentsList(results);
  }, [students, nameFilter, standardFilter, genderFilter]);

  const clearFilters = () => {
    setNameFilter("");
    setStandardFilter("");
    setGenderFilter("");
  };

  // Initialize filtered students when students data loads
  useEffect(() => {
    setFilteredStudentsList(students || []);
  }, [students]);

  // Function to load all required data
  const loadAllData = useCallback(() => {
    dispatch(fetchStudents());
    dispatch(fetchStandards());
    dispatch(fetchSubjects());
    dispatch(fetchBatches());

    // Fetch total student count from dashboard API
    setStatsLoading(true);
    dashboardService
      .getStats()
      .then((response) => {
        setTotalStudentCount(response.data.totalStudents || 0);
      })
      .catch((error) => {
        console.error("Error fetching total student count:", error);
      })
      .finally(() => {
        setStatsLoading(false);
      });
  }, [dispatch]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  useEffect(() => {
    if (success) {
      setOpen(false);
      setEditingStudent(null);
      dispatch(resetStatus());
      // Refresh data after successful operation
      loadAllData();
    }
  }, [success, dispatch, loadAllData]);

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      standard: "",
      subjects: [],
      batches: [],
      parentName: "",
      parentPhone: "",
      address: "",
      dateOfBirth: "",
      gender: "",
      board: "",
      schoolName: "",
      previousPercentage: "",
      joiningDate: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting, setFieldError, setStatus }) => {
      setStatus(null);

      try {
        console.log("Form values:", values);

        // Only update functionality
        if (editingStudent) {
          await dispatch(
            updateStudent({
              id: editingStudent._id,
              studentData: values,
            })
          ).unwrap();
          console.log("Student updated successfully");
        }
      } catch (error) {
        console.error("Error updating student:", error);

        if (error.response?.data?.errors) {
          const serverErrors = error.response.data.errors;
          Object.keys(serverErrors).forEach((field) => {
            setFieldError(field, serverErrors[field]);
          });
        }

        setStatus(
          error.response?.data?.message ||
            error.message ||
            "An error occurred. Please try again."
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleStandardChange = (e) => {
    formik.setFieldValue("standard", e.target.value);
    formik.setFieldValue("subjects", []);
  };

  const handleOpen = (student = null) => {
    if (student) {
      setEditingStudent(student);

      // Format dates for the form
      const dateOfBirth = student.dateOfBirth
        ? new Date(student.dateOfBirth).toISOString().split("T")[0]
        : "";
      const joiningDate = student.joiningDate
        ? new Date(student.joiningDate).toISOString().split("T")[0]
        : "";

      // Set formik values
      formik.setValues({
        name: student.name || "",
        email: student.email || "",
        phone: student.phone || "",
        standard: student.standard?._id || student.standard || "",
        subjects: student.subjects?.map((s) => s._id || s) || [],
        batches: student.batches?.map((b) => b._id || b) || [],
        parentName: student.parentName || "",
        parentPhone: student.parentPhone || "",
        address: student.address || "",
        dateOfBirth: dateOfBirth,
        gender: student.gender || "",
        board: student.board || "",
        schoolName: student.schoolName || "",
        previousPercentage: student.previousPercentage || "",
        joiningDate: joiningDate,
      });
    } else {
      setEditingStudent(null);
      formik.resetForm();
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingStudent(null);
    formik.resetForm();
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      dispatch(deleteStudent(id));
    }
  };

  const handleViewStudent = (student) => {
    setViewStudent(student);
    setViewDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setViewStudent(null);
  };

  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(date);
    } catch (error) {
      return "N/A";
    }
  };

  const getBatchStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return theme.palette.success.main;
      case "upcoming":
        return theme.palette.info.main;
      case "completed":
        return theme.palette.warning.main;
      case "cancelled":
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    try {
      const [hours, minutes] = timeString.split(":");
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? "PM" : "AM";
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    } catch (error) {
      return timeString;
    }
  };

  // Helper function to get related data from an array using ID
  const getRelatedData = (id, array) => {
    if (!id || !array || !array.length) return null;
    return array.find((item) => (item._id || item) === id);
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          mb: 3,
          gap: 2,
        }}
      >
        <Typography variant="h5" component="h1" fontWeight={600}>
          Student Management
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            justifyContent: { xs: "flex-start", sm: "flex-end" },
            width: { xs: "100%", sm: "auto" },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Total Students:
            </Typography>
            {statsLoading ? (
              <CircularProgress size={18} thickness={5} />
            ) : (
              <Chip
                label={totalStudentCount}
                color="primary"
                size="small"
                sx={{ fontWeight: 600 }}
              />
            )}
          </Box>

          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <RefreshButton
              onClick={loadAllData}
              loading={loading}
              size="small"
            />
          </Box>
        </Box>
      </Box>

      <Accordion
        expanded={filterExpanded}
        onChange={() => setFilterExpanded(!filterExpanded)}
        sx={{
          mb: 3,
          borderRadius: 2,
          boxShadow: theme.shadows[1],
          "&::before": {
            display: "none",
          },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{ borderRadius: 2 }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FilterIcon color="primary" fontSize="small" />
            <Typography variant="subtitle2" color="primary.main">
              Filters
            </Typography>
            {(nameFilter || standardFilter || genderFilter) && (
              <Chip
                label={`${
                  (nameFilter ? 1 : 0) +
                  (standardFilter ? 1 : 0) +
                  (genderFilter ? 1 : 0)
                } active`}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
        </AccordionSummary>

        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Search by name, email or phone"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: nameFilter && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setNameFilter("")}
                        edge="end"
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by Standard</InputLabel>
                <Select
                  value={standardFilter}
                  onChange={(e) => setStandardFilter(e.target.value)}
                  label="Filter by Standard"
                  endAdornment={
                    standardFilter && (
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setStandardFilter("");
                        }}
                        sx={{
                          position: "absolute",
                          right: 32,
                          color: "text.secondary",
                        }}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    )
                  }
                >
                  <MenuItem value="">All Standards</MenuItem>
                  {standards?.map((standard) => (
                    <MenuItem key={standard._id} value={standard._id}>
                      {standard.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by Gender</InputLabel>
                <Select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                  label="Filter by Gender"
                  endAdornment={
                    genderFilter && (
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setGenderFilter("");
                        }}
                        sx={{
                          position: "absolute",
                          right: 32,
                          color: "text.secondary",
                        }}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    )
                  }
                >
                  <MenuItem value="">All Genders</MenuItem>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              mt: 2,
            }}
          >
            <Button
              variant="outlined"
              color="secondary"
              size="small"
              onClick={clearFilters}
              disabled={!nameFilter && !standardFilter && !genderFilter}
              startIcon={<ClearIcon />}
            >
              Clear Filters
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Students List */}
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            p: 5,
          }}
        >
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert
          severity="error"
          sx={{ maxWidth: "md", mx: "auto", borderRadius: 1.5 }}
        >
          Error loading students: {error}
        </Alert>
      ) : filteredStudentsList.length === 0 ? (
        <Paper
          sx={{
            p: 3,
            borderRadius: 2,
            textAlign: "center",
            boxShadow: theme.shadows[1],
          }}
        >
          <Typography color="text.secondary">
            {students.length === 0
              ? "No students found. Add students from the batch interface."
              : "No students match the current filters."}
          </Typography>
          {students.length > 0 && filteredStudentsList.length === 0 && (
            <Button
              startIcon={<ClearIcon />}
              onClick={clearFilters}
              variant="text"
              sx={{ mt: 1 }}
            >
              Clear filters
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={2.5}>
          {filteredStudentsList.map((student) => (
            <Grid item xs={12} sm={6} md={4} key={student._id}>
              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: theme.shadows[1],
                  transition: "all 0.3s ease",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  "&:hover": {
                    boxShadow: theme.shadows[4],
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <CardContent
                  sx={{
                    p: 2.5,
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      mb: 2,
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: (theme) =>
                          student.gender === "female"
                            ? theme.palette.info.main
                            : student.gender === "male"
                            ? theme.palette.primary.main
                            : theme.palette.grey[500],
                        width: 50,
                        height: 50,
                        fontSize: "1.2rem",
                        fontWeight: 600,
                      }}
                    >
                      {student.name?.charAt(0)?.toUpperCase() || "S"}
                    </Avatar>

                    <Box sx={{ flexGrow: 1 }}>
                      <Typography
                        variant="h6"
                        fontWeight={600}
                        sx={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {student.name}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            textTransform: "capitalize",
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <Badge
                            sx={{
                              "& .MuiBadge-badge": {
                                bgcolor:
                                  student.gender === "female"
                                    ? theme.palette.info.main
                                    : student.gender === "male"
                                    ? theme.palette.primary.main
                                    : theme.palette.grey[500],
                                color: "white",
                                height: 6,
                                minWidth: 6,
                                p: 0,
                              },
                            }}
                          />
                          {student.gender || "Not specified"}
                        </Typography>
                        {student.studentId && (
                          <Chip
                            label={student.studentId}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{
                              height: 20,
                              fontSize: "0.7rem",
                              fontWeight: 500,
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  <Stack spacing={1.5}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <PhoneIcon
                        fontSize="small"
                        sx={{ color: "text.secondary" }}
                      />
                      <Typography variant="body2">{student.phone}</Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <EmailIcon
                        fontSize="small"
                        sx={{ color: "text.secondary" }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {student.email}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1,
                      }}
                    >
                      <SchoolIcon
                        fontSize="small"
                        sx={{ color: "text.secondary" }}
                      />
                      <Typography variant="body2">
                        {getRelatedData(
                          student.standard?._id || student.standard,
                          standards
                        )?.name || "No standard"}
                      </Typography>
                    </Box>

                    {student.batches?.length > 0 && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          flexWrap: "wrap",
                          mt: 0.5,
                        }}
                      >
                        {student.batches.slice(0, 2).map((batch) => {
                          const batchData = getRelatedData(
                            batch._id || batch,
                            batches
                          );
                          return (
                            <Chip
                              key={batch._id || batch}
                              label={batchData?.name || "Batch"}
                              size="small"
                              sx={{
                                borderRadius: 1,
                                bgcolor: batchData
                                  ? alpha(
                                      getBatchStatusColor(batchData.status),
                                      0.1
                                    )
                                  : "primary.light",
                                color: batchData
                                  ? getBatchStatusColor(batchData.status)
                                  : "primary.main",
                                fontSize: "0.7rem",
                                height: 22,
                              }}
                            />
                          );
                        })}
                        {student.batches.length > 2 && (
                          <Chip
                            label={`+${student.batches.length - 2}`}
                            size="small"
                            sx={{
                              borderRadius: 1,
                              fontSize: "0.7rem",
                              height: 22,
                            }}
                          />
                        )}
                      </Box>
                    )}
                  </Stack>
                </CardContent>

                <CardActions
                  sx={{
                    p: 1.5,
                    borderTop: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Button
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={() => handleViewStudent(student)}
                  >
                    View
                  </Button>
                  <Box>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpen(student)}
                      sx={{ mr: 0.5 }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(student._id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Edit Student Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: `linear-gradient(to right, ${alpha(
              theme.palette.primary.main,
              0.8
            )}, ${alpha(theme.palette.primary.dark, 0.9)})`,
            color: "white",
            p: 2.5,
          }}
        >
          <Typography variant="h6">
            {editingStudent ? "Edit Student" : "Add New Student"}
          </Typography>
        </DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent
            dividers
            sx={{
              px: { xs: 2, sm: 3 },
              pt: 2,
              pb: 3,
            }}
          >
            {/* Form content remains the same */}
            {/* ... */}
          </DialogContent>
          <DialogActions
            sx={{
              p: 2.5,
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <Button
              onClick={handleClose}
              variant="outlined"
              color="inherit"
              disabled={formik.isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={formik.isSubmitting}
              sx={{ ml: 1.5 }}
            >
              {formik.isSubmitting ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Saving...
                </>
              ) : editingStudent ? (
                "Update Student"
              ) : (
                "Add Student"
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* View Student Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={handleCloseViewDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: "hidden",
          },
        }}
      >
        {viewStudent && (
          <>
            <DialogTitle
              sx={{
                background: `linear-gradient(to right, ${alpha(
                  theme.palette.primary.main,
                  0.8
                )}, ${alpha(theme.palette.primary.dark, 0.9)})`,
                color: "white",
                p: 2.5,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <PersonIcon sx={{ fontSize: "1.8rem" }} />
              <Typography variant="h6">Student Details</Typography>
            </DialogTitle>
            <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 3,
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: (theme) =>
                          viewStudent.gender === "female"
                            ? theme.palette.info.main
                            : viewStudent.gender === "male"
                            ? theme.palette.primary.main
                            : theme.palette.grey[500],
                        width: 70,
                        height: 70,
                        fontSize: "1.8rem",
                        fontWeight: 600,
                      }}
                    >
                      {viewStudent.name?.charAt(0)?.toUpperCase() || "S"}
                    </Avatar>
                    <Box>
                      <Typography variant="h5" fontWeight={600}>
                        {viewStudent.name}
                      </Typography>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            textTransform: "capitalize",
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <Badge
                            sx={{
                              "& .MuiBadge-badge": {
                                bgcolor:
                                  viewStudent.gender === "female"
                                    ? theme.palette.info.main
                                    : viewStudent.gender === "male"
                                    ? theme.palette.primary.main
                                    : theme.palette.grey[500],
                                color: "white",
                                height: 6,
                                minWidth: 6,
                                p: 0,
                              },
                            }}
                          />
                          {viewStudent.gender || "Not specified"}
                        </Typography>
                        {viewStudent.studentId && (
                          <Chip
                            label={`ID: ${viewStudent.studentId}`}
                            size="small"
                            color="primary"
                            sx={{
                              height: 24,
                              fontSize: "0.75rem",
                              fontWeight: 500,
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Grid>

                {/* Personal Information */}
                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      pb: 1,
                      mb: 2,
                      borderBottom: `1px solid ${alpha(
                        theme.palette.divider,
                        0.3
                      )}`,
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      color="primary"
                      fontWeight={600}
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <PersonIcon fontSize="small" />
                      Personal Information
                    </Typography>
                  </Box>
                </Grid>

                {/* Personal Information Fields */}
                <Grid item xs={12} sm={6}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Date of Birth
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(viewStudent.dateOfBirth)}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body1">
                        {viewStudent.email}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Phone
                      </Typography>
                      <Typography variant="body1">
                        {viewStudent.phone}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Address
                      </Typography>
                      <Typography variant="body1">
                        {viewStudent.address || "Not provided"}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Parent Name
                      </Typography>
                      <Typography variant="body1">
                        {viewStudent.parentName || "Not provided"}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Parent Phone
                      </Typography>
                      <Typography variant="body1">
                        {viewStudent.parentPhone || "Not provided"}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>

                {/* Academic Information */}
                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      pb: 1,
                      my: 2,
                      borderBottom: `1px solid ${alpha(
                        theme.palette.divider,
                        0.3
                      )}`,
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      color="primary"
                      fontWeight={600}
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <SchoolIcon fontSize="small" />
                      Academic Information
                    </Typography>
                  </Box>
                </Grid>

                {/* Academic Information Fields */}
                <Grid item xs={12} sm={6}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Joining Date
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(viewStudent.joiningDate)}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Standard
                      </Typography>
                      <Typography variant="body1">
                        {getRelatedData(
                          viewStudent.standard?._id || viewStudent.standard,
                          standards
                        )?.name || "Not assigned"}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        School Name
                      </Typography>
                      <Typography variant="body1">
                        {viewStudent.schoolName || "Not provided"}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Board
                      </Typography>
                      <Typography variant="body1">
                        {viewStudent.board || "Not provided"}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Previous Percentage
                      </Typography>
                      <Typography variant="body1">
                        {viewStudent.previousPercentage
                          ? `${viewStudent.previousPercentage}%`
                          : "Not provided"}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>

                {/* Enrollments */}
                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      pb: 1,
                      my: 2,
                      borderBottom: `1px solid ${alpha(
                        theme.palette.divider,
                        0.3
                      )}`,
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      color="primary"
                      fontWeight={600}
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <BookIcon fontSize="small" />
                      Enrollments
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  {viewStudent.batches && viewStudent.batches.length > 0 ? (
                    <TableContainer
                      component={Paper}
                      sx={{
                        boxShadow: "none",
                        border: `1px solid ${alpha(
                          theme.palette.divider,
                          0.3
                        )}`,
                        borderRadius: 1.5,
                      }}
                    >
                      <Table size="small">
                        <TableHead
                          sx={{
                            bgcolor: alpha(theme.palette.primary.light, 0.05),
                          }}
                        >
                          <TableRow>
                            <TableCell>Batch Name</TableCell>
                            <TableCell>Schedule</TableCell>
                            <TableCell>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {viewStudent.batches.map((batch) => {
                            const batchData = getRelatedData(
                              batch._id || batch,
                              batches
                            );
                            return (
                              <TableRow key={batch._id || batch}>
                                <TableCell>
                                  {batchData?.name || "Unknown Batch"}
                                </TableCell>
                                <TableCell>
                                  {batchData?.schedule?.days
                                    ?.slice(0, 2)
                                    .join(", ")}
                                  {batchData?.schedule?.days?.length > 2 &&
                                    ` +${batchData.schedule.days.length - 2}`}
                                  {batchData?.schedule?.startTime &&
                                    batchData?.schedule?.endTime && (
                                      <Box
                                        component="span"
                                        sx={{ display: "block", mt: 0.5 }}
                                      >
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                        >
                                          {formatTime(
                                            batchData.schedule.startTime
                                          )}{" "}
                                          -{" "}
                                          {formatTime(
                                            batchData.schedule.endTime
                                          )}
                                        </Typography>
                                      </Box>
                                    )}
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={
                                      batchData?.status
                                        ?.charAt(0)
                                        .toUpperCase() +
                                      (batchData?.status?.slice(1) || "")
                                    }
                                    size="small"
                                    sx={{
                                      borderRadius: 1,
                                      fontSize: "0.7rem",
                                      height: 22,
                                      bgcolor: batchData
                                        ? alpha(
                                            getBatchStatusColor(
                                              batchData.status
                                            ),
                                            0.1
                                          )
                                        : "default",
                                      color: batchData
                                        ? getBatchStatusColor(batchData.status)
                                        : "default",
                                    }}
                                  />
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontStyle: "italic" }}
                    >
                      Not enrolled in any batches
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
              <Button
                variant="contained"
                onClick={() => handleOpen(viewStudent)}
                startIcon={<EditIcon />}
                sx={{ mr: "auto" }}
              >
                Edit
              </Button>
              <Button
                onClick={handleCloseViewDialog}
                variant="outlined"
                color="inherit"
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Students;
