import React, { useEffect, useState, useCallback, useRef } from "react";
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
  Card,
  CardContent,
  CardActions,
  useMediaQuery,
  useTheme,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  FormControlLabel,
  Switch,
  Divider,
  Tooltip,
  InputAdornment,
  Avatar,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  School as SchoolIcon,
  MenuBook as MenuBookIcon,
  Class as ClassIcon,
  Info as InfoIcon,
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
import RefreshButton from "../components/RefreshButton";

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  level: Yup.number()
    .required("Level is required")
    .min(1, "Level must be at least 1")
    .max(12, "Level must not exceed 12")
    .integer("Level must be a whole number"),
  description: Yup.string().required("Description is required"),
  isActive: Yup.boolean().default(true),
});

const Standards = () => {
  const dispatch = useDispatch();
  const { standards, loading, error, success } = useSelector(
    (state) => state.standards
  );
  const { subjects } = useSelector((state) => state.subjects);
  const [open, setOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedStandard, setSelectedStandard] = useState(null);
  const [editingStandard, setEditingStandard] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const formikRef = useRef(null);

  // Initialize formik with useFormik
  const formik = useFormik({
    initialValues: {
      name: "",
      level: "",
      description: "",
      isActive: true,
      subjects: [],
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      // console.log("Form submitted with values:", values);

      // Convert level to number if it's a string
      const formattedValues = {
        ...values,
        level: Number(values.level),
      };

      // console.log("Formatted values for submission:", formattedValues);

      if (editingStandard) {
        // console.log("Updating standard with ID:", editingStandard._id);
        dispatch(
          updateStandard({ id: editingStandard._id, data: formattedValues })
        );
      } else {
        // console.log("Creating new standard");
        dispatch(createStandard(formattedValues));
      }
    },
  });

  // Store formik reference
  formikRef.current = formik;

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

  // useEffect(() => {
  //   console.log("Dialog open state:", open);
  // }, [open]);

  // useEffect(() => {
  //   console.log("Current editing standard:", editingStandard);
  // }, [editingStandard]);

  // useEffect(() => {
  //   if (formikRef.current && open) {
  //     console.log("Dialog state:", {
  //       open,
  //       editingStandard: editingStandard ? editingStandard._id : null,
  //       formik: {
  //         values: formikRef.current.values,
  //         isSubmitting: formikRef.current.isSubmitting,
  //         errors: formikRef.current.errors,
  //       },
  //     });
  //   }
  // }, [open, editingStandard, formik.values, formik.isSubmitting]);

  // useEffect(() => {
  //   console.log("Standards data:", standards);
  //   console.log("Subjects data:", subjects);
  // }, [standards, subjects]);

  // Safe accessor for standards data
  const getStandardsArray = () => {
    if (!standards) return [];
    if (Array.isArray(standards)) return standards;
    if (standards.data && Array.isArray(standards.data)) return standards.data;
    return [];
  };

  // Safe accessor for subjects data
  const getSubjectsArray = () => {
    if (!subjects) return [];
    if (Array.isArray(subjects)) return subjects;
    if (subjects.data && Array.isArray(subjects.data)) return subjects.data;
    return [];
  };

  // Utility function to match a subject by ID regardless of format
  const findSubjectById = (subjectId) => {
    const subjectsArray = getSubjectsArray();
    if (!subjectId) return null;

    // Convert string ID to string for comparison
    const idToFind =
      typeof subjectId === "object" ? subjectId._id : String(subjectId);

    return subjectsArray.find((subject) => {
      if (!subject || !subject._id) return false;
      const subjectIdString = String(subject._id);
      return subjectIdString === idToFind;
    });
  };

  // Utility function to extract subject IDs from a standard
  const getSubjectIdsFromStandard = (standard) => {
    if (!standard || !standard.subjects) return [];

    // If subjects is an array of objects with _id property
    if (Array.isArray(standard.subjects) && standard.subjects.length > 0) {
      if (
        typeof standard.subjects[0] === "object" &&
        standard.subjects[0]._id
      ) {
        return standard.subjects.map((sub) => sub._id);
      }
      // If subjects is an array of ID strings or any other format
      return standard.subjects;
    }

    // If subjects is a string
    if (typeof standard.subjects === "string") {
      return [standard.subjects];
    }

    return [];
  };

  const handleOpen = useCallback((standard = null) => {
    // console.log("handleOpen called with standard:", standard);

    if (standard) {
      setEditingStandard(standard);

      // Extract subject IDs correctly using the utility function
      const subjectIds = getSubjectIdsFromStandard(standard);

      const formValues = {
        name: standard.name || "",
        level:
          typeof standard.level === "number" ? standard.level.toString() : "",
        description: standard.description || "",
        isActive: standard.isActive === false ? false : true,
        subjects: subjectIds,
      };

      // console.log("Setting form values:", formValues);
      formikRef.current.setValues(formValues);
    } else {
      setEditingStandard(null);
      formikRef.current.resetForm();
    }

    // Ensure dialog opens with a slight delay to allow state to update
    setTimeout(() => {
      setOpen(true);
      // console.log("Dialog should be open now");
    }, 50);
  }, []);

  const handleClose = () => {
    // console.log("Closing dialog");
    setOpen(false);

    // Clear form and editing state after a slight delay
    setTimeout(() => {
      setEditingStandard(null);
      formikRef.current.resetForm();
    }, 100);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this standard?")) {
      dispatch(deleteStandard(id));
    }
  };

  // Add loadAllData function for refresh button
  const loadAllData = useCallback(() => {
    dispatch(fetchStandards());
    dispatch(fetchSubjects());
  }, [dispatch]);

  const handleViewStandard = (standard) => {
    setSelectedStandard(standard);
    setViewDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedStandard(null);
  };

  // Format date helper function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? "Invalid Date"
      : date.toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
  };

  // Handle loading state correctly
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

  const standardsArray = getStandardsArray();
  const subjectsArray = getSubjectsArray();

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
            Standards
          </Typography>
          <RefreshButton
            onRefresh={loadAllData}
            tooltip="Refresh standards data"
            sx={{ ml: 1 }}
          />
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          sx={{ alignSelf: { xs: "flex-start", sm: "auto" } }}
        >
          Add Standard
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {standardsArray.length === 0 && !loading ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          No standards found. Create your first standard by clicking the "Add
          Standard" button.
        </Alert>
      ) : null}

      {isMobile ? (
        // Mobile card view
        <Stack spacing={2}>
          {standardsArray.length > 0 ? (
            standardsArray.map((standard) => (
              <Card
                key={standard._id}
                sx={{ width: "100%", borderRadius: 2 }}
                elevation={2}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Typography variant="h6" component="div">
                      {standard.name}
                    </Typography>
                    <Chip
                      label={standard.isActive ? "Active" : "Inactive"}
                      size="small"
                      color={standard.isActive ? "success" : "default"}
                    />
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                    <SchoolIcon
                      fontSize="small"
                      color="primary"
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Level: {standard.level}
                    </Typography>
                  </Box>

                  {standard.description && (
                    <Typography
                      variant="body2"
                      sx={{ mt: 1, color: "text.secondary" }}
                    >
                      {standard.description.length > 100
                        ? `${standard.description.substring(0, 100)}...`
                        : standard.description}
                    </Typography>
                  )}

                  {standard.subjects && standard.subjects.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Subjects:
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 0.5,
                          mt: 0.5,
                        }}
                      >
                        {getSubjectIdsFromStandard(standard).map(
                          (subjectId) => {
                            const subject = findSubjectById(subjectId);
                            return subject ? (
                              <Chip
                                key={subject._id}
                                label={subject.name}
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ mb: 0.5 }}
                              />
                            ) : null;
                          }
                        )}
                      </Box>
                    </Box>
                  )}
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={() => handleViewStandard(standard)}
                    color="primary"
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            ))
          ) : (
            <Typography align="center" sx={{ py: 3 }}>
              No standards found
            </Typography>
          )}
        </Stack>
      ) : (
        // Desktop table view
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
                  Level
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Status
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Subjects
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Description
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ color: "white", fontWeight: "bold" }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {standardsArray.length > 0 ? (
                standardsArray.map((standard) => (
                  <TableRow key={standard._id}>
                    <TableCell>{standard.name}</TableCell>
                    <TableCell>{standard.level}</TableCell>
                    <TableCell>
                      <Chip
                        label={standard.isActive ? "Active" : "Inactive"}
                        size="small"
                        color={standard.isActive ? "success" : "default"}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {standard.subjects && standard.subjects.length > 0 ? (
                          getSubjectIdsFromStandard(standard).map(
                            (subjectId) => {
                              const subject = findSubjectById(subjectId);
                              return subject ? (
                                <Chip
                                  key={subject._id}
                                  label={subject.name}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                  sx={{ mr: 0.5, mb: 0.5 }}
                                />
                              ) : null;
                            }
                          )
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            No subjects
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{standard.description}</TableCell>
                    <TableCell align="right">
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          justifyContent: "flex-end",
                        }}
                      >
                        <Tooltip title="View details">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleViewStandard(standard)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No standards found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* View Standard Dialog - Redesigned to match Students view */}
      <Dialog
        open={viewDialogOpen}
        onClose={handleCloseViewDialog}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 2,
            m: isMobile ? 0 : 2,
          },
        }}
      >
        {selectedStandard && (
          <>
            <DialogTitle
              sx={{
                pb: 1,
                borderBottom: 1,
                borderColor: "divider",
                bgcolor: "primary.main",
                color: "white",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography variant="h6" component="div">
                    {selectedStandard.name}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                    Class {selectedStandard.level}
                  </Typography>
                </Box>
                <Chip
                  label={selectedStandard.isActive ? "Active" : "Inactive"}
                  color={selectedStandard.isActive ? "success" : "default"}
                  size="small"
                  sx={{ color: "white", borderColor: "white" }}
                  variant={selectedStandard.isActive ? "filled" : "outlined"}
                />
              </Box>
            </DialogTitle>

            <DialogContent
              sx={{
                p: { xs: 2, sm: 3 },
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Box sx={{ py: 1 }}>
                {/* Standard Details */}
                <Box>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Standard Details
                  </Typography>
                  <Grid container spacing={{ xs: 2, sm: 2 }}>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Name
                      </Typography>
                      <Typography variant="body1">
                        {selectedStandard.name || "N/A"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Level
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <SchoolIcon
                          fontSize="small"
                          color="primary"
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="body1">
                          Class {selectedStandard.level}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Status
                      </Typography>
                      <Chip
                        label={
                          selectedStandard.isActive ? "Active" : "Inactive"
                        }
                        color={
                          selectedStandard.isActive ? "success" : "default"
                        }
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Description
                      </Typography>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          mt: 1,
                          backgroundColor: "background.default",
                        }}
                      >
                        <Typography variant="body2">
                          {selectedStandard.description ||
                            "No description available"}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Subjects Section */}
                <Box>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Associated Subjects
                  </Typography>
                  {selectedStandard.subjects &&
                  selectedStandard.subjects.length > 0 ? (
                    <>
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 1,
                          mb: 2,
                        }}
                      >
                        {getSubjectIdsFromStandard(selectedStandard).map(
                          (subjectId) => {
                            const subject = findSubjectById(subjectId);
                            if (!subject) return null;

                            return (
                              <Chip
                                key={subject._id}
                                label={subject.name || "Unnamed Subject"}
                                icon={<MenuBookIcon />}
                                color="primary"
                                variant="outlined"
                                sx={{ mb: 0.5 }}
                              />
                            );
                          }
                        )}
                      </Box>

                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow
                              sx={{ backgroundColor: theme.palette.grey[100] }}
                            >
                              <TableCell>Subject Name</TableCell>
                              <TableCell>Duration</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Description</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {getSubjectIdsFromStandard(selectedStandard).map(
                              (subjectId) => {
                                const subject = findSubjectById(subjectId);
                                if (!subject) return null;

                                return (
                                  <TableRow key={subject._id} hover>
                                    <TableCell>
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                        }}
                                      >
                                        <MenuBookIcon
                                          fontSize="small"
                                          color="primary"
                                          sx={{ mr: 1 }}
                                        />
                                        <Typography
                                          variant="body2"
                                          fontWeight="medium"
                                        >
                                          {subject.name || "Unnamed Subject"}
                                        </Typography>
                                      </Box>
                                    </TableCell>
                                    <TableCell>
                                      {subject.duration || "N/A"}
                                    </TableCell>
                                    <TableCell>
                                      <Chip
                                        label={subject.status || "unknown"}
                                        size="small"
                                        color={
                                          subject.status === "active"
                                            ? "success"
                                            : "default"
                                        }
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          maxWidth: 250,
                                          whiteSpace: "nowrap",
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                        }}
                                      >
                                        {subject.description ||
                                          "No description"}
                                      </Typography>
                                    </TableCell>
                                  </TableRow>
                                );
                              }
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </>
                  ) : (
                    <Alert severity="info" sx={{ mt: 1 }}>
                      No subjects associated with this standard
                    </Alert>
                  )}
                </Box>
              </Box>
            </DialogContent>

            <DialogActions
              sx={{
                px: 3,
                pb: 2,
                pt: 2,
                flexWrap: "wrap",
                gap: 1,
                borderTop: 1,
                borderColor: "divider",
              }}
            >
              <Button
                onClick={() => handleCloseViewDialog()}
                color="inherit"
                variant="text"
              >
                Close
              </Button>
              <Button
                color="primary"
                variant="outlined"
                onClick={() => {
                  handleCloseViewDialog();
                  handleOpen(selectedStandard);
                }}
                startIcon={<EditIcon />}
              >
                Edit
              </Button>
              <Button
                color="error"
                variant="contained"
                onClick={() => {
                  if (
                    window.confirm(
                      "Are you sure you want to delete this standard?"
                    )
                  ) {
                    handleCloseViewDialog();
                    handleDelete(selectedStandard._id);
                  }
                }}
                startIcon={<DeleteIcon />}
              >
                Delete
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        fullScreen={isMobile}
        keepMounted={false}
      >
        <DialogTitle>
          {editingStandard
            ? `Edit Standard: ${editingStandard.name}`
            : "Add New Standard"}
        </DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin="dense"
                  name="name"
                  label="Standard Name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin="dense"
                  name="level"
                  label="Level (1-12)"
                  type="number"
                  inputProps={{ min: 1, max: 12 }}
                  value={formik.values.level}
                  onChange={formik.handleChange}
                  error={formik.touched.level && Boolean(formik.errors.level)}
                  helperText={formik.touched.level && formik.errors.level}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  margin="dense"
                  name="description"
                  label="Description"
                  multiline
                  rows={3}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.description &&
                    Boolean(formik.errors.description)
                  }
                  helperText={
                    formik.touched.description && formik.errors.description
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth margin="dense">
                  <InputLabel id="subjects-label">Subjects</InputLabel>
                  <Select
                    labelId="subjects-label"
                    multiple
                    name="subjects"
                    value={formik.values.subjects}
                    onChange={formik.handleChange}
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selected.map((value) => {
                          const subject = findSubjectById(value);
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
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 224,
                        },
                      },
                    }}
                  >
                    {subjectsArray.map((subject) => (
                      <MenuItem key={subject._id} value={subject._id}>
                        {subject.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      name="isActive"
                      checked={formik.values.isActive}
                      onChange={formik.handleChange}
                    />
                  }
                  label="Active"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 2 } }}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? (
                <CircularProgress size={24} />
              ) : editingStandard ? (
                "Update"
              ) : (
                "Create"
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Standards;
