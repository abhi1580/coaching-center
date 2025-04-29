import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Paper,
  Typography,
  Grid,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  alpha,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Tooltip,
  FormHelperText,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Checkbox,
  Breadcrumbs,
  Link,
  Stack,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  Home as HomeIcon,
  Class as ClassIcon,
} from "@mui/icons-material";
import { fetchBatches, deleteBatch } from "../../../store/slices/batchSlice";
import { fetchStudents, createStudent } from "../../../store/slices/studentSlice";
import { batchService } from "../../../services/api";
import { studentService } from "../../../services/api";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import DeleteConfirmationDialog from "../../../components/common/DeleteConfirmationDialog";

const newStudentValidationSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  phone: Yup.string()
    .matches(/^[0-9]+$/, "Phone number should only contain digits")
    .min(10, "Phone number should be at least 10 digits")
    .required("Phone number is required"),
  parentName: Yup.string(),
  parentPhone: Yup.string()
    .matches(/^[0-9]*$/, "Phone number should only contain digits")
    .min(10, "Phone number should be at least 10 digits")
    .nullable(),
  gender: Yup.string().required("Gender is required"),
  dateOfBirth: Yup.date().nullable(),
  address: Yup.string(),
  board: Yup.string(),
  schoolName: Yup.string(),
  previousPercentage: Yup.number()
    .min(0, "Percentage cannot be less than 0")
    .max(100, "Percentage cannot exceed 100")
    .nullable(),
  joiningDate: Yup.date().required("Joining date is required"),
});

