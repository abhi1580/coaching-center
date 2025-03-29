import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { teacherService } from "../services/api";

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .when("$isEdit", {
      is: true,
      then: (schema) => schema.nullable(),
      otherwise: (schema) => schema.required("Password is required"),
    }),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
    .required("Phone number is required"),
  gender: Yup.string().required("Gender is required"),
  address: Yup.string().required("Address is required"),
  subjects: Yup.array()
    .of(Yup.string())
    .required("At least one subject is required"),
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

const subjects = [
  "Physics",
  "Chemistry",
  "Mathematics",
  "Biology",
  "Computer Science",
  "English",
  "History",
  "Geography",
  "Economics",
  "Political Science",
];

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await teacherService.getAll();
      console.log("Teachers API Response:", response);

      let teachersData = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          teachersData = response.data;
        } else if (Array.isArray(response.data.teachers)) {
          teachersData = response.data.teachers;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          teachersData = response.data.data;
        }
      }

      console.log("Processed Teachers Data:", teachersData);
      setTeachers(teachersData);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      setError(error.response?.data?.message || "Failed to fetch teachers");
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (teacher = null) => {
    console.log("Opening form with teacher:", teacher);
    setSelectedTeacher(teacher);
    setOpen(true);
  };

  const handleClose = () => {
    console.log("Closing form");
    setSelectedTeacher(null);
    setOpen(false);
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      console.log("Form values before submission:", values);
      console.log("Selected teacher:", selectedTeacher);

      if (selectedTeacher) {
        // For update, remove password and email from the data
        const { password, email, ...updateData } = values;
        console.log("Updating teacher with data:", updateData);
        
        try {
          // Ensure we're sending the correct data format
          const updatePayload = {
            name: values.name,
            phone: values.phone,
            address: values.address,
            subjects: values.subjects,
            qualification: values.qualification,
            experience: values.experience,
            joiningDate: values.joiningDate,
            salary: values.salary,
            status: values.status,
            gender: values.gender
          };
          console.log("Update payload:", updatePayload);
          
          const response = await teacherService.update(selectedTeacher._id, updatePayload);
          console.log("Update response:", response);
          
          if (response.data && response.data.success) {
            setSuccess(response.data.message || "Teacher updated successfully");
            await fetchTeachers(); // Wait for the fetch to complete
            handleClose();
            resetForm();
          } else {
            throw new Error(response.data?.message || "Failed to update teacher");
          }
        } catch (updateError) {
          console.error("Update error:", updateError);
          setError(updateError.response?.data?.message || "Error updating teacher");
        }
      } else {
        // For create, include all data including password
        console.log("Creating teacher with data:", values);
        try {
          const response = await teacherService.create(values);
          console.log("Create response:", response);
          setSuccess("Teacher added successfully");
          await fetchTeachers(); // Wait for the fetch to complete
          handleClose();
          resetForm();
        } catch (createError) {
          console.error("Create error:", createError);
          setError(createError.response?.data?.message || "Error creating teacher");
        }
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setError("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this teacher?")) {
      try {
        console.log("Deleting teacher with ID:", id);
        const response = await teacherService.delete(id);
        console.log("Delete response:", response);

        if (response.data && response.data.success) {
          setSuccess(response.data.message || "Teacher deleted successfully");
          await fetchTeachers(); // Wait for the fetch to complete
        } else {
          throw new Error(response.data?.message || "Failed to delete teacher");
        }
      } catch (error) {
        console.error("Error deleting teacher:", error);
        setError(
          error.response?.data?.message ||
            error.message ||
            "Error deleting teacher"
        );
      }
    }
  };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">Teachers</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Teacher
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Subjects</TableCell>
              <TableCell>Qualification</TableCell>
              <TableCell>Experience</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : teachers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No teachers found
                </TableCell>
              </TableRow>
            ) : (
              teachers.map((teacher) => (
                <TableRow key={teacher._id}>
                  <TableCell>{teacher.name}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {teacher.subjects?.map((subject) => (
                        <Chip
                          key={subject}
                          label={subject}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>{teacher.qualification}</TableCell>
                  <TableCell>{teacher.experience} years</TableCell>
                  <TableCell>{teacher.phone}</TableCell>
                  <TableCell>
                    <Chip
                      label={teacher.status}
                      color={
                        teacher.status === "active" ? "success" : "success"
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleOpen(teacher)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(teacher._id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedTeacher ? "Edit Teacher" : "Add New Teacher"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Formik
              initialValues={{
                name: selectedTeacher?.name || "",
                email: selectedTeacher?.email || "",
                password: selectedTeacher?.password || "",
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
              validationSchema={validationSchema}
              validateOnChange={true}
              validateOnBlur={true}
              onSubmit={handleSubmit}
              context={{ isEdit: !!selectedTeacher }}
            >
              {({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                isSubmitting,
                handleSubmit: formikHandleSubmit
              }) => (
                <Form onSubmit={formikHandleSubmit}>
                  <Grid container spacing={3}>
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
                        label="Teacher Name"
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
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.email && Boolean(errors.email)}
                        helperText={touched.email && errors.email}
                        disabled={!!selectedTeacher}
                      />
                    </Grid>
                    {!selectedTeacher && (
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          name="password"
                          label="Password"
                          type="password"
                          value={values.password}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={touched.password && Boolean(errors.password)}
                          helperText={touched.password && errors.password}
                        />
                      </Grid>
                    )}
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
                        value={values.gender || "male"}
                        onChange={(e) => {
                          console.log("Gender selected:", e.target.value);
                          handleChange(e);
                        }}
                        onBlur={handleBlur}
                        error={touched.gender && Boolean(errors.gender)}
                        helperText={touched.gender && errors.gender}
                        disabled={!!selectedTeacher}
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
                        fullWidth
                        select
                        multiple
                        name="subjects"
                        label="Select Subjects"
                        value={values.subjects}
                        onChange={(e) => {
                          const selectedSubjects = Array.isArray(e.target.value)
                            ? e.target.value
                            : [e.target.value];
                          handleChange({
                            target: {
                              name: "subjects",
                              value: selectedSubjects,
                            },
                          });
                        }}
                        onBlur={handleBlur}
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
                                <Chip key={value} label={value} size="small" />
                              ))}
                            </Box>
                          ),
                        }}
                      >
                        {subjects.map((subject) => (
                          <MenuItem key={subject} value={subject}>
                            {subject}
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

                    {/* Employment Details Section */}
                    <Grid item xs={12}>
                      <Typography
                        variant="h6"
                        color="primary"
                        gutterBottom
                        sx={{ mt: 2 }}
                      >
                        Employment Details
                      </Typography>
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
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        name="joiningDate"
                        label="Joining Date"
                        type="date"
                        value={values.joiningDate}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={
                          touched.joiningDate && Boolean(errors.joiningDate)
                        }
                        helperText={touched.joiningDate && errors.joiningDate}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </Grid>
                  <DialogActions sx={{ mt: 3 }}>
                    <Button onClick={handleClose} color="inherit">
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isSubmitting}
                      color="primary"
                      onClick={(e) => {
                        e.preventDefault();
                        console.log("Submit button clicked");
                        console.log("Form values:", values);
                        console.log("Selected teacher:", selectedTeacher);
                        if (selectedTeacher) {
                          const updatePayload = {
                            name: values.name,
                            phone: values.phone,
                            address: values.address,
                            subjects: values.subjects,
                            qualification: values.qualification,
                            experience: values.experience,
                            joiningDate: values.joiningDate,
                            salary: values.salary,
                            status: values.status,
                            gender: values.gender
                          };
                          console.log("Update payload:", updatePayload);
                          teacherService.update(selectedTeacher._id, updatePayload)
                            .then(response => {
                              console.log("Update response:", response);
                              if (response.data && response.data.success) {
                                setSuccess(response.data.message || "Teacher updated successfully");
                                fetchTeachers();
                                handleClose();
                              } else {
                                throw new Error(response.data?.message || "Failed to update teacher");
                              }
                            })
                            .catch(error => {
                              console.error("Update error:", error);
                              setError(error.response?.data?.message || "Error updating teacher");
                            });
                        } else {
                          formikHandleSubmit(e);
                        }
                      }}
                    >
                      {selectedTeacher ? "Update Teacher" : "Add Teacher"}
                    </Button>
                  </DialogActions>
                </Form>
              )}
            </Formik>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Teachers;
