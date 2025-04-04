import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  Clear as ClearIcon,
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

  // Filter state
  const [nameFilter, setNameFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [qualificationFilter, setQualificationFilter] = useState("");
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [filterExpanded, setFilterExpanded] = useState(false);

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

      // Prepare data for submission
      const formData = {
        ...values,
        subjects: subjectIds,
        status: values.status || "active",
        joiningDate: formattedJoiningDate,
      };

      // For updates, only include password if it's provided and not empty
      if (selectedTeacher) {
        if (!values.password || values.password.trim() === "") {
          delete formData.password;
        }
      }

      console.log("Submitting teacher data:", formData);

      let result;
      if (selectedTeacher) {
        console.log(`Updating teacher with ID ${selectedTeacher._id}`);
        result = await dispatch(
          updateTeacher({ id: selectedTeacher._id, data: formData })
        ).unwrap();
        console.log("Update result:", result);
        setSuccess("Teacher updated successfully");
      } else {
        console.log("Creating new teacher");
        result = await dispatch(createTeacher(formData)).unwrap();
        console.log("Create result:", result);
        setSuccess("Teacher added successfully");
      }

      // Refresh teacher list to ensure we have the latest data
      dispatch(fetchTeachers());
      handleClose();
      resetForm();
    } catch (err) {
      console.error("Error saving teacher:", err);

      // Handle backend validation errors
      if (err.response?.data?.errors) {
        const backendErrors = err.response.data.errors.reduce((acc, error) => {
          acc[error.param] = error.msg;
          return acc;
        }, {});
        setErrors(backendErrors);
      } else {
        setError(err.message || "Failed to save teacher");
      }
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
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          Teachers
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
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

      {/* Filter Section */}
      <Accordion
        expanded={filterExpanded}
        onChange={() => setFilterExpanded(!filterExpanded)}
        sx={{ mb: 2 }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="filter-panel-content"
          id="filter-panel-header"
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <FilterIcon sx={{ mr: 1 }} />
            <Typography>Filter Teachers</Typography>
            {(nameFilter ||
              subjectFilter ||
              statusFilter ||
              qualificationFilter) && (
              <Chip
                label={`${
                  Object.values([
                    nameFilter,
                    subjectFilter,
                    statusFilter,
                    qualificationFilter,
                  ]).filter(Boolean).length
                } active`}
                size="small"
                color="primary"
                sx={{ ml: 1 }}
              />
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
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
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
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
            <Grid item xs={12} sm={2}>
              <TextField
                select
                fullWidth
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Qualification"
                value={qualificationFilter}
                onChange={(e) => setQualificationFilter(e.target.value)}
                InputProps={{
                  endAdornment: qualificationFilter && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setQualificationFilter("")}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={1}>
              <Button
                variant="outlined"
                onClick={clearFilters}
                fullWidth
                disabled={
                  !nameFilter &&
                  !subjectFilter &&
                  !statusFilter &&
                  !qualificationFilter
                }
              >
                Clear
              </Button>
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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Professional Info</TableCell>
              <TableCell>Subjects</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTeachers.map((teacher) => (
              <TableRow key={teacher._id}>
                <TableCell>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {teacher.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {teacher.email}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">{teacher.phone}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {teacher.address}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">
                      {teacher.qualification}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {teacher.experience} years exp.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ₹{teacher.salary}/month
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {teacher.subjects?.map((subjectId) => {
                      const subject = subjects.find((s) => s._id === subjectId);
                      return (
                        <Chip
                          key={subjectId}
                          label={subject?.name || subjectId}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      );
                    })}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={teacher.status}
                    color={teacher.status === "active" ? "success" : "error"}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpen(teacher)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(teacher._id)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { minHeight: "50vh" },
        }}
      >
        <DialogTitle>
          {selectedTeacher ? "Edit Teacher" : "Add New Teacher"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Formik
              initialValues={{
                name: selectedTeacher?.name || "",
                email: selectedTeacher?.email || "",
                password: "", // Always start with empty password
                phone: selectedTeacher?.phone || "",
                gender: selectedTeacher?.gender || "male",
                address: selectedTeacher?.address || "",
                subjects: selectedTeacher?.subjects || [],
                qualification: selectedTeacher?.qualification || "",
                experience: selectedTeacher?.experience || "",
                status: selectedTeacher?.status || "active",
                salary: selectedTeacher?.salary || "",
                joiningDate: selectedTeacher?.joiningDate
                  ? new Date(selectedTeacher.joiningDate)
                      .toISOString()
                      .split("T")[0]
                  : "",
              }}
              validationSchema={validationSchema(!!selectedTeacher)}
              validateOnChange={true}
              validateOnBlur={true}
              onSubmit={handleSubmit}
              validateOnMount={false}
              enableReinitialize={true} // Update form when selectedTeacher changes
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
                isValid,
                dirty,
              }) => (
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
                    {/* Personal Information Section */}
                    <Grid item xs={12}>
                      <Typography variant="h6" color="primary" gutterBottom>
                        Personal Information
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        name="name"
                        label="Name"
                        value={values.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.name && Boolean(errors.name)}
                        helperText={touched.name && errors.name}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        name="email"
                        label="Email"
                        type="email"
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.email && Boolean(errors.email)}
                        helperText={touched.email && errors.email}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        name="password"
                        label={
                          selectedTeacher
                            ? "New Password (Optional)"
                            : "Password"
                        }
                        type="password"
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.password && Boolean(errors.password)}
                        helperText={touched.password && errors.password}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        name="phone"
                        label="Phone"
                        value={values.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.phone && Boolean(errors.phone)}
                        helperText={touched.phone && errors.phone}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        select
                        name="gender"
                        label="Gender"
                        value={values.gender}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.gender && Boolean(errors.gender)}
                        helperText={touched.gender && errors.gender}
                      >
                        <MenuItem value="male">Male</MenuItem>
                        <MenuItem value="female">Female</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        name="address"
                        label="Address"
                        multiline
                        rows={2}
                        value={values.address}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.address && Boolean(errors.address)}
                        helperText={touched.address && errors.address}
                      />
                    </Grid>

                    {/* Professional Information Section */}
                    <Grid item xs={12}>
                      <Typography
                        variant="h6"
                        color="primary"
                        gutterBottom
                        sx={{ mt: 2 }}
                      >
                        Professional Information
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        select
                        fullWidth
                        name="subjects"
                        label="Subjects"
                        value={values.subjects}
                        onChange={handleChange}
                        error={touched.subjects && Boolean(errors.subjects)}
                        helperText={touched.subjects && errors.subjects}
                        SelectProps={{
                          multiple: true,
                          renderValue: (selected) => (
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 0.5,
                              }}
                            >
                              {selected.map((value) => (
                                <Chip
                                  key={value}
                                  label={
                                    subjects.find((s) => s._id === value)
                                      ?.name || value
                                  }
                                />
                              ))}
                            </Box>
                          ),
                        }}
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
                        name="qualification"
                        label="Qualification"
                        value={values.qualification}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={
                          touched.qualification && Boolean(errors.qualification)
                        }
                        helperText={
                          touched.qualification && errors.qualification
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        name="experience"
                        label="Experience (years)"
                        type="number"
                        value={values.experience}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.experience && Boolean(errors.experience)}
                        helperText={touched.experience && errors.experience}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        name="salary"
                        label="Salary"
                        type="number"
                        value={values.salary}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.salary && Boolean(errors.salary)}
                        helperText={touched.salary && errors.salary}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        name="joiningDate"
                        label="Joining Date"
                        type="date"
                        value={values.joiningDate || ""}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={
                          touched.joiningDate && Boolean(errors.joiningDate)
                        }
                        helperText={touched.joiningDate && errors.joiningDate}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        select
                        name="status"
                        label="Status"
                        value={values.status}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.status && Boolean(errors.status)}
                        helperText={touched.status && errors.status}
                      >
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                      </TextField>
                    </Grid>
                  </Grid>
                  <DialogActions sx={{ mt: 2 }}>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <CircularProgress size={24} />
                      ) : selectedTeacher ? (
                        "Update"
                      ) : (
                        "Add"
                      )}
                    </Button>
                  </DialogActions>
                </form>
              )}
            </Formik>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Teachers;
