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
    .min(1, "Percentage must be at least 1")
    .max(100, "Percentage cannot exceed 100")
    .required("Previous percentage is required"),
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
    onSubmit: (values) => {
      // console.log("Submitting student with raw values:", values);

      // Create a copy with properly formatted dates
      let formattedData = { ...values };

      // Handle dateOfBirth - ensure it's a valid date string
      if (values.dateOfBirth) {
        try {
          // Add time part to ensure consistent timezone handling
          const dateObj = new Date(values.dateOfBirth + "T00:00:00Z");
          if (!isNaN(dateObj.getTime())) {
            formattedData.dateOfBirth = dateObj.toISOString();
          } else {
            console.error("Invalid date of birth:", values.dateOfBirth);
            alert("Please enter a valid date of birth");
            return;
          }
        } catch (error) {
          console.error("Error formatting date of birth:", error);
          alert("Please enter a valid date of birth");
          return;
        }
      } else {
        alert("Date of birth is required");
        return;
      }

      // Handle joiningDate - ensure it's a valid date string
      if (values.joiningDate) {
        try {
          // Add time part to ensure consistent timezone handling
          const dateObj = new Date(values.joiningDate + "T00:00:00Z");
          if (!isNaN(dateObj.getTime())) {
            formattedData.joiningDate = dateObj.toISOString();
          } else {
            console.error("Invalid joining date:", values.joiningDate);
            alert("Please enter a valid joining date");
            return;
          }
        } catch (error) {
          console.error("Error formatting joining date:", error);
          alert("Please enter a valid joining date");
          return;
        }
      } else {
        alert("Joining date is required");
        return;
      }

      // console.log("Formatted data for submission:", formattedData);
      // console.log("Formatted dateOfBirth:", formattedData.dateOfBirth);
      // console.log("Formatted joiningDate:", formattedData.joiningDate);

      if (editingStudent) {
        dispatch(
          updateStudent({ id: editingStudent._id, data: formattedData })
        );
      } else {
        dispatch(createStudent(formattedData));
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
            Students
          </Typography>
          <RefreshButton
            onRefresh={loadAllData}
            tooltip="Refresh students data"
            sx={{ ml: 1 }}
          />
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          sx={{ alignSelf: { xs: "flex-start", sm: "auto" } }}
        >
          Add Student
        </Button>
      </Box>

      {/* Stats row */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Typography variant="subtitle1">
          Total Students: {statsLoading ? "Loading..." : totalStudentCount}
        </Typography>
      </Box>

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
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FilterIcon color="primary" />
            <Typography>Filters</Typography>
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
                ].reduce((a, b) => a + b, 0)} active`}
                size="small"
                color="primary"
              />
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Search by Name/Email/Phone"
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
            <Grid item xs={12} sm={6} md={3}>
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
            <Grid item xs={12} sm={6} md={3}>
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
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Filter by Gender"
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
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
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Showing {filteredStudentsList.length} of {students.length} students
        </Typography>
        {filteredStudentsList.length === 0 && students.length > 0 && (
          <Alert severity="info" sx={{ py: 0 }}>
            No students match your filter criteria
          </Alert>
        )}
      </Box>

      {isMobile ? (
        // Mobile card view
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
                  "&:hover": {
                    boxShadow: 6,
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <CardContent sx={{ pb: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Box>
                      <Typography
                        variant="h6"
                        component="div"
                        sx={{
                          fontWeight: 600,
                          color: theme.palette.primary.main,
                        }}
                      >
                    {student.name}
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                        {student.gender
                          ? student.gender.charAt(0).toUpperCase() +
                            student.gender.slice(1)
                          : ""}
                  </Typography>
                    </Box>
                    <Avatar
                      sx={{
                        bgcolor: theme.palette.primary.main,
                        color: "white",
                        width: 40,
                        height: 40,
                      }}
                    >
                      {student.name?.charAt(0)}
                    </Avatar>
                  </Box>

                  <Grid container spacing={2} sx={{ mt: 0.5 }}>
                    <Grid item xs={6}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ fontWeight: 600, mb: 1 }}
                      >
                        Contact
                      </Typography>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <EmailIcon
                          fontSize="small"
                          color="primary"
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="body2" fontWeight="medium">
                          {student.email}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <PhoneIcon
                          fontSize="small"
                          color="primary"
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="body2" fontWeight="medium">
                          {student.phone}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ fontWeight: 600, mb: 1 }}
                      >
                        Standard
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <SchoolIcon
                          fontSize="small"
                          color="primary"
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="body2" fontWeight="medium">
                          {standards.find(
                            (s) => s._id === student.standard?._id
                          )?.name || "Not assigned"}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sx={{ mt: 0.5 }}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ fontWeight: 600, mb: 1 }}
                      >
                        Subjects
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 0.5,
                        }}
                      >
                        {student.subjects?.length > 0 ? (
                          student.subjects?.map((subject) => (
                            <Chip
                              key={subject._id}
                              label={subject.name}
                              size="small"
                              color="secondary"
                              variant="outlined"
                              sx={{ mb: 0.5, fontWeight: 500 }}
                            />
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No subjects assigned
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ fontWeight: 600, mb: 1 }}
                      >
                        Parent
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <PersonIcon
                          fontSize="small"
                          color="primary"
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="body2" fontWeight="medium">
                          {student.parentName || "Not provided"}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
                <CardActions
                  sx={{ px: 2, pt: 0, pb: 2, justifyContent: "space-between" }}
                >
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleViewStudent(student)}
                    color="primary"
                    startIcon={<VisibilityIcon />}
                    sx={{ borderRadius: 1.5 }}
                  >
                    View Details
                  </Button>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleOpen(student)}
                      color="primary"
                      sx={{ mr: 1 }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(student._id)}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </CardActions>
              </Card>
            ))
          ) : (
            <Box
              sx={{
                textAlign: "center",
                py: 4,
                bgcolor: alpha(theme.palette.primary.light, 0.05),
                borderRadius: 2,
                border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              <Typography color="text.secondary" sx={{ mb: 1 }}>
              No students found
            </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => handleOpen()}
                size="small"
                sx={{ mt: 1 }}
              >
                Add Student
              </Button>
            </Box>
          )}
        </Stack>
      ) : (
        // Desktop table view
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: 2,
          }}
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
                  Contact Info
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
                  Subjects & Batches
                </TableCell>
                {!isTablet && (
                  <TableCell
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Parent Info
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
                    School
                  </TableCell>
                )}
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                  }}
                >
                  Joining Date
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
                      },
                      transition: "background-color 0.2s ease",
                    }}
                    onClick={() => handleViewStudent(student)}
                  >
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Avatar
                          sx={{
                            bgcolor: theme.palette.primary.main,
                            color: "white",
                            width: 32,
                            height: 32,
                            mr: 1.5,
                            fontSize: "0.9rem",
                          }}
                        >
                          {student.name?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography fontWeight="600" color="primary.main">
                        {student.name || "—"}
                      </Typography>
                      <Typography
                        variant="caption"
                        display="block"
                        color="text.secondary"
                      >
                            {student.gender
                              ? student.gender.charAt(0).toUpperCase() +
                                student.gender.slice(1)
                              : "—"}
                      </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", flexDirection: "column" }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mb: 0.5,
                          }}
                        >
                          <EmailIcon
                            fontSize="small"
                            color="action"
                            sx={{ mr: 1, fontSize: "1rem" }}
                          />
                          <Typography variant="body2" fontWeight="medium">
                        {student.email || "—"}
                      </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <PhoneIcon
                            fontSize="small"
                            color="action"
                            sx={{ mr: 1, fontSize: "1rem" }}
                          />
                      <Typography variant="body2">
                        {student.phone || "—"}
                      </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <SchoolIcon
                          fontSize="small"
                          color="primary"
                          sx={{ mr: 1, opacity: 0.8 }}
                        />
                        <Typography variant="body2" fontWeight="medium">
                          {standards.find(
                            (s) => s._id === student.standard?._id
                          )?.name || "—"}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {/* Subjects */}
                      <Box sx={{ mb: 1 }}>
                        {student.subjects?.length > 0 ? (
                          student.subjects?.map((subject) => (
                            <Chip
                              key={subject._id}
                              label={subject.name}
                              size="small"
                              color="secondary"
                              variant="outlined"
                              sx={{ mr: 0.5, mb: 0.5, fontWeight: 500 }}
                            />
                          ))
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            No subjects
                          </Typography>
                        )}
                      </Box>

                      {/* Batches */}
                      <Box>
                        {student.batches?.length > 0 ? (
                          student.batches?.map((batch) => (
                            <Chip
                              key={batch._id}
                              label={batch.name}
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{ mr: 0.5, mb: 0.5, fontWeight: 500 }}
                            />
                          ))
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            No batches
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    {!isTablet && (
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {student.parentName || "—"}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mt: 0.5,
                          }}
                        >
                          <PhoneIcon
                            fontSize="small"
                            color="action"
                            sx={{ mr: 0.5, fontSize: "0.9rem" }}
                          />
                          <Typography variant="caption">
                          {student.parentPhone || "—"}
                        </Typography>
                        </Box>
                      </TableCell>
                    )}
                    {!isTablet && (
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {student.schoolName || "—"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {student.board || "—"}
                        </Typography>
                      </TableCell>
                    )}
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {formatDate(student.joiningDate) || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          "& button": { opacity: 0.7 },
                          "& button:hover": { opacity: 1 },
                        }}
                      >
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewStudent(student);
                          }}
                          sx={{
                            mr: 1,
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
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpen(student);
                          }}
                          sx={{
                            mr: 1,
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
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(student._id);
                          }}
                          sx={{
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
                  <TableCell
                    colSpan={isTablet ? 6 : 8}
                    align="center"
                    sx={{ py: 3 }}
                  >
                    <Box
                      sx={{
                        py: 2,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        bgcolor: alpha(theme.palette.primary.light, 0.05),
                        borderRadius: 1,
                        border: `1px dashed ${alpha(
                          theme.palette.primary.main,
                          0.2
                        )}`,
                      }}
                    >
                      <Typography color="text.secondary" sx={{ mb: 1 }}>
                    No students found
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpen()}
                        size="small"
                      >
                        Add Student
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
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
            backgroundColor: theme.palette.primary.main,
            color: "white",
            p: 2,
            flexShrink: 0,
          }}
        >
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
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Fill in the details below to{" "}
                {editingStudent ? "update" : "create"} a student. Fields marked
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
                  label="Name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                  InputProps={{
                    sx: { borderRadius: 1 },
                  }}
                />
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
                  InputProps={{
                    sx: { borderRadius: 1 },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="phone"
                  label="Phone"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  error={formik.touched.phone && Boolean(formik.errors.phone)}
                  helperText={formik.touched.phone && formik.errors.phone}
                  InputProps={{
                    sx: { borderRadius: 1 },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="gender-label">Gender</InputLabel>
                  <Select
                    labelId="gender-label"
                    name="gender"
                    value={formik.values.gender}
                    onChange={formik.handleChange}
                    label="Gender"
                    sx={{ borderRadius: 1 }}
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
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
                  Education Details
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl
                  fullWidth
                  error={
                    formik.touched.standard && Boolean(formik.errors.standard)
                  }
                >
                  <InputLabel>Standard</InputLabel>
                  <Select
                    name="standard"
                    value={formik.values.standard}
                    onChange={handleStandardChange}
                    label="Standard"
                    sx={{ borderRadius: 1 }}
                  >
                    {standards.map((standard) => (
                        <MenuItem key={standard._id} value={standard._id}>
                        {standard.name}
                        </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.standard && formik.errors.standard && (
                    <Typography variant="caption" color="error">
                      {formik.errors.standard}
                    </Typography>
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
                    onChange={(e) => {}}
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
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="parentPhone"
                  label="Parent Phone"
                  value={formik.values.parentPhone}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.parentPhone &&
                    Boolean(formik.errors.parentPhone)
                  }
                  helperText={
                    formik.touched.parentPhone && formik.errors.parentPhone
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="address"
                  label="Address"
                  multiline
                  rows={2}
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.address && Boolean(formik.errors.address)
                  }
                  helperText={formik.touched.address && formik.errors.address}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="dateOfBirth"
                  label="Date of Birth"
                  type="date"
                  value={formik.values.dateOfBirth || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    // console.log(`Date of birth changed to: ${value}`);
                    if (value) {
                      try {
                        // Validate date format and reasonable range
                        const date = new Date(value);
                        if (!isNaN(date.getTime())) {
                          // This is a valid date
                          formik.setFieldValue("dateOfBirth", value);
                        } else {
                          console.error("Invalid date format:", value);
                        }
                      } catch (error) {
                        console.error("Error parsing date:", error);
                      }
                    } else {
                      formik.setFieldValue("dateOfBirth", "");
                    }
                  }}
                  InputLabelProps={{ shrink: true }}
                  error={
                    formik.touched.dateOfBirth &&
                    Boolean(formik.errors.dateOfBirth)
                  }
                  helperText={
                    formik.touched.dateOfBirth && formik.errors.dateOfBirth
                      ? formik.errors.dateOfBirth
                      : "Required"
                  }
                  inputProps={{
                    max: new Date().toISOString().split("T")[0], // Set max date to today
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Board</InputLabel>
                  <Select
                    name="board"
                    value={formik.values.board}
                    onChange={formik.handleChange}
                    label="Board"
                  >
                    <MenuItem value="CBSE">CBSE</MenuItem>
                    <MenuItem value="ICSE">ICSE</MenuItem>
                    <MenuItem value="State Board">State Board</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
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
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Previous Percentage"
                  name="previousPercentage"
                  type="number"
                  min={1}
                  max={100}
                  value={formik.values.previousPercentage}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Ensure value is between 1 and 100
                    if (value === "") {
                      formik.setFieldValue("previousPercentage", "");
                    } else {
                      const numValue = Math.max(
                        1,
                        Math.min(100, Number(value))
                      );
                      formik.setFieldValue("previousPercentage", numValue);
                    }
                  }}
                  error={
                    formik.touched.previousPercentage &&
                    Boolean(formik.errors.previousPercentage)
                  }
                  helperText={
                    formik.touched.previousPercentage &&
                    formik.errors.previousPercentage
                  }
                  sx={{ mb: 2 }}
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
                    const value = e.target.value;
                    // console.log(`Joining date changed to: ${value}`);
                    if (value) {
                      try {
                        // Validate date format
                        const date = new Date(value);
                        if (!isNaN(date.getTime())) {
                          // This is a valid date
                          formik.setFieldValue("joiningDate", value);
                        } else {
                          console.error("Invalid date format:", value);
                        }
                      } catch (error) {
                        console.error("Error parsing date:", error);
                      }
                    } else {
                      formik.setFieldValue("joiningDate", "");
                    }
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
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions
            sx={{
              px: { xs: 2, sm: 3 },
              py: 2,
              position: isMobile ? "sticky" : "relative",
              bottom: 0,
              backgroundColor: "background.paper",
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              zIndex: 1,
              mt: "auto",
              flexShrink: 0,
            }}
          >
            <Button
              onClick={handleClose}
              disabled={formik.isSubmitting}
              sx={{ borderRadius: 1.5 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={formik.isSubmitting}
              sx={{ borderRadius: 1.5, px: 3 }}
            >
              {formik.isSubmitting ? (
                <CircularProgress size={24} />
              ) : editingStudent ? (
                "Update Student"
              ) : (
                "Save Student"
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* View student dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={handleCloseViewDialog}
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
        {viewStudent && (
          <>
            <DialogTitle
                sx={{
                backgroundColor: theme.palette.primary.main,
                color: "white",
                p: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                flexShrink: 0,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Avatar
                  sx={{
                    bgcolor: "white",
                    color: theme.palette.primary.main,
                    mr: 1.5,
                    fontWeight: "bold",
                  }}
                >
                  {viewStudent.name?.charAt(0)}
                </Avatar>
                <Typography variant="h6" fontWeight={600}>
                  {viewStudent.name}
                </Typography>
              </Box>
              <Chip
                label={
                  viewStudent.gender
                    ? viewStudent.gender.charAt(0).toUpperCase() +
                      viewStudent.gender.slice(1)
                    : ""
                }
                    size="small"
                sx={{
                  color: "white",
                  bgcolor: theme.palette.primary.dark,
                  fontWeight: 500,
                }}
              />
            </DialogTitle>
            <DialogContent
              dividers
              sx={{
                p: { xs: 2, sm: 3 },
                overflowY: "auto",
                flexGrow: 1,
              }}
            >
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
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
                      Contact Information
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
                          justifyContent: "flex-start",
                          alignItems: "center",
                        }}
                      >
                        <EmailIcon color="primary" sx={{ mr: 2 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                        Email
                      </Typography>
                          <Typography variant="body2" fontWeight="medium">
                        {viewStudent.email}
                      </Typography>
                        </Box>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-start",
                          alignItems: "center",
                        }}
                      >
                        <PhoneIcon color="primary" sx={{ mr: 2 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                        Phone
                      </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {viewStudent.phone}
                      </Typography>
                        </Box>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-start",
                          alignItems: "center",
                        }}
                      >
                        <HomeIcon color="primary" sx={{ mr: 2 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Address
                      </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {viewStudent.address || "Not provided"}
                      </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                    </Grid>

                <Grid item xs={12} md={6}>
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
                      Parent Information
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
                          justifyContent: "flex-start",
                          alignItems: "center",
                        }}
                      >
                        <PersonIcon color="primary" sx={{ mr: 2 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Parent Name
                      </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {viewStudent.parentName || "Not provided"}
                      </Typography>
                </Box>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-start",
                          alignItems: "center",
                        }}
                      >
                        <PhoneIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                          <Typography variant="caption" color="text.secondary">
                            Parent Phone
                  </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {viewStudent.parentPhone || "Not provided"}
                      </Typography>
                        </Box>
                      </Box>
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
                      Education Details
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
                          {viewStudent.standard?.name || "Not specified"}
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
                          School:
                      </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {viewStudent.schoolName || "Not specified"}
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
                          Board:
                  </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {viewStudent.board || "Not specified"}
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
                          Previous Percentage:
                      </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {viewStudent.previousPercentage
                            ? `${viewStudent.previousPercentage}%`
                            : "Not specified"}
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
                          Joining Date:
                      </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {formatDate(viewStudent.joiningDate) ||
                            "Not specified"}
                        </Typography>
                </Box>
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
                        Subjects
                      </Typography>
                    <Box
                      sx={{
                        mt: 2,
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 0.8,
                      }}
                    >
                        {viewStudent.subjects &&
                        viewStudent.subjects.length > 0 ? (
                          viewStudent.subjects.map((subject) => (
                            <Chip
                              key={subject._id}
                              label={subject.name}
                            color="secondary"
                              variant="outlined"
                              size="small"
                            sx={{ mb: 1, fontWeight: 500 }}
                            />
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                          No subjects assigned
                          </Typography>
                        )}
                      </Box>
                  </Paper>
                    </Grid>

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
                        Batches
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {viewStudent.batches && viewStudent.batches.length > 0 ? (
                          viewStudent.batches.map((batch) => (
                            <Chip
                              key={batch._id}
                            label={`${batch.name} (${
                              batch.enrolledStudents?.length || 0
                            }/${batch.capacity})`}
                            color="primary"
                              variant="outlined"
                              size="small"
                            sx={{ mb: 1, fontWeight: 500 }}
                            />
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No batches assigned
                          </Typography>
                        )}
                      </Box>
                  </Paper>
                    </Grid>
                  </Grid>
            </DialogContent>
            <DialogActions
              sx={{
                px: { xs: 2, sm: 3 },
                py: 2,
                position: isMobile ? "sticky" : "relative",
                bottom: 0,
                backgroundColor: "background.paper",
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                zIndex: 1,
                mt: "auto",
                flexShrink: 0,
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
                sx={{ borderRadius: 1.5 }}
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
                sx={{ borderRadius: 1.5 }}
              >
                Delete
              </Button>
              <Button
                onClick={handleCloseViewDialog}
                variant="contained"
                sx={{ ml: "auto", borderRadius: 1.5 }}
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
