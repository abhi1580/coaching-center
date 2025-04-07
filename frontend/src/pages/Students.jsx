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
  Add as AddIcon,
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
  createStudent,
  updateStudent,
  deleteStudent,
  resetStatus,
} from "../store/slices/studentSlice";
import { fetchStandards } from "../store/slices/standardSlice";
import { fetchSubjects } from "../store/slices/subjectSlice";
import {
  fetchBatches,
  fetchBatchesBySubject,
} from "../store/slices/batchSlice";
import {
  subjectService,
  batchService,
  dashboardService,
} from "../services/api";
import RefreshButton from "../components/RefreshButton";
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
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [filteredBatches, setFilteredBatches] = useState([]);
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
  const [subjectFilter, setSubjectFilter] = useState("");
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

    // Filter by subject
    if (subjectFilter) {
      results = results.filter((student) =>
        student.subjects?.some(
          (subj) => subj._id === subjectFilter || subj === subjectFilter
        )
      );
    }

    // Filter by gender
    if (genderFilter) {
      results = results.filter((student) => student.gender === genderFilter);
    }

    setFilteredStudentsList(results);
  }, [students, nameFilter, standardFilter, subjectFilter, genderFilter]);

  const clearFilters = () => {
    setNameFilter("");
    setStandardFilter("");
    setSubjectFilter("");
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
        
        // Check specifically for the problematic fields
        if (!values.gender) {
          setFieldError("gender", "Gender is required");
          setStatus("Gender is required");
          setSubmitting(false);
          return;
        }
        
        if (!values.address) {
          setFieldError("address", "Address is required");
          setStatus("Address is required");
          setSubmitting(false);
          return;
        }
        
        if (!values.phone) {
          setFieldError("phone", "Phone is required");
          setStatus("Phone is required");
          setSubmitting(false);
          return;
        }
        
        // Create a simple object with just the data we need
        const studentData = {
          name: values.name,
          email: values.email,
          phone: values.phone,
          gender: values.gender,
          address: values.address,
          parentName: values.parentName,
          parentPhone: values.parentPhone,
          standard: values.standard,
          subjects: values.subjects || [],
          batches: values.batches || [],
          board: values.board,
          schoolName: values.schoolName,
          dateOfBirth: values.dateOfBirth,
          joiningDate: values.joiningDate,
          previousPercentage: values.previousPercentage ? parseFloat(values.previousPercentage) : null
        };
        
        console.log("About to submit student data:", studentData);
        console.log("Gender being submitted:", studentData.gender);
        console.log("Address being submitted:", studentData.address);
        console.log("Phone being submitted:", studentData.phone);
        
        if (editingStudent) {
          await dispatch(updateStudent({ id: editingStudent._id, data: studentData })).unwrap();
        } else {
          await dispatch(createStudent(studentData)).unwrap();
        }
      } catch (error) {
        console.error("Error saving student:", error);
        setStatus(error.message || "Failed to save student");
        setSubmitting(false);
      }
    },
  });

  // Handler for standard selection that filters subjects
  const handleStandardChange = (e) => {
    const standardId = e.target.value;
    formik.setFieldValue("standard", standardId);
    formik.setFieldValue("subjects", []);
    formik.setFieldValue("batches", []);

    // console.log("Selected standard:", standardId);
    setFormLoading(true);

    // Always fetch subjects from API for selected standard to ensure fresh data
    subjectService
      .getByStandard(standardId)
      .then((response) => {
        // console.log("Fetched subjects from API:", response.data);
        // Handle different response formats
        const subjectsData = Array.isArray(response.data)
          ? response.data
          : response.data.data || [];

        setFilteredSubjects(subjectsData);
      })
      .catch((error) => {
        console.error("Error fetching subjects for standard:", error);
        setFilteredSubjects([]);

        // Fallback to filtering from state if API call fails
        const standardSubjects = subjects.filter((subject) => {
          const subjectStandardId = subject.standard?._id || subject.standard;
          return subjectStandardId === standardId;
        });

        if (standardSubjects.length > 0) {
          // console.log("Using fallback subjects from state:", standardSubjects);
          setFilteredSubjects(standardSubjects);
        }
      })
      .finally(() => {
        setFormLoading(false);
      });

    // Clear batches when standard changes
    setFilteredBatches([]);
  };

  // Handler for subject selection that filters batches
  const handleSubjectChange = (e) => {
    const selectedSubjectIds = e.target.value;
    const previousSubjects = formik.values.subjects;

    // console.log("Previous subjects:", previousSubjects);
    // console.log("New selected subjects:", selectedSubjectIds);

    // Find subjects that were deselected
    const deselectedSubjects = previousSubjects.filter(
      (id) => !selectedSubjectIds.includes(id)
    );

    // Update form values for subjects
    formik.setFieldValue("subjects", selectedSubjectIds);

    if (deselectedSubjects.length > 0) {
      // console.log("Subjects deselected:", deselectedSubjects);

      // Remove batches associated with deselected subjects
      const currentBatches = formik.values.batches;

      // Only keep batches if we still have active subjects
      if (selectedSubjectIds.length > 0) {
        // Find which batches to keep by fetching current batches info
        const updatedBatches = [...currentBatches];

        // Get all batches for the remaining subjects
        batchService
          .getBySubject(selectedSubjectIds, formik.values.standard, {
            populateEnrolledStudents: true,
          })
          .then((response) => {
            // console.log("Fetched updated batches:", response.data);

            // Get valid batch IDs
            const validBatchIds = Array.isArray(response.data)
              ? response.data.map((batch) => batch._id)
              : (response.data.data || []).map((batch) => batch._id);

            // Filter out batches that are no longer valid
            const validBatches = currentBatches.filter((batchId) =>
              validBatchIds.includes(batchId)
            );

            // console.log("Updated batch selection:", validBatches);
            formik.setFieldValue("batches", validBatches);
            setFilteredBatches(
              Array.isArray(response.data)
                ? response.data
                : response.data.data || []
            );
          })
          .catch((error) => {
            console.error("Error updating batches after deselect:", error);
            // Remove all batches if we can't determine which ones to keep
            formik.setFieldValue("batches", []);
            setFilteredBatches([]);
          });
      } else {
        // Clear all batches if no subjects are selected
        formik.setFieldValue("batches", []);
        setFilteredBatches([]);
      }
    } else if (selectedSubjectIds.length > 0) {
      // New subjects were selected, fetch all relevant batches
      setFormLoading(true);

      // Use service directly for simpler error handling
      batchService
        .getBySubject(selectedSubjectIds, formik.values.standard, {
          populateEnrolledStudents: true,
        })
        .then((response) => {
          // console.log("Fetched batches from API:", response.data);
          // Handle different response formats
          const batchesData = Array.isArray(response.data)
            ? response.data
            : response.data.data || [];

          // Group batches by subject for better display
          const batchesBySubject = {};
          batchesData.forEach((batch) => {
            const subjectId = batch.subject?._id || batch.subject;
            if (!batchesBySubject[subjectId]) {
              batchesBySubject[subjectId] = [];
            }
            batchesBySubject[subjectId].push(batch);
          });

          // console.log("Grouped batches by subject:", batchesBySubject);
          setFilteredBatches(batchesData);
        })
        .catch((error) => {
          console.error("Error fetching batches:", error);
          setFilteredBatches([]);
        })
        .finally(() => {
          setFormLoading(false);
        });
    } else {
      // No subjects selected
      formik.setFieldValue("batches", []);
      setFilteredBatches([]);
    }
  };

  // Handle batch selection with proper array handling
  const handleBatchChange = (event) => {
    const selectedBatches = event.target.value;
    // console.log("Batch selection changed:", selectedBatches);

    // Make sure it's always an array even if only one item is selected
    const batchesArray = Array.isArray(selectedBatches)
      ? selectedBatches
      : [selectedBatches];

    // Filter out any undefined or null values that might cause issues
    const validBatches = batchesArray.filter((batch) => batch);

    // console.log("Setting batches to:", validBatches);
    formik.setFieldValue("batches", validBatches);

    // Debug to verify selection state
    setTimeout(() => {
      // console.log("Updated batches in formik:", formik.values.batches);
    }, 0);
  };

  const handleOpen = (student = null) => {
    if (student) {
      setEditingStudent(student);
      // console.log("Opening student for edit:", student);

      // Get student standard ID
      const studentStandardId = student.standard?._id || student.standard;

      // Get subject IDs from student
      const studentSubjectIds =
        student.subjects?.map((subject) =>
          typeof subject === "object" ? subject._id : subject
        ) || [];

      // console.log("Student standard ID:", studentStandardId);
      // console.log("Student subject IDs:", studentSubjectIds);

      // Get student batch IDs
      const studentBatchIds =
        student.batches?.map((batch) =>
          typeof batch === "object" ? batch._id : batch
        ) || [];

      // console.log("Student batch IDs:", studentBatchIds);

      // Format dates correctly
      let dateOfBirth = "";
      if (student.dateOfBirth) {
        try {
          // Handle different date formats
          const date = new Date(student.dateOfBirth);
          if (!isNaN(date.getTime())) {
            // Format as YYYY-MM-DD for the date input
            dateOfBirth = date.toISOString().split("T")[0];
          } else if (typeof student.dateOfBirth === "string") {
            dateOfBirth = student.dateOfBirth.includes("T")
              ? student.dateOfBirth.split("T")[0]
              : student.dateOfBirth;
          }
        } catch (error) {
          console.error("Error formatting date of birth:", error);
          dateOfBirth = "";
        }
      }

      let joiningDate = "";
      if (student.joiningDate) {
        try {
          // Handle different date formats
          const date = new Date(student.joiningDate);
          if (!isNaN(date.getTime())) {
            // Format as YYYY-MM-DD for the date input
            joiningDate = date.toISOString().split("T")[0];
          } else if (typeof student.joiningDate === "string") {
            joiningDate = student.joiningDate.includes("T")
              ? student.joiningDate.split("T")[0]
              : student.joiningDate;
          }
        } catch (error) {
          console.error("Error formatting joining date:", error);
          joiningDate = "";
        }
      }

      // console.log("Formatted DOB:", dateOfBirth);
      // console.log("Formatted Joining Date:", joiningDate);

      // Set form values immediately so the form is populated
      formik.setValues({
        name: student.name || "",
        email: student.email || "",
        phone: student.phone || "",
        standard: studentStandardId || "",
        subjects: studentSubjectIds,
        batches: studentBatchIds,
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

      // Filter subjects by standard - First load from API to ensure we have the latest data
      setFormLoading(true);

      subjectService
        .getByStandard(studentStandardId)
        .then((response) => {
          // console.log("Fetched subjects from API for editing:", response.data);
          // Handle different response formats
          const subjectsData = Array.isArray(response.data)
            ? response.data
            : response.data.data || [];

          setFilteredSubjects(subjectsData);
        })
        .catch((error) => {
          console.error("Error fetching subjects for editing:", error);
          // Fallback to filtering from state if API call fails
          const availableSubjects = subjects.filter((subject) => {
            const subjectStandardId = subject.standard?._id || subject.standard;
            return subjectStandardId === studentStandardId;
          });

          // console.log("Fallback subjects for editing:", availableSubjects);
          setFilteredSubjects(availableSubjects);
        })
        .finally(() => {
          // Only fetch batches after subjects are loaded
          // Load batches for these subjects
          batchService
            .getBySubject(studentSubjectIds, studentStandardId, {
              populateEnrolledStudents: true,
            })
            .then((response) => {
              // console.log("Fetched batches for student:", response.data);
              // Handle different response formats
              const batchesData = Array.isArray(response.data)
                ? response.data
                : response.data.data || [];

              setFilteredBatches(batchesData);

              // Ensure all valid batches are visible
              // console.log("Available batches for these subjects:", batchesData);
            })
            .catch((error) => {
              console.error("Error fetching batches for student:", error);
              // Fallback to using batch data from redux store
              const availableBatches = batches.filter((batch) => {
                const batchStandardId = batch.standard?._id || batch.standard;
                const batchSubjectId = batch.subject?._id || batch.subject;

                return (
                  batchStandardId === studentStandardId &&
                  studentSubjectIds.includes(batchSubjectId)
                );
              });

              // console.log(
              //   "Fallback batches for this student:",
              //   availableBatches
              // );
              setFilteredBatches(availableBatches);
            })
            .finally(() => {
              setFormLoading(false);
            });
        });
    } else {
      setEditingStudent(null);
      setFilteredSubjects([]);
      setFilteredBatches([]);
      formik.resetForm();
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingStudent(null);
    formik.resetForm();
    setFilteredSubjects([]);
    setFilteredBatches([]);
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

  // Date formatting function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format batch status with appropriate color
  const getBatchStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "success.main";
      case "upcoming":
        return "info.main";
      case "completed":
        return "warning.main";
      case "cancelled":
        return "error.main";
      default:
        return "text.secondary";
    }
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
      {/* Enhanced Header with gradient background */}
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          borderRadius: 2,
          background: `linear-gradient(to right, ${alpha(
            theme.palette.primary.main,
            0.8
          )}, ${alpha(theme.palette.primary.dark, 0.9)})`,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: { xs: 2, sm: 0 },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontSize: { xs: "1.5rem", sm: "1.8rem", md: "2rem" },
                color: "white",
                fontWeight: 600,
              }}
            >
              Students Management
            </Typography>
            <RefreshButton
              onRefresh={loadAllData}
              tooltip="Refresh students data"
              sx={{ ml: 1.5, color: "white" }}
            />
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
            sx={{
              alignSelf: { xs: "flex-start", sm: "auto" },
              bgcolor: "white",
              color: theme.palette.primary.main,
              fontWeight: 500,
              "&:hover": {
                bgcolor: alpha(theme.palette.common.white, 0.9),
              },
              px: 2,
              py: 1,
              borderRadius: 2,
              boxShadow: 2,
            }}
          >
            Add Student
          </Button>
        </Box>

        {/* Stats row with cards */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            mt: 3,
          }}
        >
          <Paper
            elevation={2}
            sx={{
              flex: "1 1 200px",
              p: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 2,
              bgcolor: alpha(theme.palette.common.white, 0.9),
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: 4,
              },
            }}
          >
            <Typography
              variant="h6"
              color="primary.main"
              fontWeight={600}
              gutterBottom
            >
              Total Students
            </Typography>
            <Typography variant="h4" color="text.primary">
              {statsLoading ? (
                <CircularProgress size={28} />
              ) : (
                totalStudentCount
              )}
            </Typography>
          </Paper>

          <Paper
            elevation={2}
            sx={{
              flex: "1 1 200px",
              p: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 2,
              bgcolor: alpha(theme.palette.common.white, 0.9),
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: 4,
              },
            }}
          >
            <Typography
              variant="h6"
              color="secondary.main"
              fontWeight={600}
              gutterBottom
            >
              Active Students
            </Typography>
            <Typography variant="h4" color="text.primary">
              {statsLoading ? (
                <CircularProgress size={28} />
              ) : (
                Math.floor(totalStudentCount * 0.85)
              )}
            </Typography>
          </Paper>

          <Paper
            elevation={2}
            sx={{
              flex: "1 1 200px",
              p: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 2,
              bgcolor: alpha(theme.palette.common.white, 0.9),
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: 4,
              },
            }}
          >
            <Typography
              variant="h6"
              color="info.main"
              fontWeight={600}
              gutterBottom
            >
              Results
            </Typography>
            <Typography variant="h4" color="text.primary">
              {filteredStudentsList.length}
            </Typography>
          </Paper>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.toString()}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success.toString()}
        </Alert>
      )}

      {/* Filter Accordion */}
      <Accordion
        expanded={filterExpanded}
        onChange={() => setFilterExpanded(!filterExpanded)}
        sx={{
          mb: 3,
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: filterExpanded ? 3 : 1,
          "&::before": {
            display: "none",
          },
          transition: "all 0.3s ease",
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            backgroundColor: alpha(theme.palette.primary.light, 0.05),
            borderBottom: filterExpanded
              ? `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
              : "none",
            "&:hover": {
              backgroundColor: alpha(theme.palette.primary.light, 0.1),
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FilterIcon color="primary" />
            <Typography variant="subtitle1" fontWeight={500}>
              Filters
            </Typography>
            {(nameFilter ||
              standardFilter ||
              subjectFilter ||
              genderFilter) && (
              <Chip
                label={`${[
                  nameFilter ? 1 : 0,
                  standardFilter ? 1 : 0,
                  subjectFilter ? 1 : 0,
                  genderFilter ? 1 : 0,
                ].reduce((a, b) => a + b, 0)} active filters`}
                size="small"
                color="primary"
                sx={{ fontWeight: 500 }}
              />
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails
          sx={{
            px: { xs: 2, sm: 3 },
            py: 2.5,
            bgcolor: alpha(theme.palette.background.default, 0.5),
          }}
        >
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Search by Name/Email/Phone"
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
                        sx={{ color: "text.secondary" }}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 1.5 },
                }}
                variant="outlined"
                size="small"
                sx={{ bgcolor: "background.paper" }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Filter by Standard"
                value={standardFilter}
                onChange={(e) => setStandardFilter(e.target.value)}
                InputProps={{ sx: { borderRadius: 1.5 } }}
                variant="outlined"
                size="small"
                sx={{ bgcolor: "background.paper" }}
              >
                <MenuItem value="">All Standards</MenuItem>
                {standards.map((standard) => (
                  <MenuItem key={standard._id} value={standard._id}>
                    {standard.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Filter by Subject"
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                InputProps={{ sx: { borderRadius: 1.5 } }}
                variant="outlined"
                size="small"
                sx={{ bgcolor: "background.paper" }}
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
                label="Filter by Gender"
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                InputProps={{ sx: { borderRadius: 1.5 } }}
                variant="outlined"
                size="small"
                sx={{ bgcolor: "background.paper" }}
              >
                <MenuItem value="">All Genders</MenuItem>
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
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
                    !standardFilter &&
                    !subjectFilter &&
                    !genderFilter
                  }
                  sx={{ borderRadius: 1.5, textTransform: "none" }}
                >
                  Clear All Filters
                </Button>
              </Box>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Results count */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: { xs: 1, sm: 0 },
          p: 2,
          backgroundColor: alpha(theme.palette.primary.light, 0.05),
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        }}
      >
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          Showing{" "}
          <Box component="span" sx={{ fontWeight: 600, color: "primary.main" }}>
            {filteredStudentsList.length}
          </Box>{" "}
          of {students.length} students
        </Typography>
        {filteredStudentsList.length === 0 && students.length > 0 && (
          <Alert
            severity="info"
            sx={{ py: 0, width: { xs: "100%", sm: "auto" }, borderRadius: 1 }}
            icon={<SearchIcon fontSize="small" />}
          >
            No students match your filter criteria
          </Alert>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 6 }}>
          <CircularProgress />
        </Box>
      ) : isMobile ? (
        // Enhanced Mobile card view
        <Stack spacing={2}>
          {filteredStudentsList.length > 0 ? (
            filteredStudentsList.map((student) => (
              <Card
                key={student._id}
                sx={{
                  width: "100%",
                  borderRadius: 2,
                  boxShadow: 2,
                  transition: "all 0.3s ease",
                  overflow: "hidden",
                  "&:hover": {
                    boxShadow: 6,
                    transform: "translateY(-4px)",
                  },
                }}
              >
                <Box
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    py: 1.5,
                    px: 2,
                    borderBottom: `1px solid ${alpha(
                      theme.palette.primary.main,
                      0.1
                    )}`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Avatar
                      sx={{
                        bgcolor: theme.palette.primary.main,
                        color: "white",
                        width: 36,
                        height: 36,
                        fontSize: "1rem",
                        fontWeight: 600,
                      }}
                    >
                      {student.name?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography
                        variant="subtitle1"
                        component="div"
                        sx={{
                          fontWeight: 600,
                          color: theme.palette.primary.main,
                        }}
                      >
                        {student.name}
                      </Typography>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Chip
                          label={
                            student.gender
                              ? student.gender.charAt(0).toUpperCase() +
                                student.gender.slice(1)
                              : "Unknown"
                          }
                          size="small"
                          color={
                            student.gender === "male"
                              ? "info"
                              : student.gender === "female"
                              ? "secondary"
                              : "default"
                          }
                          sx={{
                            height: 20,
                            fontSize: "0.7rem",
                            fontWeight: 500,
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          ID: {student._id.slice(-6).toUpperCase()}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
                <CardContent sx={{ pb: 1 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box>
                        <Typography
                          variant="subtitle2"
                          color="primary"
                          sx={{
                            fontWeight: 600,
                            mb: 1,
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <Box
                            sx={{
                              width: 18,
                              height: 18,
                              borderRadius: "50%",
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <EmailIcon
                              fontSize="small"
                              color="primary"
                              sx={{ fontSize: 12 }}
                            />
                          </Box>
                          Contact
                        </Typography>
                        <Box sx={{ pl: 0.5 }}>
                          <Typography
                            variant="body2"
                            fontWeight="medium"
                            noWrap
                            sx={{ mb: 0.5 }}
                          >
                            {student.email}
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight="medium"
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <PhoneIcon
                              fontSize="small"
                              color="primary"
                              sx={{ fontSize: 14 }}
                            />
                            {student.phone}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box>
                        <Typography
                          variant="subtitle2"
                          color="primary"
                          sx={{
                            fontWeight: 600,
                            mb: 1,
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <Box
                            sx={{
                              width: 18,
                              height: 18,
                              borderRadius: "50%",
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <SchoolIcon
                              fontSize="small"
                              color="primary"
                              sx={{ fontSize: 12 }}
                            />
                          </Box>
                          Standard
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight="medium"
                          sx={{ pl: 0.5 }}
                        >
                          {standards.find(
                            (s) => s._id === student.standard?._id
                          )?.name || "Not assigned"}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography
                        variant="subtitle2"
                        color="primary"
                        sx={{
                          fontWeight: 600,
                          mb: 1,
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        <Box
                          sx={{
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            bgcolor: alpha(theme.palette.secondary.main, 0.1),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <BookIcon
                            fontSize="small"
                            color="secondary"
                            sx={{ fontSize: 12 }}
                          />
                        </Box>
                        Subjects & Batches
                      </Typography>
                      <Box sx={{ mb: 1 }}>
                        {student.subjects?.length > 0 ? (
                          <Box
                            sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                          >
                            {student.subjects?.map((subject) => (
                              <Chip
                                key={subject._id}
                                label={subject.name}
                                size="small"
                                color="secondary"
                                variant="outlined"
                                sx={{ fontWeight: 500, borderRadius: 1 }}
                              />
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No subjects
                          </Typography>
                        )}
                      </Box>
                      <Box>
                        {student.batches?.length > 0 ? (
                          <Box
                            sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                          >
                            {student.batches?.map((batch) => (
                              <Chip
                                key={batch._id}
                                label={batch.name}
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ fontWeight: 500, borderRadius: 1 }}
                              />
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No batches
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
                <CardActions
                  sx={{
                    px: 2,
                    py: 1.5,
                    bgcolor: alpha(theme.palette.background.default, 0.5),
                    borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    justifyContent: "flex-end",
                  }}
                >
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<VisibilityIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewStudent(student);
                    }}
                    sx={{ mr: 1, borderRadius: 1.5, textTransform: "none" }}
                  >
                    View
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpen(student);
                    }}
                    color="primary"
                    sx={{ mr: 1, borderRadius: 1.5, textTransform: "none" }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<DeleteIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(student._id);
                    }}
                    color="error"
                    sx={{ borderRadius: 1.5, textTransform: "none" }}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            ))
          ) : (
            <Paper
              sx={{
                p: 3,
                textAlign: "center",
                borderRadius: 2,
                border: `1px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
                bgcolor: alpha(theme.palette.primary.light, 0.03),
              }}
            >
              <PersonIcon
                sx={{
                  fontSize: 60,
                  color: alpha(theme.palette.text.secondary, 0.2),
                  mb: 1,
                }}
              />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Students Found
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {students.length === 0
                  ? "There are no students in the database. Add one to get started."
                  : "No students match your filter criteria. Try adjusting your filters."}
              </Typography>
              {students.length === 0 && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpen()}
                  sx={{ mt: 1, borderRadius: 1.5 }}
                >
                  Add First Student
                </Button>
              )}
              {students.length > 0 && (
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={clearFilters}
                  sx={{ mt: 1, borderRadius: 1.5 }}
                >
                  Clear Filters
                </Button>
              )}
            </Paper>
          )}
        </Stack>
      ) : (
        // Enhanced Desktop table view
        <Paper
          elevation={4}
          sx={{
            width: "100%",
            overflow: "hidden",
            borderRadius: 2.5,
            mb: 4,
            transition: "all 0.3s ease",
            "&:hover": {
              boxShadow: 6,
              transform: "translateY(-2px)",
            },
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          }}
        >
          <TableContainer
            sx={{ maxHeight: "calc(100vh - 300px)", minHeight: 200 }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.9),
                      color: "white",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      fontSize: "0.875rem",
                      py: 2.5,
                      px: 2.5,
                      borderBottom: `2px solid ${theme.palette.primary.dark}`,
                    }}
                  >
                    Student
                  </TableCell>
                  <TableCell
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.9),
                      color: "white",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      fontSize: "0.875rem",
                      py: 2.5,
                      px: 2.5,
                      borderBottom: `2px solid ${theme.palette.primary.dark}`,
                    }}
                  >
                    Contact Info
                  </TableCell>
                  <TableCell
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.9),
                      color: "white",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      fontSize: "0.875rem",
                      py: 2.5,
                      px: 2.5,
                      borderBottom: `2px solid ${theme.palette.primary.dark}`,
                    }}
                  >
                    Standard
                  </TableCell>
                  <TableCell
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.9),
                      color: "white",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      fontSize: "0.875rem",
                      py: 2.5,
                      px: 2.5,
                      borderBottom: `2px solid ${theme.palette.primary.dark}`,
                    }}
                  >
                    Subjects & Batches
                  </TableCell>
                  {!isTablet && (
                    <TableCell
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.9),
                        color: "white",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        fontSize: "0.875rem",
                        py: 2.5,
                        px: 2.5,
                        borderBottom: `2px solid ${theme.palette.primary.dark}`,
                      }}
                    >
                      Parent Info
                    </TableCell>
                  )}
                  {!isTablet && (
                    <TableCell
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.9),
                        color: "white",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        fontSize: "0.875rem",
                        py: 2.5,
                        px: 2.5,
                        borderBottom: `2px solid ${theme.palette.primary.dark}`,
                      }}
                    >
                      School
                    </TableCell>
                  )}
                  <TableCell
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.9),
                      color: "white",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      fontSize: "0.875rem",
                      py: 2.5,
                      px: 2.5,
                      borderBottom: `2px solid ${theme.palette.primary.dark}`,
                    }}
                  >
                    Joining Date
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.9),
                      color: "white",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      fontSize: "0.875rem",
                      py: 2.5,
                      px: 2.5,
                      borderBottom: `2px solid ${theme.palette.primary.dark}`,
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStudentsList.length > 0 ? (
                  filteredStudentsList.map((student, index) => (
                    <TableRow
                      key={student._id}
                      sx={{
                        "&:nth-of-type(odd)": {
                          backgroundColor: alpha(
                            theme.palette.primary.light,
                            0.04
                          ),
                        },
                        "&:hover": {
                          backgroundColor: alpha(
                            theme.palette.primary.light,
                            0.1
                          ),
                          cursor: "pointer",
                          transform: "scale(1.004)",
                          transition:
                            "transform 0.2s ease, background-color 0.2s ease",
                        },
                        transition:
                          "background-color 0.2s ease, transform 0.2s ease",
                        borderLeft:
                          index % 2 === 0
                            ? `2px solid ${alpha(
                                theme.palette.primary.light,
                                0.2
                              )}`
                            : `2px solid transparent`,
                      }}
                      onClick={() => handleViewStudent(student)}
                    >
                      <TableCell sx={{ py: 1.5, px: 2.5 }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Avatar
                            sx={{
                              bgcolor: theme.palette.primary.main,
                              color: "white",
                              width: 38,
                              height: 38,
                              mr: 1.5,
                              fontSize: "1rem",
                              fontWeight: 600,
                              boxShadow: 1,
                            }}
                          >
                            {student.name?.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography
                              variant="body1"
                              fontWeight="600"
                              color="primary.main"
                              sx={{ mb: 0.3 }}
                            >
                              {student.name || "—"}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.8,
                              }}
                            >
                              <Chip
                                label={
                                  student.gender
                                    ? student.gender.charAt(0).toUpperCase() +
                                      student.gender.slice(1)
                                    : "—"
                                }
                                size="small"
                                color={
                                  student.gender === "male"
                                    ? "info"
                                    : student.gender === "female"
                                    ? "secondary"
                                    : "default"
                                }
                                sx={{
                                  height: 20,
                                  fontSize: "0.7rem",
                                  fontWeight: 500,
                                  boxShadow: `0 1px 2px ${alpha(
                                    theme.palette.common.black,
                                    0.1
                                  )}`,
                                }}
                              />
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ opacity: 0.8 }}
                              >
                                ID: {student._id.slice(-6).toUpperCase()}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 1.5, px: 2.5 }}>
                        <Box sx={{ display: "flex", flexDirection: "column" }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 0.8,
                            }}
                          >
                            <Tooltip title="Email">
                              <EmailIcon
                                fontSize="small"
                                color="primary"
                                sx={{ mr: 1, fontSize: "1rem" }}
                              />
                            </Tooltip>
                            <Typography
                              variant="body2"
                              fontWeight="medium"
                              sx={{ wordBreak: "break-word" }}
                            >
                              {student.email || "—"}
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Tooltip title="Phone">
                              <PhoneIcon
                                fontSize="small"
                                color="primary"
                                sx={{ mr: 1, fontSize: "1rem" }}
                              />
                            </Tooltip>
                            <Typography variant="body2" fontWeight="medium">
                              {student.phone || "—"}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 1.5, px: 2.5 }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Box
                            sx={{
                              width: 28,
                              height: 28,
                              borderRadius: "50%",
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              mr: 1,
                              boxShadow: `0 1px 3px ${alpha(
                                theme.palette.common.black,
                                0.1
                              )}`,
                            }}
                          >
                            <SchoolIcon
                              fontSize="small"
                              color="primary"
                              sx={{ fontSize: 16 }}
                            />
                          </Box>
                          <Typography variant="body2" fontWeight="medium">
                            {standards.find(
                              (s) => s._id === student.standard?._id
                            )?.name ||
                              student.standard?.name ||
                              "—"}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 1.5, px: 2.5 }}>
                        {/* Subjects */}
                        <Box sx={{ mb: 1.2 }}>
                          {student.subjects?.length > 0 ? (
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 0.7,
                              }}
                            >
                              {student.subjects?.map((subject) => (
                                <Chip
                                  key={subject._id}
                                  label={subject.name}
                                  size="small"
                                  color="secondary"
                                  variant="outlined"
                                  sx={{
                                    fontWeight: 500,
                                    borderRadius: 1,
                                    boxShadow: `0 1px 2px ${alpha(
                                      theme.palette.common.black,
                                      0.08
                                    )}`,
                                    "&:hover": {
                                      boxShadow: `0 2px 4px ${alpha(
                                        theme.palette.common.black,
                                        0.15
                                      )}`,
                                    },
                                  }}
                                />
                              ))}
                            </Box>
                          ) : (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontStyle: "italic" }}
                            >
                              No subjects
                            </Typography>
                          )}
                        </Box>
                        {/* Batches */}
                        <Box>
                          {student.batches?.length > 0 ? (
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 0.7,
                              }}
                            >
                              {student.batches?.map((batch) => (
                                <Chip
                                  key={batch._id}
                                  label={batch.name}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                  sx={{
                                    fontWeight: 500,
                                    borderRadius: 1,
                                    boxShadow: `0 1px 2px ${alpha(
                                      theme.palette.common.black,
                                      0.08
                                    )}`,
                                    "&:hover": {
                                      boxShadow: `0 2px 4px ${alpha(
                                        theme.palette.common.black,
                                        0.15
                                      )}`,
                                    },
                                  }}
                                />
                              ))}
                            </Box>
                          ) : (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontStyle: "italic" }}
                            >
                              No batches
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      {!isTablet && (
                        <TableCell sx={{ py: 1.5, px: 2.5 }}>
                          <Box
                            sx={{ display: "flex", flexDirection: "column" }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 0.5,
                              }}
                            >
                              <PersonIcon
                                fontSize="small"
                                color="primary"
                                sx={{ mr: 1, fontSize: "1rem" }}
                              />
                              <Typography variant="body2" fontWeight="medium">
                                {student.parentName || "—"}
                              </Typography>
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <PhoneIcon
                                fontSize="small"
                                color="action"
                                sx={{ mr: 1, fontSize: "1rem" }}
                              />
                              <Typography variant="body2">
                                {student.parentPhone || "—"}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                      )}
                      {!isTablet && (
                        <TableCell sx={{ py: 1.5, px: 2.5 }}>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Box
                              sx={{
                                width: 26,
                                height: 26,
                                borderRadius: "50%",
                                bgcolor: alpha(theme.palette.info.main, 0.1),
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                mr: 1,
                              }}
                            >
                              <SchoolIcon
                                fontSize="small"
                                color="info"
                                sx={{ fontSize: 14 }}
                              />
                            </Box>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {student.schoolName || "—"}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {student.board || "—"}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                      )}
                      <TableCell sx={{ py: 1.5, px: 2.5 }}>
                        <Typography variant="body2" fontWeight="medium">
                          {formatDate(student.joiningDate) || "—"}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ py: 1.5, px: 2.5 }}>
                        <Box
                          sx={{ display: "flex", justifyContent: "flex-end" }}
                        >
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewStudent(student);
                              }}
                              sx={{
                                mr: 0.5,
                                color: theme.palette.info.main,
                                "&:hover": {
                                  backgroundColor: alpha(
                                    theme.palette.info.main,
                                    0.1
                                  ),
                                },
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Student">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpen(student);
                              }}
                              sx={{
                                mr: 0.5,
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
                          </Tooltip>
                          <Tooltip title="Delete Student">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(student._id);
                              }}
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
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      sx={{
                        textAlign: "center",
                        py: 4,
                        opacity: 0.7,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        <PersonIcon
                          sx={{
                            fontSize: 48,
                            color: alpha(theme.palette.text.secondary, 0.4),
                            mb: 1,
                          }}
                        />
                        <Typography
                          variant="h6"
                          color="text.secondary"
                          gutterBottom
                        >
                          No Students Found
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          paragraph
                        >
                          {students.length === 0
                            ? "There are no students in the database. Add one to get started."
                            : "No students match your filter criteria. Try adjusting your filters."}
                        </Typography>
                        {students.length === 0 && (
                          <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpen()}
                            sx={{ mt: 1, borderRadius: 1.5 }}
                          >
                            Add First Student
                          </Button>
                        )}
                        {students.length > 0 && (
                          <Button
                            variant="outlined"
                            startIcon={<ClearIcon />}
                            onClick={clearFilters}
                            sx={{ mt: 1, borderRadius: 1.5 }}
                          >
                            Clear Filters
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

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
            height: isMobile ? "100%" : "auto",
            display: "flex",
            flexDirection: "column",
            maxHeight: isMobile ? "100%" : "90vh",
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
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          {editingStudent ? (
            <EditIcon sx={{ fontSize: "1.8rem" }} />
          ) : (
            <PersonIcon sx={{ fontSize: "1.8rem" }} />
          )}
          <Typography variant="h6" fontWeight={600}>
            {editingStudent ? "Edit Student" : "Add New Student"}
          </Typography>
        </DialogTitle>
        <form
          onSubmit={formik.handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            height: isMobile ? "100%" : "auto",
            overflow: "hidden",
            flexGrow: 1,
          }}
        >
          <DialogContent
            dividers
            sx={{
              p: { xs: 2, sm: 3 },
              overflowY: "auto",
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {formik.status && (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  borderRadius: 1.5,
                }}
              >
                {formik.status}
              </Alert>
            )}
            <Box
              sx={{
                mb: 3,
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.light, 0.05),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <Box
                  component="span"
                  sx={{
                    display: "inline-flex",
                    p: 0.5,
                    borderRadius: "50%",
                    bgcolor: alpha(theme.palette.info.main, 0.1),
                  }}
                >
                  <InfoIcon fontSize="small" color="info" />
                </Box>
                Fill in the details below to{" "}
                {editingStudent ? "update" : "create"} a student. Fields marked
                with * are required.
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    pb: 1,
                    mb: 1,
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
                    Basic Information
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="name"
                  label="Name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon fontSize="small" color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel id="gender-label">Gender</InputLabel>
                  <Select
                    labelId="gender-label"
                    name="gender"
                    value={formik.values.gender || ""}
                    onChange={(e) => {
                      const selectedGender = e.target.value;
                      console.log("Selected gender:", selectedGender);
                      formik.setFieldValue("gender", selectedGender);
                    }}
                    error={
                      formik.touched.gender && Boolean(formik.errors.gender)
                    }
                    label="Gender"
                  >
                    <MenuItem value="">
                      <em>Select Gender</em>
                    </MenuItem>
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                  {formik.touched.gender && formik.errors.gender && (
                    <FormHelperText error>
                      {formik.errors.gender}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="dateOfBirth"
                  label="Date of Birth"
                  type="date"
                  value={formik.values.dateOfBirth}
                  onChange={(e) => {
                    formik.setFieldValue("dateOfBirth", e.target.value);
                  }}
                  error={
                    formik.touched.dateOfBirth &&
                    Boolean(formik.errors.dateOfBirth)
                  }
                  helperText={
                    formik.touched.dateOfBirth && formik.errors.dateOfBirth
                  }
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarTodayIcon fontSize="small" color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="address"
                  label="Address"
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.address && Boolean(formik.errors.address)
                  }
                  helperText={formik.touched.address && formik.errors.address}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <HomeIcon fontSize="small" color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                />
              </Grid>

              <Grid item xs={12}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    pt: 2,
                    pb: 1,
                    mb: 1,
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
                    <PhoneIcon fontSize="small" />
                    Contact Information
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="email"
                  label="Email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon fontSize="small" color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="phone"
                  label="Phone Number"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  error={formik.touched.phone && Boolean(formik.errors.phone)}
                  helperText={formik.touched.phone && formik.errors.phone}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon fontSize="small" color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="parentName"
                  label="Parent Name"
                  value={formik.values.parentName}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.parentName &&
                    Boolean(formik.errors.parentName)
                  }
                  helperText={
                    formik.touched.parentName && formik.errors.parentName
                  }
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon fontSize="small" color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="parentPhone"
                  label="Parent Phone Number"
                  value={formik.values.parentPhone}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.parentPhone &&
                    Boolean(formik.errors.parentPhone)
                  }
                  helperText={
                    formik.touched.parentPhone && formik.errors.parentPhone
                  }
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon fontSize="small" color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                />
              </Grid>

              <Grid item xs={12}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    pt: 2,
                    pb: 1,
                    mb: 1,
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

              <Grid item xs={12} sm={6}>
                <FormControl
                  fullWidth
                  error={
                    formik.touched.standard && Boolean(formik.errors.standard)
                  }
                  required
                >
                  <InputLabel id="standard-label">Standard</InputLabel>
                  <Select
                    labelId="standard-label"
                    name="standard"
                    value={formik.values.standard}
                    onChange={handleStandardChange}
                    label="Standard"
                    sx={{ borderRadius: 1.5 }}
                  >
                    <MenuItem value="" disabled>
                      Select a standard
                    </MenuItem>
                    {standards.map((standard) => (
                      <MenuItem key={standard._id} value={standard._id}>
                        {standard.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.standard && formik.errors.standard && (
                    <FormHelperText>{formik.errors.standard}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Subjects</InputLabel>
                  <Select
                    multiple
                    name="subjects"
                    value={formik.values.subjects || []}
                    onChange={handleSubjectChange}
                    label="Subjects"
                    disabled={!formik.values.standard || formLoading}
                    error={
                      formik.touched.subjects && Boolean(formik.errors.subjects)
                    }
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selected.map((value) => {
                          // Find subject name
                          const subject =
                            subjects.find((s) => s._id === value) ||
                            filteredSubjects.find((s) => s._id === value);
                          return (
                            <Chip
                              key={value}
                              label={subject ? subject.name : value}
                              size="small"
                            />
                          );
                        })}
                      </Box>
                    )}
                  >
                    {formLoading ? (
                      <MenuItem disabled>Loading subjects...</MenuItem>
                    ) : filteredSubjects.length > 0 ? (
                      filteredSubjects.map((subject) => (
                        <MenuItem key={subject._id} value={subject._id}>
                          {subject.name || "Unnamed Subject"}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>
                        {formik.values.standard
                          ? "No subjects available for this standard"
                          : "Select a standard first"}
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="batches-label">Batches</InputLabel>
                  <Select
                    labelId="batches-label"
                    multiple
                    name="batches"
                    value={formik.values.batches || []}
                    onChange={handleBatchChange}
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selected.map((value) => {
                          // Try to find the batch in filtered batches
                          let batchDisplay = value;
                          const filteredBatch = filteredBatches.find(
                            (b) => b._id === value
                          );

                          if (filteredBatch) {
                            batchDisplay = `${filteredBatch.name} (${
                              filteredBatch.teacher?.name || "Unassigned"
                            })`;
                          } else {
                            // If not found in filtered batches, try to find in all batches
                            const batch = batches.find((b) => b._id === value);
                            if (batch) {
                              batchDisplay = `${batch.name} (${
                                batch.teacher?.name || "Unassigned"
                              })`;
                            }
                          }

                          return (
                            <Chip
                              key={value}
                              label={batchDisplay}
                              size="small"
                            />
                          );
                        })}
                      </Box>
                    )}
                    label="Batches"
                    disabled={!formik.values.subjects.length || formLoading}
                    error={
                      formik.touched.batches && Boolean(formik.errors.batches)
                    }
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 300,
                        },
                      },
                    }}
                  >
                    {formLoading ? (
                      <MenuItem disabled>Loading batches...</MenuItem>
                    ) : filteredBatches.length > 0 ? (
                      <>
                        {/* Group batches by subject for clarity */}
                        {formik.values.subjects.map((subjectId) => {
                          // Get subject name
                          const subject = subjects.find(
                            (s) => s._id === subjectId
                          );

                          // Get batches for this subject
                          const subjectBatches = filteredBatches.filter(
                            (batch) => {
                              const batchSubjectId =
                                batch.subject?._id || batch.subject;
                              return batchSubjectId === subjectId;
                            }
                          );

                          return subjectBatches.length > 0 ? (
                            <React.Fragment key={subjectId}>
                              <ListSubheader>
                                {subject?.name || "Unknown Subject"}
                              </ListSubheader>
                              {subjectBatches.map((batch) => (
                                <MenuItem
                                  key={batch._id}
                                  value={batch._id}
                                  onClick={(e) => {
                                    e.preventDefault(); // Prevent default MenuItem behavior
                                    const currentBatches = [
                                      ...formik.values.batches,
                                    ];
                                    const currentIndex = currentBatches.indexOf(
                                      batch._id
                                    );

                                    if (currentIndex === -1) {
                                      // Add the batch
                                      currentBatches.push(batch._id);
                                    } else {
                                      // Remove the batch
                                      currentBatches.splice(currentIndex, 1);
                                    }

                                    // console.log(
                                    //   `Toggling batch ${batch.name}:`,
                                    //   currentBatches
                                    // );
                                    formik.setFieldValue(
                                      "batches",
                                      currentBatches
                                    );
                                  }}
                                  sx={{
                                    paddingLeft: 1,
                                    display: "flex",
                                    alignItems: "flex-start",
                                  }}
                                >
                                  <Checkbox
                                    checked={
                                      formik.values.batches.indexOf(batch._id) >
                                      -1
                                    }
                                    sx={{ padding: "4px", marginRight: "4px" }}
                                    onClick={(e) => e.stopPropagation()} // Prevent double toggle
                                  />
                                  <Box sx={{ flexGrow: 1 }}>
                                    <Typography
                                      variant="body2"
                                      fontWeight="medium"
                                    >
                                      {batch.name || "Unnamed Batch"}
                                    </Typography>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        mt: 0.5,
                                      }}
                                    >
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          color: getBatchStatusColor(
                                            batch.status
                                          ),
                                        }}
                                      >
                                        Status:{" "}
                                        {batch.status
                                          ? batch.status
                                              .charAt(0)
                                              .toUpperCase() +
                                            batch.status.slice(1)
                                          : "Unknown"}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        Teacher:{" "}
                                        {batch.teacher?.name || "Unassigned"}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        Starts:{" "}
                                        {batch.startDate
                                          ? formatDate(batch.startDate)
                                          : "Not set"}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        Time:{" "}
                                        {batch.schedule?.startTime &&
                                        batch.schedule?.endTime
                                          ? `${formatTime(
                                              batch.schedule.startTime
                                            )} - ${formatTime(
                                              batch.schedule.endTime
                                            )}`
                                          : "Not set"}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        Days:{" "}
                                        {batch.schedule?.days?.join(", ") ||
                                          "Not set"}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </MenuItem>
                              ))}
                            </React.Fragment>
                          ) : null;
                        })}

                        {/* If editing a student, show their previously selected batches 
                            from subjects that might not be currently selected */}
                        {editingStudent &&
                          formik.values.batches?.length > 0 && (
                            <>
                              {/* Find batches that are selected but not in the current subject list */}
                              {formik.values.batches.some((batchId) => {
                                // Look up this batch
                                const batch = batches.find(
                                  (b) => b._id === batchId
                                );
                                if (!batch) return false;

                                // Get the subject of this batch
                                const batchSubjectId =
                                  batch.subject?._id || batch.subject;

                                // Check if this subject is not in the currently selected subjects
                                return !formik.values.subjects.includes(
                                  batchSubjectId
                                );
                              }) && (
                                <React.Fragment>
                                  <ListSubheader sx={{ color: "warning.main" }}>
                                    Previously Selected Batches
                                  </ListSubheader>
                                  {formik.values.batches.map((batchId) => {
                                    // Find this batch in all batches
                                    const batch = batches.find(
                                      (b) => b._id === batchId
                                    );
                                    if (!batch) return null;

                                    // Get the subject of this batch
                                    const batchSubjectId =
                                      batch.subject?._id || batch.subject;

                                    // Skip if this batch's subject is in the currently selected subjects
                                    if (
                                      formik.values.subjects.includes(
                                        batchSubjectId
                                      )
                                    ) {
                                      return null;
                                    }

                                    // Find the subject name
                                    const subject = subjects.find(
                                      (s) => s._id === batchSubjectId
                                    );

                                    return (
                                      <MenuItem
                                        key={batchId}
                                        value={batchId}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          const currentBatches = [
                                            ...formik.values.batches,
                                          ];
                                          const currentIndex =
                                            currentBatches.indexOf(batchId);

                                          // Always remove since these are legacy selections
                                          if (currentIndex !== -1) {
                                            currentBatches.splice(
                                              currentIndex,
                                              1
                                            );
                                            formik.setFieldValue(
                                              "batches",
                                              currentBatches
                                            );
                                          }
                                        }}
                                        sx={{
                                          paddingLeft: 1,
                                          display: "flex",
                                          alignItems: "center",
                                          color: "warning.main",
                                        }}
                                      >
                                        <Checkbox
                                          checked={true}
                                          sx={{
                                            padding: "4px",
                                            marginRight: "4px",
                                          }}
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                        <Box>
                                          <Typography
                                            variant="body2"
                                            color="warning.main"
                                          >
                                            {batch?.name ||
                                              `Batch from ${
                                                subject?.name || "Unknown"
                                              }`}
                                          </Typography>
                                          <Box
                                            sx={{
                                              display: "flex",
                                              flexDirection: "column",
                                              mt: 0.5,
                                            }}
                                          >
                                            <Typography
                                              variant="caption"
                                              sx={{
                                                color: getBatchStatusColor(
                                                  batch.status
                                                ),
                                              }}
                                            >
                                              Status:{" "}
                                              {batch.status
                                                ? batch.status
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                  batch.status.slice(1)
                                                : "Unknown"}
                                            </Typography>
                                            <Typography
                                              variant="caption"
                                              color="text.secondary"
                                            >
                                              Teacher:{" "}
                                              {batch.teacher?.name ||
                                                "Unassigned"}
                                            </Typography>
                                            <Typography
                                              variant="caption"
                                              color="text.secondary"
                                            >
                                              Starts:{" "}
                                              {batch.startDate
                                                ? formatDate(batch.startDate)
                                                : "Not set"}
                                            </Typography>
                                            <Typography
                                              variant="caption"
                                              color="text.secondary"
                                            >
                                              Time:{" "}
                                              {batch.schedule?.startTime &&
                                              batch.schedule?.endTime
                                                ? `${formatTime(
                                                    batch.schedule.startTime
                                                  )} - ${formatTime(
                                                    batch.schedule.endTime
                                                  )}`
                                                : "Not set"}
                                            </Typography>
                                            <Typography
                                              variant="caption"
                                              color="text.secondary"
                                            >
                                              Days:{" "}
                                              {batch.schedule?.days?.join(
                                                ", "
                                              ) || "Not set"}
                                            </Typography>
                                          </Box>
                                        </Box>
                                      </MenuItem>
                                    );
                                  })}
                                </React.Fragment>
                              )}
                            </>
                          )}
                      </>
                    ) : (
                      <MenuItem disabled>
                        {formik.values.subjects.length > 0
                          ? "No batches available for selected subjects"
                          : "Select subjects first"}
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="previousPercentage"
                  label="Previous Percentage"
                  type="number"
                  value={formik.values.previousPercentage}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.previousPercentage &&
                    Boolean(formik.errors.previousPercentage)
                  }
                  helperText={
                    formik.touched.previousPercentage &&
                    formik.errors.previousPercentage
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BarChartIcon fontSize="small" color="primary" />
                      </InputAdornment>
                    ),
                    inputProps: { min: 1, max: 100 },
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="joiningDate"
                  label="Joining Date"
                  type="date"
                  value={formik.values.joiningDate || ""}
                  onChange={(e) => {
                    formik.setFieldValue("joiningDate", e.target.value);
                  }}
                  InputLabelProps={{ shrink: true }}
                  error={
                    formik.touched.joiningDate &&
                    Boolean(formik.errors.joiningDate)
                  }
                  helperText={
                    formik.touched.joiningDate && formik.errors.joiningDate
                      ? formik.errors.joiningDate
                      : "Required"
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarTodayIcon fontSize="small" color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="schoolName"
                  label="School Name"
                  value={formik.values.schoolName}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.schoolName &&
                    Boolean(formik.errors.schoolName)
                  }
                  helperText={
                    formik.touched.schoolName && formik.errors.schoolName
                  }
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SchoolIcon fontSize="small" color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl
                  fullWidth
                  error={formik.touched.board && Boolean(formik.errors.board)}
                  required
                >
                  <InputLabel>Board</InputLabel>
                  <Select
                    name="board"
                    value={formik.values.board}
                    onChange={formik.handleChange}
                    label="Board"
                    sx={{ borderRadius: 1.5 }}
                  >
                    <MenuItem value="" disabled>
                      Select a board
                    </MenuItem>
                    <MenuItem value="CBSE">CBSE</MenuItem>
                    <MenuItem value="ICSE">ICSE</MenuItem>
                    <MenuItem value="State Board">State Board</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                  {formik.touched.board && formik.errors.board && (
                    <FormHelperText>{formik.errors.board}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions
            sx={{
              px: { xs: 2, sm: 3 },
              py: 2,
              position: "sticky",
              bottom: 0,
              backgroundColor: "background.paper",
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              zIndex: 1,
              mt: "auto",
              flexShrink: 0,
              gap: 1,
            }}
          >
            <Button
              variant="outlined"
              onClick={handleClose}
              startIcon={<ClearIcon />}
              disabled={formik.isSubmitting}
              sx={{ borderRadius: 1.5, textTransform: "none" }}
            >
              Cancel
            </Button>
            {editingStudent && (
              <Button
                variant="outlined"
                color="error"
                onClick={() => {
                  handleClose();
                  handleDelete(editingStudent._id);
                }}
                startIcon={<DeleteIcon />}
                sx={{
                  borderRadius: 1.5,
                  textTransform: "none",
                  borderColor: alpha(theme.palette.error.main, 0.5),
                  "&:hover": {
                    borderColor: theme.palette.error.main,
                    backgroundColor: alpha(theme.palette.error.main, 0.04),
                  },
                }}
              >
                Delete
              </Button>
            )}
            <Button
              variant="contained"
              type="submit"
              disabled={formik.isSubmitting}
              startIcon={
                formik.isSubmitting ? (
                  <CircularProgress size={20} color="inherit" />
                ) : editingStudent ? (
                  <EditIcon />
                ) : (
                  <AddIcon />
                )
              }
              sx={{
                ml: "auto",
                borderRadius: 1.5,
                textTransform: "none",
                px: 3,
              }}
            >
              {formik.isSubmitting
                ? "Processing..."
                : editingStudent
                ? "Update"
                : "Create"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog
        open={viewDialogOpen}
        onClose={handleCloseViewDialog}
        fullScreen={isMobile}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 2,
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
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <VisibilityIcon sx={{ fontSize: "1.8rem" }} />
          <Typography variant="h6" fontWeight={600}>
            Student Details
          </Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
          {viewStudent && (
            <>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      border: `1px solid ${alpha(
                        theme.palette.primary.main,
                        0.1
                      )}`,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 2.5,
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 64,
                          height: 64,
                          bgcolor: theme.palette.primary.main,
                          fontSize: "1.5rem",
                          fontWeight: 600,
                          boxShadow: 2,
                        }}
                      >
                        {viewStudent.name?.charAt(0) || "?"}
                      </Avatar>
                      <Box>
                        <Typography
                          variant="h5"
                          fontWeight="bold"
                          color="primary"
                        >
                          {viewStudent.name}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mt: 0.5,
                          }}
                        >
                          <Chip
                            label={
                              viewStudent.gender?.charAt(0).toUpperCase() +
                                viewStudent.gender?.slice(1) || "Unknown"
                            }
                            size="small"
                            color={
                              viewStudent.gender === "male"
                                ? "info"
                                : viewStudent.gender === "female"
                                ? "secondary"
                                : "default"
                            }
                          />
                          <Typography variant="body2" color="text.secondary">
                            ID: {viewStudent._id?.slice(-6).toUpperCase()}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      fontWeight="bold"
                      color="primary"
                      sx={{
                        pb: 1,
                        mb: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        borderBottom: `1px solid ${alpha(
                          theme.palette.primary.main,
                          0.2
                        )}`,
                      }}
                    >
                      <PhoneIcon fontSize="small" />
                      Contact Information
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 1,
                            }}
                          >
                            <EmailIcon
                              fontSize="small"
                              color="primary"
                              sx={{ mr: 1 }}
                            />
                            <Typography variant="body2" fontWeight="medium">
                              {viewStudent.email}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <PhoneIcon
                              fontSize="small"
                              color="primary"
                              sx={{ mr: 1 }}
                            />
                            <Typography variant="body2" fontWeight="medium">
                              {viewStudent.phone}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <HomeIcon
                              fontSize="small"
                              color="primary"
                              sx={{ mr: 1 }}
                            />
                            <Typography variant="body2" fontWeight="medium">
                              {viewStudent.address}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>

                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      fontWeight="bold"
                      color="primary"
                      sx={{
                        pb: 1,
                        mb: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        borderBottom: `1px solid ${alpha(
                          theme.palette.primary.main,
                          0.2
                        )}`,
                        mt: "auto",
                      }}
                    >
                      <PersonIcon fontSize="small" />
                      Parent Information
                    </Typography>

                    <Box>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Box
                            sx={{ display: "flex", flexDirection: "column" }}
                          >
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              fontWeight={500}
                            >
                              Name:
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                              {viewStudent.parentName || "Not specified"}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box
                            sx={{ display: "flex", flexDirection: "column" }}
                          >
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              fontWeight={500}
                            >
                              Phone:
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                              {viewStudent.parentPhone || "Not specified"}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      border: `1px solid ${alpha(
                        theme.palette.primary.main,
                        0.1
                      )}`,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      fontWeight="bold"
                      color="primary"
                      sx={{
                        pb: 1,
                        mb: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        borderBottom: `1px solid ${alpha(
                          theme.palette.primary.main,
                          0.2
                        )}`,
                      }}
                    >
                      <SchoolIcon fontSize="small" />
                      Academic Information
                    </Typography>

                    <Box sx={{ mb: 2.5 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Box
                            sx={{ display: "flex", flexDirection: "column" }}
                          >
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              fontWeight={500}
                            >
                              Standard:
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                              {viewStudent.standard?.name || "Not specified"}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box
                            sx={{ display: "flex", flexDirection: "column" }}
                          >
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              fontWeight={500}
                            >
                              Date of Birth:
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                              {formatDate(viewStudent.dateOfBirth) ||
                                "Not specified"}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box
                            sx={{ display: "flex", flexDirection: "column" }}
                          >
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              fontWeight={500}
                            >
                              School:
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                              {viewStudent.schoolName || "Not specified"}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormControl
                            fullWidth
                            error={
                              formik.touched.board &&
                              Boolean(formik.errors.board)
                            }
                            required
                          >
                            <InputLabel>Board</InputLabel>
                            <Select
                              name="board"
                              value={formik.values.board}
                              onChange={formik.handleChange}
                              label="Board"
                              sx={{ borderRadius: 1.5 }}
                            >
                              <MenuItem value="" disabled>
                                Select a board
                              </MenuItem>
                              <MenuItem value="CBSE">CBSE</MenuItem>
                              <MenuItem value="ICSE">ICSE</MenuItem>
                              <MenuItem value="State Board">
                                State Board
                              </MenuItem>
                              <MenuItem value="Other">Other</MenuItem>
                            </Select>
                            {formik.touched.board && formik.errors.board && (
                              <FormHelperText>
                                {formik.errors.board}
                              </FormHelperText>
                            )}
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box
                            sx={{ display: "flex", flexDirection: "column" }}
                          >
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              fontWeight={500}
                            >
                              Previous Percentage:
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                              {viewStudent.previousPercentage
                                ? `${viewStudent.previousPercentage}%`
                                : "Not specified"}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box
                            sx={{ display: "flex", flexDirection: "column" }}
                          >
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              fontWeight={500}
                            >
                              Joining Date:
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                              {formatDate(viewStudent.joiningDate) ||
                                "Not specified"}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>

                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      fontWeight="bold"
                      color="primary"
                      sx={{
                        pb: 1,
                        mb: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        borderBottom: `1px solid ${alpha(
                          theme.palette.primary.main,
                          0.2
                        )}`,
                      }}
                    >
                      <BookIcon fontSize="small" />
                      Subjects
                    </Typography>
                    <Box sx={{ mb: 2.5 }}>
                      {viewStudent.subjects &&
                      viewStudent.subjects.length > 0 ? (
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}
                        >
                          {viewStudent.subjects.map((subject) => (
                            <Chip
                              key={subject._id}
                              label={subject.name}
                              color="secondary"
                              variant="outlined"
                              size="small"
                              sx={{ mb: 1, fontWeight: 500 }}
                            />
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No subjects assigned
                        </Typography>
                      )}
                    </Box>

                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      fontWeight="bold"
                      color="primary"
                      sx={{
                        pb: 1,
                        mb: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        borderBottom: `1px solid ${alpha(
                          theme.palette.primary.main,
                          0.2
                        )}`,
                      }}
                    >
                      <BookIcon fontSize="small" />
                      Batches
                    </Typography>
                    <Box>
                      {viewStudent.batches && viewStudent.batches.length > 0 ? (
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}
                        >
                          {viewStudent.batches.map((batch) => (
                            <Chip
                              key={batch._id}
                              label={batch.name}
                              color="primary"
                              variant="outlined"
                              size="small"
                              sx={{ mb: 1, fontWeight: 500 }}
                            />
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No batches assigned
                        </Typography>
                      )}
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            px: { xs: 2, sm: 3 },
            py: 2,
            backgroundColor: "background.paper",
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            onClick={() => {
              handleCloseViewDialog();
              handleOpen(viewStudent);
            }}
            sx={{ borderRadius: 1.5, textTransform: "none" }}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => {
              handleCloseViewDialog();
              handleDelete(viewStudent._id);
            }}
            sx={{
              borderRadius: 1.5,
              textTransform: "none",
              borderColor: alpha(theme.palette.error.main, 0.5),
              "&:hover": {
                borderColor: theme.palette.error.main,
                backgroundColor: alpha(theme.palette.error.main, 0.04),
              },
            }}
          >
            Delete
          </Button>
          <Button
            onClick={handleCloseViewDialog}
            variant="contained"
            startIcon={<ClearIcon />}
            sx={{ ml: "auto", borderRadius: 1.5, textTransform: "none" }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Students;