const BatchView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();

  const { batches, loading } = useSelector((state) => state.batches);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [studentDialogOpen, setStudentDialogOpen] = useState(false);
  const [existingStudentDialogOpen, setExistingStudentDialogOpen] =
    useState(false);
  const [iterationConfirmOpen, setIterationConfirmOpen] = useState(false);
  const [currentIterationIndex, setCurrentIterationIndex] = useState(0);
  const [processingStudents, setProcessingStudents] = useState([]);
  const [availableStudentsForBatch, setAvailableStudentsForBatch] = useState(
    []
  );
  const [selectedExistingStudents, setSelectedExistingStudents] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Only keep student removal state
  const [studentRemovalDialogOpen, setStudentRemovalDialogOpen] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState(null);
  const [studentRemovalLoading, setStudentRemovalLoading] = useState(false);

  // Load batch data
  useEffect(() => {
    dispatch(fetchBatches());
  }, [dispatch]);

  // Set selected batch when data is loaded
  useEffect(() => {
    if (batches && id) {
      const batch = batches.find((b) => b._id === id);
      if (batch) {
        setSelectedBatch(batch);
      }
    }
  }, [batches, id]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    try {
      if (timeString.includes(":")) {
        const [hours, minutes] = timeString.split(":");
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? "PM" : "AM";
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
      }
      return timeString;
    } catch (error) {
      return timeString;
    }
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

  const openStudentRemovalDialog = (student) => {
    setStudentToRemove(student);
    setStudentRemovalDialogOpen(true);
  };

  const closeStudentRemovalDialog = () => {
    setStudentRemovalDialogOpen(false);
    setStudentToRemove(null);
  };

  const confirmStudentRemoval = async () => {
    if (!studentToRemove) return;

    try {
      setStudentRemovalLoading(true);
      const response = await batchService.removeStudentFromBatch(id, studentToRemove._id);
      if (response?.data?.success) {
        setSelectedBatch(response.data.data);
      } else {
        throw new Error('Failed to remove student');
      }
      closeStudentRemovalDialog();
    } catch (error) {
      console.error('Error removing student:', error);
      alert("Failed to remove student: " + error.message);
    } finally {
      setStudentRemovalLoading(false);
    }
  };

  const handleAddExistingStudentToBatch = async () => {
    try {
      const response = await studentService.getAll();
      const studentsResponse = response.data.data;

      const batchStudentIds = selectedBatch.enrolledStudents?.map(
        (student) => student._id
      ) || [];

      const availableStudents = studentsResponse.filter(
        (student) => !batchStudentIds.includes(student._id)
      );

      setAvailableStudentsForBatch(availableStudents);
      setExistingStudentDialogOpen(true);
    } catch (error) {
      console.error('Error fetching available students:', error);
      alert("Failed to fetch available students: " + error.message);
    }
  };

  const handleEnrollExistingStudent = async () => {
    if (!selectedExistingStudents.length) {
      alert("Please select at least one student to enroll");
      return;
    }

    try {
      setSubmitting(true);
      const selectedStudents = availableStudentsForBatch.filter(
        student => selectedExistingStudents.includes(student._id)
      );

      if (selectedStudents.length === 0) {
        alert("No valid students selected");
        setSubmitting(false);
        return;
      }

      // Process each student one by one
      for (const student of selectedStudents) {
        try {
          const response = await batchService.addStudentToBatch(id, student._id);

          if (response?.data?.success && response?.data?.data) {
            setSelectedBatch(response.data.data);
          } else {
            throw new Error('Invalid response from server');
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message;
          if (errorMessage.includes('already enrolled')) {
            alert(`Student ${student.name} is already enrolled in this batch`);
          } else {
            alert(`Failed to enroll student ${student.name}: ${errorMessage}`);
          }
        }
      }

      // Close dialog and reset state
      setExistingStudentDialogOpen(false);
      setSelectedExistingStudents([]);
      setSearchQuery("");
    } catch (error) {
      console.error('Error enrolling students:', error);
      alert(`Failed to enroll students: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEnrollmentComplete = () => {
    setExistingStudentDialogOpen(false);
    setSelectedExistingStudents([]);
    setProcessingStudents([]);
    setCurrentIterationIndex(0);
    setSubmitting(false);
    setSearchQuery("");
  };

  const handleContinueIteration = async () => {
    setIterationConfirmOpen(false);
    setCurrentIterationIndex((prev) => prev + 1);
    await processNextStudent();
  };

  const filteredStudents = searchQuery ? availableStudentsForBatch.filter(
    (student) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        (student?.name?.toLowerCase() || '').includes(searchLower) ||
        (student?.studentId?.toLowerCase() || '').includes(searchLower) ||
        (student?.email?.toLowerCase() || '').includes(searchLower) ||
        (student?.phone?.toLowerCase() || '').includes(searchLower)
      );
    }
  ) : [];

  const generateStudentId = async () => {
    try {
      // Get all students to find the latest ID
      const response = await studentService.getAll();
      const students = response.data.data;

      // Get current year
      const currentYear = new Date().getFullYear();

      // Find the highest number for the current year
      let maxNumber = 0;
      students.forEach(student => {
        if (student.studentId) {
          const [year, number] = student.studentId.split('-');
          if (year === currentYear.toString()) {
            const num = parseInt(number);
            if (num > maxNumber) {
              maxNumber = num;
            }
          }
        }
      });

      // Generate new ID
      const newNumber = (maxNumber + 1).toString().padStart(3, '0');
      return `${currentYear}-${newNumber}`;
    } catch (error) {
      console.error('Error generating student ID:', error);
      // Fallback to current year with 001 if there's an error
      return `${new Date().getFullYear()}-001`;
    }
  };

  if (loading || !selectedBatch) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        aria-label="breadcrumb"
        sx={{ mb: 2, mt: 1 }}
        separator="›"
      >
        <Link
          underline="hover"
          color="inherit"
          href="/app/dashboard"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
          Dashboard
        </Link>
        <Link
          underline="hover"
          color="inherit"
          href="/app/batches"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <ClassIcon sx={{ mr: 0.5 }} fontSize="small" />
          Batches
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          {selectedBatch.name}
        </Typography>
      </Breadcrumbs>

      {/* Enhanced Header */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          backgroundColor: (theme) => alpha(theme.palette.primary.light, 0.05),
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontSize: { xs: "1.5rem", sm: "2rem" },
            fontWeight: 600,
            color: "primary.main",
          }}
        >
          {loading ? "Loading Batch..." : `Batch: ${selectedBatch?.name}`}
        </Typography>

        {/* Action Buttons - Keep only Edit button */}
        <Box sx={{ flexGrow: 1 }} />
        {!loading && (
          <Button
            variant="outlined"
            color="primary"
            onClick={() => navigate(`/app/batches/${id}/edit`)}
          >
            Edit Batch
          </Button>
        )}
      </Paper>

      <Grid container spacing={3}>
        {/* Basic Information Card */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              height: "100%",
              borderRadius: 2,
              bgcolor: "background.paper",
              transition: "transform 0.2s ease-in-out",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 3,
              },
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              color="primary"
              sx={{
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              Basic Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Standard:
                </Typography>
                <Typography variant="body1" sx={{ mt: 0.5 }}>
                  {selectedBatch.standard?.name}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Subject:
                </Typography>
                <Typography variant="body1" sx={{ mt: 0.5 }}>
                  {selectedBatch.subject?.name}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Teacher:
                </Typography>
                <Typography variant="body1" sx={{ mt: 0.5 }}>
                  {selectedBatch.teacher?.name || "Not assigned"}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Schedule Card */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              height: "100%",
              borderRadius: 2,
              bgcolor: "background.paper",
              transition: "transform 0.2s ease-in-out",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 3,
              },
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              color="primary"
              sx={{
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              Schedule
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Duration:
                </Typography>
                <Typography variant="body1" sx={{ mt: 0.5 }}>
                  {formatDate(selectedBatch.startDate)} -{" "}
                  {formatDate(selectedBatch.endDate)}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Class Time:
                </Typography>
                <Typography variant="body1" sx={{ mt: 0.5 }}>
                  {formatTime(selectedBatch.schedule?.startTime)} -{" "}
                  {formatTime(selectedBatch.schedule?.endTime)}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Days:
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {selectedBatch.schedule?.days?.map((day) => (
                    <Chip
                      key={day}
                      label={day}
                      size="small"
                      sx={{
                        borderRadius: 1,
                        bgcolor: (theme) =>
                          alpha(theme.palette.primary.main, 0.1),
                        color: "primary.main",
                      }}
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Additional Information Card */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 2,
              bgcolor: "background.paper",
              transition: "transform 0.2s ease-in-out",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 3,
              },
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              color="primary"
              sx={{ fontWeight: 600 }}
            >
              Additional Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Capacity:
                </Typography>
                <Typography variant="body1" sx={{ mt: 0.5 }}>
                  {selectedBatch.enrolledStudents?.length || 0} /{" "}
                  {selectedBatch.capacity || "Unlimited"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Fees:
                </Typography>
                <Typography variant="body1" sx={{ mt: 0.5 }}>
                  ${selectedBatch.fees}
                </Typography>
              </Grid>
              {selectedBatch.description && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Description:
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      mt: 1,
                      backgroundColor: (theme) =>
                        alpha(theme.palette.primary.light, 0.05),
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body2">
                      {selectedBatch.description}
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>

        {/* Students Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                Enrolled Students
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<PersonAddIcon />}
                  onClick={handleAddExistingStudentToBatch}
                  disabled={
                    selectedBatch.capacity &&
                    selectedBatch.enrolledStudents?.length >=
                    selectedBatch.capacity
                  }
                  sx={{ borderRadius: 2 }}
                >
                  Add Existing Student
                </Button>
                <Button
                  variant="contained"
                  startIcon={<PersonAddIcon />}
                  onClick={() => setStudentDialogOpen(true)}
                  disabled={
                    selectedBatch.capacity &&
                    selectedBatch.enrolledStudents?.length >=
                    selectedBatch.capacity
                  }
                  sx={{ borderRadius: 2 }}
                >
                  Add New Student
                </Button>
              </Box>
            </Box>

            {selectedBatch.enrolledStudents?.length > 0 ? (
              <TableContainer sx={{ borderRadius: 1 }}>
                <Table>
                  <TableHead>
                    <TableRow
                      sx={{
                        bgcolor: (theme) =>
                          alpha(theme.palette.primary.main, 0.1),
                      }}
                    >
                      <TableCell>Name</TableCell>
                      <TableCell>ID</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedBatch.enrolledStudents.map((student) => (
                      <TableRow key={student._id}>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.studentId}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.phone}</TableCell>
                        <TableCell align="right">
                          <Tooltip title="Remove from batch">
                            <IconButton
                              size="small"
                              onClick={() => openStudentRemovalDialog(student)}
                              sx={{
                                color: "error.main",
                                "&:hover": {
                                  backgroundColor: (theme) =>
                                    alpha(theme.palette.error.main, 0.1),
                                },
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ py: 4, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  No students enrolled yet
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Add Existing Student Dialog */}
      <Dialog
        open={existingStudentDialogOpen}
        onClose={() => {
          setExistingStudentDialogOpen(false);
          setSearchQuery("");
          setSelectedExistingStudents([]);
        }}
        maxWidth="sm"
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
            bgcolor: "primary.main",
            color: "primary.contrastText",
            py: 2,
          }}
        >
          Add Existing Students
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search students by name, ID, email, or phone"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            {!searchQuery ? (
              <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                Start typing to search for students
              </Typography>
            ) : filteredStudents.length === 0 ? (
              <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                No students found matching your search
              </Typography>
            ) : (
              <List>
                {filteredStudents.map((student) => (
                  <ListItem
                    key={student._id}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemButton
                      onClick={() => {
                        if (selectedExistingStudents.includes(student._id)) {
                          setSelectedExistingStudents(selectedExistingStudents.filter(id => id !== student._id));
                        } else {
                          setSelectedExistingStudents([...selectedExistingStudents, student._id]);
                        }
                      }}
                    >
                      <ListItemText
                        primary={student.name}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              ID: {student.studentId}
                            </Typography>
                            <br />
                            <Typography component="span" variant="body2" color="text.secondary">
                              Email: {student.email}
                            </Typography>
                            <br />
                            <Typography component="span" variant="body2" color="text.secondary">
                              Phone: {student.phone}
                            </Typography>
                          </>
                        }
                      />
                      <Checkbox
                        edge="end"
                        checked={selectedExistingStudents.includes(student._id)}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => {
              setExistingStudentDialogOpen(false);
              setSearchQuery("");
              setSelectedExistingStudents([]);
            }}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEnrollExistingStudent}
            variant="contained"
            disabled={submitting || !selectedExistingStudents.length}
            sx={{ borderRadius: 2 }}
          >
            {submitting ? "Adding..." : "Add Selected Students"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add New Student Dialog */}
      <Dialog
        open={studentDialogOpen}
        onClose={() => setStudentDialogOpen(false)}
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
            bgcolor: "primary.main",
            color: "primary.contrastText",
            py: 2,
          }}
        >
          Add New Student
        </DialogTitle>
        <Formik
          initialValues={{
            name: "",
            email: "",
            phone: "",
            parentName: "",
            parentPhone: "",
            address: "",
            dateOfBirth: "",
            gender: "",
            board: "",
            schoolName: "",
            previousPercentage: "",
            joiningDate: new Date().toISOString().split("T")[0],
          }}
          validationSchema={newStudentValidationSchema}
          onSubmit={async (
            values,
            { setSubmitting, resetForm, setFieldError }
          ) => {
            try {
              setSubmitting(true);

              // Generate student ID
              const studentId = await generateStudentId();

              // Create new student with batch and standard from current batch
              const studentData = {
                ...values,
                studentId,
                standard: selectedBatch.standard._id,
                batches: [selectedBatch._id],
              };

              // Create the student
              const result = await dispatch(
                createStudent(studentData)
              ).unwrap();

              // Update the batch's enrolled students
              const updatedBatch = {
                ...selectedBatch,
                enrolledStudents: [...selectedBatch.enrolledStudents, result],
              };

              // Update the local state
              setSelectedBatch(updatedBatch);

              // Clear form and close dialog
              resetForm();
              setStudentDialogOpen(false);
            } catch (error) {
              // Handle API validation errors
              if (error.response?.data?.errors) {
                error.response.data.errors.forEach((err) => {
                  setFieldError(err.param, err.msg);
                });
              } else {
                // Set generic error message
                setFieldError(
                  "submit",
                  error.message || "Failed to add student"
                );
              }
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form>
              <DialogContent
                dividers
                sx={{
                  p: 3,
                  maxHeight: "70vh", // Set maximum height to 70% of viewport height
                  overflowY: "auto", // Enable vertical scrolling
                  "&::-webkit-scrollbar": {
                    width: "8px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: (theme) =>
                      alpha(theme.palette.primary.main, 0.05),
                    borderRadius: "4px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: (theme) =>
                      alpha(theme.palette.primary.main, 0.2),
                    borderRadius: "4px",
                    "&:hover": {
                      background: (theme) =>
                        alpha(theme.palette.primary.main, 0.3),
                    },
                  },
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Field name="name">
                      {({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Full Name"
                          error={touched.name && Boolean(errors.name)}
                          helperText={touched.name && errors.name}
                          required
                          sx={{
                            "& .MuiOutlinedInput-root": { borderRadius: 2 },
                          }}
                        />
                      )}
                    </Field>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Field name="email">
                      {({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Email"
                          type="email"
                          error={touched.email && Boolean(errors.email)}
                          helperText={touched.email && errors.email}
                          required
                          sx={{
                            "& .MuiOutlinedInput-root": { borderRadius: 2 },
                          }}
                        />
                      )}
                    </Field>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Field name="phone">
                      {({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Phone Number"
                          error={touched.phone && Boolean(errors.phone)}
                          helperText={touched.phone && errors.phone}
                          required
                          sx={{
                            "& .MuiOutlinedInput-root": { borderRadius: 2 },
                          }}
                        />
                      )}
                    </Field>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Field name="parentName">
                      {({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Parent Name"
                          error={
                            touched.parentName && Boolean(errors.parentName)
                          }
                          helperText={touched.parentName && errors.parentName}
                          sx={{
                            "& .MuiOutlinedInput-root": { borderRadius: 2 },
                          }}
                        />
                      )}
                    </Field>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Field name="parentPhone">
                      {({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Parent Phone"
                          error={
                            touched.parentPhone && Boolean(errors.parentPhone)
                          }
                          helperText={touched.parentPhone && errors.parentPhone}
                          sx={{
                            "& .MuiOutlinedInput-root": { borderRadius: 2 },
                          }}
                        />
                      )}
                    </Field>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Field name="gender">
                      {({ field }) => (
                        <FormControl
                          fullWidth
                          required
                          error={touched.gender && Boolean(errors.gender)}
                        >
                          <InputLabel>Gender</InputLabel>
                          <Select
                            {...field}
                            label="Gender"
                            sx={{ borderRadius: 2 }}
                          >
                            <MenuItem value="male">Male</MenuItem>
                            <MenuItem value="female">Female</MenuItem>
                            <MenuItem value="other">Other</MenuItem>
                          </Select>
                          {touched.gender && errors.gender && (
                            <FormHelperText error>
                              {errors.gender}
                            </FormHelperText>
                          )}
                        </FormControl>
                      )}
                    </Field>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Field name="dateOfBirth">
                      {({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Date of Birth"
                          type="date"
                          InputLabelProps={{ shrink: true }}
                          error={
                            touched.dateOfBirth && Boolean(errors.dateOfBirth)
                          }
                          helperText={touched.dateOfBirth && errors.dateOfBirth}
                          sx={{
                            "& .MuiOutlinedInput-root": { borderRadius: 2 },
                          }}
                        />
                      )}
                    </Field>
                  </Grid>

                  <Grid item xs={12}>
                    <Field name="address">
                      {({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Address"
                          multiline
                          rows={2}
                          error={touched.address && Boolean(errors.address)}
                          helperText={touched.address && errors.address}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              backgroundColor: (theme) =>
                                alpha(theme.palette.primary.light, 0.02),
                            },
                          }}
                        />
                      )}
                    </Field>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Field name="schoolName">
                      {({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="School Name"
                          error={
                            touched.schoolName && Boolean(errors.schoolName)
                          }
                          helperText={touched.schoolName && errors.schoolName}
                          sx={{
                            "& .MuiOutlinedInput-root": { borderRadius: 2 },
                          }}
                        />
                      )}
                    </Field>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Field name="board">
                      {({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Board"
                          error={touched.board && Boolean(errors.board)}
                          helperText={touched.board && errors.board}
                          sx={{
                            "& .MuiOutlinedInput-root": { borderRadius: 2 },
                          }}
                        />
                      )}
                    </Field>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Field name="previousPercentage">
                      {({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Previous Percentage"
                          type="number"
                          InputProps={{ inputProps: { min: 0, max: 100 } }}
                          error={
                            touched.previousPercentage &&
                            Boolean(errors.previousPercentage)
                          }
                          helperText={
                            touched.previousPercentage &&
                            errors.previousPercentage
                          }
                          sx={{
                            "& .MuiOutlinedInput-root": { borderRadius: 2 },
                          }}
                        />
                      )}
                    </Field>
                  </Grid>

                  {errors.submit && (
                    <Grid item xs={12}>
                      <Typography color="error" variant="body2">
                        {errors.submit}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </DialogContent>
              <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button
                  onClick={() => setStudentDialogOpen(false)}
                  variant="outlined"
                  sx={{ borderRadius: 2 }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  sx={{ borderRadius: 2 }}
                >
                  {isSubmitting ? "Adding..." : "Add Student"}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>

      {/* Iteration Confirmation Dialog */}
      <Dialog
        open={iterationConfirmOpen}
        onClose={() => setIterationConfirmOpen(false)}
        maxWidth="sm"
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
            bgcolor: "primary.main",
            color: "primary.contrastText",
            py: 2,
          }}
        >
          Continue Enrollment
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Typography variant="body1">
            Do you want to continue enrolling the next student?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setIterationConfirmOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleContinueIteration}
            variant="contained"
            sx={{ borderRadius: 2 }}
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Delete Confirmation Dialogs at the bottom of the component before the closing Box */}
      <DeleteConfirmationDialog
        open={studentRemovalDialogOpen}
        onClose={closeStudentRemovalDialog}
        onConfirm={confirmStudentRemoval}
        loading={studentRemovalLoading}
        itemName={studentToRemove?.name}
        title="Remove Student"
        message="Are you sure you want to remove student"
      />
    </Box>
  );
};

export default BatchView;
