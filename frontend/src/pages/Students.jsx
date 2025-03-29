import React, { useEffect, useState } from "react";
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

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
    .required("Phone number is required"),
  standard: Yup.string().required("Standard is required"),
  subjects: Yup.array().of(Yup.string()),
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
  grade: Yup.string().required("Grade is required"),
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
  const { standards } = useSelector((state) => state.standards);
  const { subjects } = useSelector((state) => state.subjects);
  const [open, setOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  useEffect(() => {
    dispatch(fetchStudents());
    dispatch(fetchStandards());
    dispatch(fetchSubjects());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      setOpen(false);
      setEditingStudent(null);
      dispatch(resetStatus());
    }
  }, [success, dispatch]);

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      standard: "",
      subjects: [],
      parentName: "",
      parentPhone: "",
      parentEmail: "",
      address: "",
      dateOfBirth: "",
      gender: "",
      grade: "",
      board: "",
      schoolName: "",
      previousPercentage: "",
      joiningDate: "",
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      if (editingStudent) {
        dispatch(updateStudent({ id: editingStudent._id, data: values }));
      } else {
        dispatch(createStudent(values));
      }
    },
  });

  const handleOpen = (student = null) => {
    if (student) {
      setEditingStudent(student);
      formik.setValues({
        name: student.name,
        email: student.email,
        phone: student.phone,
        standard: student.standard._id,
        subjects: student.subjects?.map((subject) => subject._id) || [],
        parentName: student.parentName,
        parentPhone: student.parentPhone,
        parentEmail: student.parentEmail,
        address: student.address,
        dateOfBirth: student.dateOfBirth.split("T")[0],
        gender: student.gender,
        grade: student.grade,
        board: student.board,
        schoolName: student.schoolName,
        previousPercentage: student.previousPercentage,
        joiningDate: student.joiningDate.split("T")[0],
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
          Students
        </Typography>
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
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Standard</TableCell>
              <TableCell>Subjects</TableCell>
              <TableCell>Parent Name</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students && students.length > 0 ? (
              students.map((student) => (
                <TableRow key={student._id}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{student.phone}</TableCell>
                  <TableCell>
                    {
                      standards.find((s) => s._id === student.standard._id)
                        ?.name
                    }
                  </TableCell>
                  <TableCell>
                    {student.subjects
                      ?.map((subject) => subject.name)
                      .join(", ")}
                  </TableCell>
                  <TableCell>{student.parentName}</TableCell>
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
                <TableCell colSpan={7} align="center">
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
                    onChange={formik.handleChange}
                    label="Standard"
                  >
                    {standards?.map((standard) => (
                      <MenuItem key={standard._id} value={standard._id}>
                        {standard.name} ({standard.level})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Subjects</InputLabel>
                  <Select
                    multiple
                    name="subjects"
                    value={formik.values.subjects}
                    onChange={formik.handleChange}
                    label="Subjects"
                    disabled={!formik.values.standard}
                  >
                    {subjects
                      ?.filter(
                        (subject) =>
                          subject.standard &&
                          subject.standard._id === formik.values.standard
                      )
                      .map((subject) => (
                        <MenuItem key={subject._id} value={subject._id}>
                          {subject.name}
                        </MenuItem>
                      ))}
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
                  fullWidth
                  name="dateOfBirth"
                  label="Date of Birth"
                  type="date"
                  value={formik.values.dateOfBirth}
                  onChange={formik.handleChange}
                  InputLabelProps={{ shrink: true }}
                  error={
                    formik.touched.dateOfBirth &&
                    Boolean(formik.errors.dateOfBirth)
                  }
                  helperText={
                    formik.touched.dateOfBirth && formik.errors.dateOfBirth
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    name="gender"
                    value={formik.values.gender}
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
                <TextField
                  fullWidth
                  name="grade"
                  label="Grade"
                  value={formik.values.grade}
                  onChange={formik.handleChange}
                  error={formik.touched.grade && Boolean(formik.errors.grade)}
                  helperText={formik.touched.grade && formik.errors.grade}
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
                  fullWidth
                  name="joiningDate"
                  label="Joining Date"
                  type="date"
                  value={formik.values.joiningDate}
                  onChange={formik.handleChange}
                  InputLabelProps={{ shrink: true }}
                  error={
                    formik.touched.joiningDate &&
                    Boolean(formik.errors.joiningDate)
                  }
                  helperText={
                    formik.touched.joiningDate && formik.errors.joiningDate
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
