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
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
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
  parentEmail: Yup.string()
    .email("Invalid email")
    .required("Parent email is required"),
  address: Yup.string().required("Address is required"),
  dateOfBirth: Yup.date().required("Date of birth is required"),
  gender: Yup.string().required("Gender is required"),
  board: Yup.string().required("Board is required"),
  schoolName: Yup.string().required("School name is required"),
  previousPercentage: Yup.number().min(0).max(100),
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

  // Add debug logs to monitor state changes
  useEffect(() => {
    console.log("Standards updated:", standards);
  }, [standards]);

  useEffect(() => {
    console.log("Subjects updated:", subjects);
  }, [subjects]);

  useEffect(() => {
    console.log("Batches updated:", batches);
  }, [batches]);

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
      parentEmail: "",
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
      console.log("Submitting student with raw values:", values);

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

      console.log("Formatted data for submission:", formattedData);
      console.log("Formatted dateOfBirth:", formattedData.dateOfBirth);
      console.log("Formatted joiningDate:", formattedData.joiningDate);

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

    console.log("Selected standard:", standardId);
    setFormLoading(true);

    // Always fetch subjects from API for selected standard to ensure fresh data
    subjectService
      .getByStandard(standardId)
      .then((response) => {
        console.log("Fetched subjects from API:", response.data);
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
          console.log("Using fallback subjects from state:", standardSubjects);
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

    console.log("Previous subjects:", previousSubjects);
    console.log("New selected subjects:", selectedSubjectIds);

    // Find subjects that were deselected
    const deselectedSubjects = previousSubjects.filter(
      (id) => !selectedSubjectIds.includes(id)
    );

    // Update form values for subjects
    formik.setFieldValue("subjects", selectedSubjectIds);

    if (deselectedSubjects.length > 0) {
      console.log("Subjects deselected:", deselectedSubjects);

      // Remove batches associated with deselected subjects
      const currentBatches = formik.values.batches;

      // Only keep batches if we still have active subjects
      if (selectedSubjectIds.length > 0) {
        // Find which batches to keep by fetching current batches info
        const updatedBatches = [...currentBatches];

        // Get all batches for the remaining subjects
        batchService
          .getBySubject(selectedSubjectIds, formik.values.standard)
          .then((response) => {
            console.log("Fetched updated batches:", response.data);

            // Get valid batch IDs
            const validBatchIds = Array.isArray(response.data)
              ? response.data.map((batch) => batch._id)
              : (response.data.data || []).map((batch) => batch._id);

            // Filter out batches that are no longer valid
            const validBatches = currentBatches.filter((batchId) =>
              validBatchIds.includes(batchId)
            );

            console.log("Updated batch selection:", validBatches);
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
        .getBySubject(selectedSubjectIds, formik.values.standard)
        .then((response) => {
          console.log("Fetched batches from API:", response.data);
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

          console.log("Grouped batches by subject:", batchesBySubject);
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
    console.log("Batch selection changed:", selectedBatches);

    // Make sure it's always an array even if only one item is selected
    const batchesArray = Array.isArray(selectedBatches)
      ? selectedBatches
      : [selectedBatches];

    // Filter out any undefined or null values that might cause issues
    const validBatches = batchesArray.filter((batch) => batch);

    console.log("Setting batches to:", validBatches);
    formik.setFieldValue("batches", validBatches);

    // Debug to verify selection state
    setTimeout(() => {
      console.log("Updated batches in formik:", formik.values.batches);
    }, 0);
  };

  const handleOpen = (student = null) => {
    if (student) {
      setEditingStudent(student);
      console.log("Opening student for edit:", student);

      // Get student standard ID
      const studentStandardId = student.standard?._id || student.standard;

      // Get subject IDs from student
      const studentSubjectIds =
        student.subjects?.map((subject) =>
          typeof subject === "object" ? subject._id : subject
        ) || [];

      console.log("Student standard ID:", studentStandardId);
      console.log("Student subject IDs:", studentSubjectIds);

      // Get student batch IDs
      const studentBatchIds =
        student.batches?.map((batch) =>
          typeof batch === "object" ? batch._id : batch
        ) || [];

      console.log("Student batch IDs:", studentBatchIds);

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

      console.log("Formatted DOB:", dateOfBirth);
      console.log("Formatted Joining Date:", joiningDate);

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
        parentEmail: student.parentEmail || "",
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
          console.log("Fetched subjects from API for editing:", response.data);
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

          console.log("Fallback subjects for editing:", availableSubjects);
          setFilteredSubjects(availableSubjects);
        })
        .finally(() => {
          // Only fetch batches after subjects are loaded
          // Load batches for these subjects
          batchService
            .getBySubject(studentSubjectIds, studentStandardId)
            .then((response) => {
              console.log("Fetched batches for student:", response.data);
              // Handle different response formats
              const batchesData = Array.isArray(response.data)
                ? response.data
                : response.data.data || [];

              setFilteredBatches(batchesData);

              // Ensure all valid batches are visible
              console.log("Available batches for these subjects:", batchesData);
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

              console.log(
                "Fallback batches for this student:",
                availableBatches
              );
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
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" component="h1">
            Students
          </Typography>
          {statsLoading ? (
            <CircularProgress size={20} sx={{ ml: 1 }} />
          ) : (
            <Typography variant="subtitle1" color="text.secondary">
              Total: {totalStudentCount} students{" "}
              {students &&
                students.length !== totalStudentCount &&
                `(${students.length} loaded)`}
            </Typography>
          )}
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Student
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Operation completed successfully
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Contact Info</TableCell>
              <TableCell>Standard</TableCell>
              <TableCell>Subjects & Batches</TableCell>
              <TableCell>Parent Info</TableCell>
              <TableCell>School</TableCell>
              <TableCell>Joining Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students && students.length > 0 ? (
              students.map((student) => (
                <TableRow key={student._id}>
                  <TableCell>
                    <Typography fontWeight="medium">{student.name}</Typography>
                    <Typography
                      variant="caption"
                      display="block"
                      color="text.secondary"
                    >
                      {student.gender || ""}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{student.email}</Typography>
                    <Typography variant="body2">{student.phone}</Typography>
                  </TableCell>
                  <TableCell>
                    {standards.find((s) => s._id === student.standard?._id)
                      ?.name || ""}
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
                            sx={{ mr: 0.5, mb: 0.5 }}
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
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          No batches
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {student.parentName}
                    </Typography>
                    <Typography variant="caption" display="block">
                      {student.parentPhone}
                    </Typography>
                    <Typography
                      variant="caption"
                      display="block"
                      sx={{ fontSize: "0.7rem" }}
                    >
                      {student.parentEmail}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {student.schoolName || ""}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {student.board || ""}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {student.joiningDate
                      ? new Date(student.joiningDate).toLocaleDateString()
                      : ""}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpen(student)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(student._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No students found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingStudent ? "Edit Student" : "Add New Student"}
        </DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              {/* Debug only - show current form values */}
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Selected batches: {formik.values.batches.length} -{" "}
                  {JSON.stringify(formik.values.batches)}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Selected subjects: {formik.values.subjects.length} -{" "}
                  {JSON.stringify(formik.values.subjects)}
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
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Standard</InputLabel>
                  <Select
                    name="standard"
                    value={formik.values.standard}
                    onChange={handleStandardChange}
                    label="Standard"
                    disabled={standardsLoading}
                    error={
                      formik.touched.standard && Boolean(formik.errors.standard)
                    }
                  >
                    {standardsLoading ? (
                      <MenuItem disabled>Loading standards...</MenuItem>
                    ) : standards?.length > 0 ? (
                      standards.map((standard) => (
                        <MenuItem key={standard._id} value={standard._id}>
                          {standard.name} ({standard.level})
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No standards available</MenuItem>
                    )}
                  </Select>
                  {formik.touched.standard && formik.errors.standard && (
                    <div
                      style={{
                        color: "red",
                        fontSize: "0.75rem",
                        marginTop: "3px",
                        marginLeft: "14px",
                      }}
                    >
                      {formik.errors.standard}
                    </div>
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
                          let batchName = value;
                          const filteredBatch = filteredBatches.find(
                            (b) => b._id === value
                          );

                          if (filteredBatch) {
                            batchName = filteredBatch.name;
                          } else {
                            // If not found in filtered batches, try to find in all batches
                            const batch = batches.find((b) => b._id === value);
                            if (batch) {
                              batchName = batch.name;
                            }
                          }

                          return (
                            <Chip key={value} label={batchName} size="small" />
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

                                    console.log(
                                      `Toggling batch ${batch.name}:`,
                                      currentBatches
                                    );
                                    formik.setFieldValue(
                                      "batches",
                                      currentBatches
                                    );
                                  }}
                                  sx={{
                                    paddingLeft: 1,
                                    display: "flex",
                                    alignItems: "center",
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
                                  {batch.name || "Unnamed Batch"}
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
                                        {batch.name} (
                                        {subject?.name || "Unknown Subject"})
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
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="parentEmail"
                  label="Parent Email"
                  value={formik.values.parentEmail}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.parentEmail &&
                    Boolean(formik.errors.parentEmail)
                  }
                  helperText={
                    formik.touched.parentEmail && formik.errors.parentEmail
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
                    console.log(`Date of birth changed to: ${value}`);
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
                  <InputLabel>Gender</InputLabel>
                  <Select
                    name="gender"
                    value={formik.values.gender || ""}
                    onChange={formik.handleChange}
                    label="Gender"
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
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
                    console.log(`Joining date changed to: ${value}`);
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
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {editingStudent ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Students;
