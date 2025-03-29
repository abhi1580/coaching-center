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
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  fetchStandards,
  createStandard,
  updateStandard,
  deleteStandard,
  resetStatus,
} from "../store/slices/standardSlice";
import { fetchSubjects } from "../store/slices/subjectSlice";

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  level: Yup.number()
    .required("Level is required")
    .min(1, "Level must be at least 1")
    .max(12, "Level must not exceed 12"),
  description: Yup.string()
    .required("Description is required")
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must not exceed 500 characters"),
  subjects: Yup.array().of(Yup.string()),
});

const Standards = () => {
  const dispatch = useDispatch();
  const { standards, loading, error, success } = useSelector(
    (state) => state.standards
  );
  const { subjects } = useSelector((state) => state.subjects);
  const [open, setOpen] = useState(false);
  const [editingStandard, setEditingStandard] = useState(null);

  useEffect(() => {
    dispatch(fetchStandards());
    dispatch(fetchSubjects());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      setOpen(false);
      setEditingStandard(null);
      dispatch(resetStatus());
    }
  }, [success, dispatch]);

  const formik = useFormik({
    initialValues: {
      name: "",
      level: "",
      description: "",
      subjects: [],
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      if (editingStandard) {
        dispatch(updateStandard({ id: editingStandard._id, data: values }));
      } else {
        dispatch(createStandard(values));
      }
    },
  });

  const handleOpen = (standard = null) => {
    if (standard) {
      setEditingStandard(standard);
      formik.setValues({
        name: standard.name,
        level: standard.level,
        description: standard.description,
        subjects: standard.subjects.map((subject) => subject._id),
      });
    } else {
      setEditingStandard(null);
      formik.resetForm();
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingStandard(null);
    formik.resetForm();
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this standard?")) {
      dispatch(deleteStandard(id));
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
          Standards
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Standard
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
              <TableCell>Level</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Subjects</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {standards && standards.length > 0 ? (
              standards.map((standard) => (
                <TableRow key={standard._id}>
                  <TableCell>{standard.name}</TableCell>
                  <TableCell>{standard.level}</TableCell>
                  <TableCell>{standard.description}</TableCell>
                  <TableCell>
                    {standard.subjects
                      .map(
                        (subject) =>
                          subjects.find((s) => s._id === subject._id)?.name
                      )
                      .join(", ")}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpen(standard)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(standard._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No standards found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingStandard ? "Edit Standard" : "Add New Standard"}
        </DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              margin="normal"
              name="name"
              label="Name"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />
            <TextField
              fullWidth
              margin="normal"
              name="level"
              label="Level"
              type="number"
              value={formik.values.level}
              onChange={formik.handleChange}
              error={formik.touched.level && Boolean(formik.errors.level)}
              helperText={formik.touched.level && formik.errors.level}
            />
            <TextField
              fullWidth
              margin="normal"
              name="description"
              label="Description"
              multiline
              rows={4}
              value={formik.values.description}
              onChange={formik.handleChange}
              error={
                formik.touched.description && Boolean(formik.errors.description)
              }
              helperText={
                formik.touched.description && formik.errors.description
              }
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Subjects</InputLabel>
              <Select
                multiple
                name="subjects"
                value={formik.values.subjects}
                onChange={formik.handleChange}
                error={
                  formik.touched.subjects && Boolean(formik.errors.subjects)
                }
              >
                {subjects.map((subject) => (
                  <MenuItem key={subject._id} value={subject._id}>
                    {subject.name}
                  </MenuItem>
                ))}
              </Select>
              {formik.touched.subjects && formik.errors.subjects && (
                <Typography color="error" variant="caption">
                  {formik.errors.subjects}
                </Typography>
              )}
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={formik.isSubmitting}
            >
              {editingStandard ? "Update" : "Add"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Standards;
