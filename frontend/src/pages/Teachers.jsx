import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
  Card,
  CardContent,
  CardActions,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  Clear as ClearIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  School as SchoolIcon,
} from "@mui/icons-material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { teacherService } from "../services/api";
import { fetchSubjects } from "../store/slices/subjectSlice";
import {
  fetchTeachers,
  updateTeacher,
  createTeacher,
  deleteTeacher,
} from "../store/slices/teacherSlice";
import RefreshButton from "../components/RefreshButton";

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

  // Add loadAllData function for refresh button
  const loadAllData = useCallback(() => {
    dispatch(fetchTeachers());
    dispatch(fetchSubjects());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchTeachers());
    dispatch(fetchSubjects());
  }, [dispatch]);

  // Initialize filtered teachers when teachers data loads
  useEffect(() => {
    setFilteredTeachers(teachers || []);
    // Clear any Redux errors
    if (reduxError) {
      setError(reduxError);
    }
  }, [teachers, reduxError]);

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

  const handleOpen = (teacher = null) => {
    setSelectedTeacher(teacher);
    setOpen(true);
  };

  const handleClose = () => {
    setSelectedTeacher(null);
    setOpen(false);
    setSuccess(null);
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

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this teacher?")) {
      try {
        await dispatch(deleteTeacher(id)).unwrap();
        setSuccess("Teacher deleted successfully");
      } catch (err) {
        console.error("Error deleting teacher:", err);
        setError(err.message || "Failed to delete teacher");
      }
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
            Teachers
          </Typography>
          <RefreshButton
            onRefresh={loadAllData}
            tooltip="Refresh teachers data"
            sx={{ ml: 1 }}
          />
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          sx={{ alignSelf: { xs: "flex-start", sm: "auto" } }}
        >
          Add Teacher
        </Button>
      </Box>

      {(error || reduxError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || reduxError}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
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
              />
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
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
                label="Filter by Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
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
                  endAdornment: qualificationFilter && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setQualificationFilter("")}
                      >
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
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
          Showing {filteredTeachers.length} of {teachers.length} teachers
        </Typography>
        {filteredTeachers.length === 0 && teachers.length > 0 && (
          <Alert severity="info" sx={{ py: 0 }}>
            No teachers match your filter criteria
          </Alert>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

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
            // Mobile card view
            <Stack spacing={2}>
              {filteredTeachers.length > 0 ? (
                filteredTeachers.map((teacher) => (
                  <Card key={teacher._id} sx={{ width: "100%" }}>
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 2,
                        }}
                      >
                        <Typography variant="h6" component="div">
                          {teacher.name}
                        </Typography>
                        <Chip
                          label={teacher.status}
                          color={
                            teacher.status === "active" ? "success" : "default"
                          }
                          size="small"
                        />
                      </Box>

                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <PhoneIcon
                          fontSize="small"
                          color="action"
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="body2">{teacher.phone}</Typography>
                      </Box>

                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <EmailIcon
                          fontSize="small"
                          color="action"
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="body2">{teacher.email}</Typography>
                      </Box>

                      <Box sx={{ mt: 2 }}>
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          gutterBottom
                        >
                          Subjects
                        </Typography>
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
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
                                  sx={{ mr: 0.5, mb: 0.5 }}
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

                      <Box sx={{ mt: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Qualification
                        </Typography>
                        <Typography variant="body2">
                          {teacher.qualification} ({teacher.experience} years
                          experience)
                        </Typography>
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleOpen(teacher)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(teacher._id)}
                      >
                        Delete
                      </Button>
                    </CardActions>
                  </Card>
                ))
              ) : (
                <Typography align="center" sx={{ py: 3 }}>
                  No teachers found
                </Typography>
              )}
            </Stack>
          ) : (
            // Desktop table view
            <TableContainer component={Paper}>
              <Table size={isTablet ? "small" : "medium"}>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Subjects</TableCell>
                    {!isTablet && <TableCell>Qualification</TableCell>}
                    {!isTablet && <TableCell>Experience</TableCell>}
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTeachers.length > 0 ? (
                    filteredTeachers.map((teacher) => (
                      <TableRow key={teacher._id}>
                        <TableCell>{teacher.name}</TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {teacher.email}
                          </Typography>
                          <Typography variant="body2">
                            {teacher.phone}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
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
                                    sx={{ mr: 0.5, mb: 0.5 }}
                                  />
                                ) : null;
                              })
                            ) : (
                              <Typography variant="caption">
                                No subjects
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        {!isTablet && (
                          <TableCell>{teacher.qualification}</TableCell>
                        )}
                        {!isTablet && (
                          <TableCell>{teacher.experience} years</TableCell>
                        )}
                        <TableCell>
                          <Chip
                            label={teacher.status}
                            color={
                              teacher.status === "active"
                                ? "success"
                                : "default"
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() => handleOpen(teacher)}
                            sx={{ mr: 1 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleDelete(teacher._id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={isTablet ? 5 : 7} align="center">
                        No teachers found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          {selectedTeacher ? "Edit Teacher" : "Add New Teacher"}
        </DialogTitle>
        <Formik
          initialValues={{
            name: selectedTeacher?.name || "",
            email: selectedTeacher?.email || "",
            password: "", // Don't prefill password for security
            phone: selectedTeacher?.phone || "",
            gender: selectedTeacher?.gender || "",
            address: selectedTeacher?.address || "",
            subjects: selectedTeacher?.subjects
              ? Array.isArray(selectedTeacher.subjects)
                ? selectedTeacher.subjects.map((s) =>
                    typeof s === "object" && s._id ? s._id : s
                  )
                : []
              : [],
            qualification: selectedTeacher?.qualification || "",
            experience: selectedTeacher?.experience || 0,
            joiningDate: selectedTeacher?.joiningDate
              ? new Date(selectedTeacher.joiningDate)
                  .toISOString()
                  .split("T")[0]
              : "",
            salary: selectedTeacher?.salary || 0,
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
              <DialogContent>
                <Grid container spacing={2}>
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
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={
                        selectedTeacher ? "New Password (optional)" : "Password"
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
                    >
                      <MenuItem value="male">Male</MenuItem>
                      <MenuItem value="female">Female</MenuItem>
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
                    />
                  </Grid>
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
                      helperText={touched.qualification && errors.qualification}
                      margin="dense"
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
                      error={touched.joiningDate && Boolean(errors.joiningDate)}
                      helperText={touched.joiningDate && errors.joiningDate}
                      InputLabelProps={{ shrink: true }}
                      margin="dense"
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
                        startAdornment: (
                          <InputAdornment position="start">₹</InputAdornment>
                        ),
                      }}
                      inputProps={{ min: 0 }}
                      margin="dense"
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
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions
                sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 2 } }}
              >
                <Button onClick={handleClose} disabled={submitting}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    <CircularProgress size={24} />
                  ) : selectedTeacher ? (
                    "Update"
                  ) : (
                    "Create"
                  )}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </Box>
  );
};

export default Teachers;
