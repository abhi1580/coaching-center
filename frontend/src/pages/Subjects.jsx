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
  FormHelperText,
  Grid,
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
  Chip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Book as BookIcon,
} from "@mui/icons-material";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  fetchSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  resetStatus,
} from "../store/slices/subjectSlice";
import RefreshButton from "../components/RefreshButton";

const Subjects = () => {
  const dispatch = useDispatch();
  const { subjects, loading, error, success } = useSelector(
    (state) => state.subjects
  );
  const [open, setOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const [submitting, setSubmitting] = useState(false);

  // Filter state
  const [nameFilter, setNameFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [filterExpanded, setFilterExpanded] = useState(false);

  useEffect(() => {
    dispatch(fetchSubjects());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      setOpen(false);
      setEditingSubject(null);
      dispatch(resetStatus());
    }
  }, [success, dispatch]);

  // Initialize filtered subjects when subjects data loads
  useEffect(() => {
    setFilteredSubjects(subjects || []);
  }, [subjects]);

  // Apply filters whenever subjects data or filter values change
  useEffect(() => {
    if (!subjects || subjects.length === 0) {
      setFilteredSubjects([]);
      return;
    }

    let results = [...subjects];

    // Filter by name
    if (nameFilter) {
      const searchTerm = nameFilter.toLowerCase();
      results = results.filter((subject) =>
        subject.name.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by status
    if (statusFilter) {
      results = results.filter((subject) => subject.status === statusFilter);
    }

    setFilteredSubjects(results);
  }, [subjects, nameFilter, statusFilter]);

  const clearFilters = () => {
    setNameFilter("");
    setStatusFilter("");
  };

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    description: Yup.string().required("Description is required"),
    duration: Yup.string().required("Duration is required"),
    status: Yup.string()
      .oneOf(["active", "inactive"], "Invalid status")
      .required("Status is required"),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      duration: "",
      status: "active",
    },
    validationSchema: validationSchema,
    onSubmit: (values, { setSubmitting }) => {
      setSubmitting(true);
      if (editingSubject) {
        dispatch(updateSubject({ id: editingSubject._id, data: values }))
          .unwrap()
          .finally(() => setSubmitting(false));
      } else {
        dispatch(createSubject(values))
          .unwrap()
          .finally(() => setSubmitting(false));
      }
    },
  });

  const handleOpen = (subject = null) => {
    if (subject) {
      setEditingSubject(subject);
      formik.setValues({
        name: subject.name || "",
        description: subject.description || "",
        duration: subject.duration || "",
        status: subject.status || "active",
      });
    } else {
      setEditingSubject(null);
      formik.resetForm();
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingSubject(null);
    formik.resetForm();
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this subject?")) {
      dispatch(deleteSubject(id));
    }
  };

  // Add loadAllData function for refresh button
  const loadAllData = useCallback(() => {
    dispatch(fetchSubjects());
  }, [dispatch]);

  if (loading && subjects.length === 0) {
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
            Subjects
          </Typography>
          <RefreshButton
            onRefresh={loadAllData}
            tooltip="Refresh subjects data"
            sx={{ ml: 1 }}
          />
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          sx={{ alignSelf: { xs: "flex-start", sm: "auto" } }}
        >
          Add Subject
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
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
            {(nameFilter || statusFilter) && (
              <Chip
                label={`${[nameFilter ? 1 : 0, statusFilter ? 1 : 0].reduce(
                  (a, b) => a + b,
                  0
                )} active`}
                size="small"
                color="primary"
              />
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Search by Name"
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
            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12}>
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={clearFilters}
                  disabled={!nameFilter && !statusFilter}
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
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: { xs: 1, sm: 0 },
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Showing {filteredSubjects.length} of {subjects.length} subjects
        </Typography>
        {filteredSubjects.length === 0 && subjects.length > 0 && (
          <Alert
            severity="info"
            sx={{ py: 0, width: { xs: "100%", sm: "auto" } }}
          >
            No subjects match your filter criteria
          </Alert>
        )}
      </Box>

      {isMobile ? (
        // Mobile view - cards instead of table
        <Stack spacing={2}>
          {filteredSubjects && filteredSubjects.length > 0 ? (
            filteredSubjects.map((subject, index) => (
              <Card
                key={subject._id || `subject-${index}`}
                sx={{ width: "100%", borderRadius: 2 }}
                elevation={2}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant="h6"
                      component="div"
                      sx={{ fontSize: "1.1rem" }}
                    >
                      {subject.name || "Unnamed Subject"}
                    </Typography>
                    <Chip
                      label={subject.status || "Unknown"}
                      size="small"
                      color={
                        subject.status === "active" ? "success" : "default"
                      }
                      sx={{ ml: 1 }}
                    />
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mr: 1, fontWeight: 500 }}
                    >
                      Duration:
                    </Typography>
                    <Typography variant="body2">
                      {subject.duration || "Not specified"}
                    </Typography>
                  </Box>
                  {subject.description && (
                    <Box sx={{ mt: 1 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontWeight: 500, mb: 0.5 }}
                      >
                        Description:
                      </Typography>
                      <Typography variant="body2">
                        {subject.description}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
                <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleOpen(subject)}
                    color="primary"
                    disabled={!subject._id}
                    sx={{ mr: 1 }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDelete(subject._id)}
                    color="error"
                    disabled={!subject._id}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            ))
          ) : (
            <Typography align="center" sx={{ py: 3 }}>
              No subjects found
            </Typography>
          )}
        </Stack>
      ) : (
        // Desktop/tablet view - table
        <TableContainer
          component={Paper}
          sx={{ borderRadius: 2, overflow: "hidden" }}
        >
          <Table size={isTablet ? "small" : "medium"}>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Name
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Duration
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Status
                </TableCell>
                {!isTablet && (
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Description
                  </TableCell>
                )}
                <TableCell
                  align="right"
                  sx={{ color: "white", fontWeight: "bold" }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSubjects && filteredSubjects.length > 0 ? (
                filteredSubjects.map((subject, index) => (
                  <TableRow key={subject._id || `subject-row-${index}`}>
                    <TableCell>{subject.name || "Unnamed Subject"}</TableCell>
                    <TableCell>{subject.duration || "Not specified"}</TableCell>
                    <TableCell>
                      <Chip
                        label={subject.status || "Unknown"}
                        size="small"
                        color={
                          subject.status === "active" ? "success" : "default"
                        }
                      />
                    </TableCell>
                    {!isTablet && (
                      <TableCell>
                        {subject.description || (
                          <Typography variant="caption" color="text.secondary">
                            No description
                          </Typography>
                        )}
                      </TableCell>
                    )}
                    <TableCell align="right">
                      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <IconButton
                          size="small"
                          onClick={() => handleOpen(subject)}
                          disabled={!subject._id}
                          color="primary"
                          sx={{ mr: 1 }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(subject._id)}
                          disabled={!subject._id}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={isTablet ? 4 : 5} align="center">
                    No subjects found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Subject Form Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 2,
          },
        }}
      >
        <DialogTitle>
          {editingSubject ? "Edit Subject" : "Add New Subject"}
        </DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="name"
                  name="name"
                  label="Subject Name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                  disabled={submitting}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="duration"
                  name="duration"
                  label="Duration"
                  placeholder="e.g. 6 months, 1 year"
                  value={formik.values.duration}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.duration && Boolean(formik.errors.duration)
                  }
                  helperText={formik.touched.duration && formik.errors.duration}
                  disabled={submitting}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl
                  fullWidth
                  error={formik.touched.status && Boolean(formik.errors.status)}
                  margin="normal"
                >
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    id="status"
                    name="status"
                    value={formik.values.status}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    label="Status"
                    disabled={submitting}
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                  {formik.touched.status && formik.errors.status && (
                    <FormHelperText>{formik.errors.status}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="description"
                  name="description"
                  label="Description"
                  multiline
                  rows={4}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.description &&
                    Boolean(formik.errors.description)
                  }
                  helperText={
                    formik.touched.description && formik.errors.description
                  }
                  disabled={submitting}
                  margin="normal"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
            <Button
              onClick={handleClose}
              variant="outlined"
              disabled={submitting}
              sx={{ mr: 1 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              startIcon={
                submitting && <CircularProgress size={20} color="inherit" />
              }
            >
              {editingSubject ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Subjects;
