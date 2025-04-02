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
  Grid,
  FormControlLabel,
  Switch,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { Formik } from "formik";
import * as Yup from "yup";
import {
  fetchSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  resetStatus,
} from "../store/slices/subjectSlice";

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  description: Yup.string().required("Description is required"),
  duration: Yup.string().required("Duration is required"),
  status: Yup.string()
    .oneOf(["active", "inactive"])
    .required("Status is required"),
});

const Subjects = () => {
  const dispatch = useDispatch();
  const { subjects, loading, error, success } = useSelector(
    (state) => state.subjects
  );
  const [open, setOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);

  useEffect(() => {
    dispatch(fetchSubjects());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      setOpen(false);
      setSelectedSubject(null);
      dispatch(resetStatus());
    }
  }, [success, dispatch]);

  const handleOpen = (subject = null) => {
    setSelectedSubject(subject);
    setOpen(true);
  };

  const handleClose = () => {
    setSelectedSubject(null);
    setOpen(false);
    dispatch(resetStatus());
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      if (selectedSubject) {
        dispatch(updateSubject({ id: selectedSubject._id, data: values }));
      } else {
        dispatch(createSubject(values));
      }
    } catch (err) {
      console.error("Error saving subject:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this subject?")) {
      dispatch(deleteSubject(id));
    }
  };

  const handleStatusChange = async (subjectId, currentStatus) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      dispatch(
        updateSubject({
          id: subjectId,
          data: { status: newStatus },
        })
      );
    } catch (error) {
      console.error("Error updating subject status:", error);
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
          Subjects
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Subject
        </Button>
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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subjects.map((subject) => (
              <TableRow
                key={subject._id}
                sx={{
                  backgroundColor:
                    subject.status === "active"
                      ? "inherit"
                      : "rgba(0, 0, 0, 0.04)",
                  "&:hover": {
                    backgroundColor:
                      subject.status === "active"
                        ? "rgba(0, 0, 0, 0.04)"
                        : "rgba(0, 0, 0, 0.08)",
                  },
                }}
              >
                <TableCell>{subject.name}</TableCell>
                <TableCell>{subject.description}</TableCell>
                <TableCell>{subject.duration}</TableCell>
                <TableCell>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={subject.status === "active"}
                        onChange={() =>
                          handleStatusChange(subject._id, subject.status)
                        }
                        color="primary"
                      />
                    }
                    label={subject.status}
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleOpen(subject)}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(subject._id)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { minHeight: "50vh" },
        }}
      >
        <DialogTitle>
          {selectedSubject ? "Edit Subject" : "Add New Subject"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Formik
              initialValues={{
                name: selectedSubject?.name || "",
                description: selectedSubject?.description || "",
                duration: selectedSubject?.duration || "",
                status: selectedSubject?.status || "active",
              }}
              validationSchema={validationSchema}
              validateOnChange={true}
              validateOnBlur={true}
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
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        name="name"
                        label="Subject Name"
                        value={values.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.name && Boolean(errors.name)}
                        helperText={touched.name && errors.name}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        name="description"
                        label="Description"
                        multiline
                        rows={3}
                        value={values.description}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={
                          touched.description && Boolean(errors.description)
                        }
                        helperText={touched.description && errors.description}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        name="duration"
                        label="Duration (e.g., 1 hour, 2 hours)"
                        value={values.duration}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.duration && Boolean(errors.duration)}
                        helperText={touched.duration && errors.duration}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={values.status === "active"}
                            onChange={(e) =>
                              setFieldValue(
                                "status",
                                e.target.checked ? "active" : "inactive"
                              )
                            }
                            color="primary"
                          />
                        }
                        label={values.status}
                      />
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
                      {selectedSubject ? "Update" : "Add"}
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

export default Subjects;
