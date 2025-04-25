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
  Tooltip,
  Divider,
  FormLabel,
  FormControlLabel,
  Radio,
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
  AccessTime as AccessTimeIcon,
  Description as DescriptionIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  ErrorOutline as ErrorOutlineIcon,
} from "@mui/icons-material";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  fetchSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  resetStatus,
} from "../../store/slices/subjectSlice";
import RefreshButton from "../../components/common/RefreshButton";
import { alpha } from "@mui/material/styles";
import { Formik, Field } from "formik";

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

  // Confirm Delete state
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [subjectIdToDelete, setSubjectIdToDelete] = useState(null);

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

  const handleCancel = () => {
    handleClose();
  };

  const handleDelete = (id) => {
    setSubjectIdToDelete(id);
    setConfirmDelete(true);
  };

  const handleConfirmDelete = () => {
    setDeleting(true);
    dispatch(deleteSubject(subjectIdToDelete))
      .unwrap()
      .finally(() => {
        setDeleting(false);
        setConfirmDelete(false);
        setSubjectIdToDelete(null);
      });
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
      {/* Enhanced Header with gradient background */}
      <Paper
        elevation={2}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: { xs: 2, sm: 3 },
          borderRadius: 2,
          background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: { xs: 2, sm: 0 },
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
              fontWeight: 600,
              color: "white",
            }}
          >
            Subjects
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={() => handleOpen()}
              sx={{
                borderRadius: 1.5,
                boxShadow: 2,
                "&:hover": {
                  boxShadow: 4,
                },
              }}
              size={isMobile ? "small" : "medium"}
            >
              Add Subject
            </Button>
            <RefreshButton
              onRefresh={loadAllData}
              tooltip="Refresh subjects data"
              color="secondary"
            />
          </Box>
        </Box>
      </Paper>

      {/* Enhanced Stats Cards */}
      <Grid container spacing={isMobile ? 1.5 : 3} mb={isMobile ? 3 : 4}>
        <Grid item xs={6} md={3}>
          <Card
            elevation={2}
            sx={{
              borderRadius: 2,
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 6,
              },
            }}
          >
            <CardContent sx={{ p: isMobile ? 2 : 3 }}>
              <Typography
                color="textSecondary"
                gutterBottom
                variant={isMobile ? "body2" : "body1"}
                sx={{ fontWeight: 500 }}
              >
                Total Subjects
              </Typography>
              <Typography
                variant={isMobile ? "h5" : "h4"}
                sx={{ fontWeight: 600 }}
              >
                {subjects?.length || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card
            elevation={2}
            sx={{
              borderRadius: 2,
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 6,
              },
            }}
          >
            <CardContent sx={{ p: isMobile ? 2 : 3 }}>
              <Typography
                color="textSecondary"
                gutterBottom
                variant={isMobile ? "body2" : "body1"}
                sx={{ fontWeight: 500 }}
              >
                Active Subjects
              </Typography>
              <Typography
                variant={isMobile ? "h5" : "h4"}
                color="success.main"
                sx={{ fontWeight: 600 }}
              >
                {subjects?.filter((subject) => subject.status === "active")
                  .length || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card
            elevation={2}
            sx={{
              borderRadius: 2,
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 6,
              },
            }}
          >
            <CardContent sx={{ p: isMobile ? 2 : 3 }}>
              <Typography
                color="textSecondary"
                gutterBottom
                variant={isMobile ? "body2" : "body1"}
                sx={{ fontWeight: 500 }}
              >
                Inactive Subjects
              </Typography>
              <Typography
                variant={isMobile ? "h5" : "h4"}
                color="text.secondary"
                sx={{ fontWeight: 600 }}
              >
                {subjects?.filter((subject) => subject.status === "inactive")
                  .length || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card
            elevation={2}
            sx={{
              borderRadius: 2,
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 6,
              },
            }}
          >
            <CardContent sx={{ p: isMobile ? 2 : 3 }}>
              <Typography
                color="textSecondary"
                gutterBottom
                variant={isMobile ? "body2" : "body1"}
                sx={{ fontWeight: 500 }}
              >
                Search Results
              </Typography>
              <Typography
                variant={isMobile ? "h5" : "h4"}
                color="primary.main"
                sx={{ fontWeight: 600 }}
              >
                {filteredSubjects?.length || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Enhanced Filter Accordion */}
      <Accordion
        expanded={filterExpanded}
        onChange={() => setFilterExpanded(!filterExpanded)}
        sx={{
          mb: 2,
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: filterExpanded ? 3 : 1,
          "&:before": {
            display: "none",
          },
          transition: "all 0.3s ease",
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            backgroundColor: alpha(theme.palette.primary.light, 0.05),
            "&:hover": {
              backgroundColor: alpha(theme.palette.primary.light, 0.1),
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FilterIcon color="primary" />
            <Typography fontWeight={500}>Filters</Typography>
            {(nameFilter || statusFilter) && (
              <Chip
                label={`${[nameFilter ? 1 : 0, statusFilter ? 1 : 0].reduce(
                  (a, b) => a + b,
                  0
                )} active`}
                size="small"
                color="primary"
                sx={{ fontWeight: 500 }}
              />
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ p: { xs: 2, sm: 3 }, pt: 2 }}>
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
                      <SearchIcon color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: nameFilter && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setNameFilter("")}
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                          "&:hover": {
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                          },
                        }}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 1 },
                }}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Filter by Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                InputProps={{
                  sx: { borderRadius: 1 },
                }}
                variant="outlined"
                size="small"
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
                  sx={{
                    borderRadius: 1.5,
                    color: theme.palette.primary.main,
                  }}
                  size="small"
                >
                  Clear Filters
                </Button>
              </Box>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Results count - enhanced styling */}
      <Box
        sx={{
          mb: 2,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: { xs: 1, sm: 0 },
          p: 1.5,
          backgroundColor: alpha(theme.palette.primary.light, 0.05),
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        }}
      >
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          Showing {filteredSubjects.length} of {subjects.length} subjects
        </Typography>
        {filteredSubjects.length === 0 && subjects.length > 0 && (
          <Alert
            severity="info"
            sx={{ py: 0, width: { xs: "100%", sm: "auto" }, borderRadius: 1 }}
          >
            No subjects match your filter criteria
          </Alert>
        )}
      </Box>

      {isMobile ? (
        // Enhanced Mobile card view
        <Stack spacing={2}>
          {filteredSubjects && filteredSubjects.length > 0 ? (
            filteredSubjects.map((subject, index) => (
              <Card
                key={subject._id || `subject-${index}`}
                sx={{
                  width: "100%",
                  borderRadius: 2,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: 3,
                  },
                  overflow: "hidden",
                }}
                elevation={2}
              >
                <Box
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    py: 1,
                    px: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <BookIcon sx={{ color: "white", mr: 1, fontSize: 18 }} />
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      color="white"
                    >
                      {subject.name || "Unnamed Subject"}
                    </Typography>
                  </Box>
                  <Chip
                    label={subject.status || "Unknown"}
                    size="small"
                    color={subject.status === "active" ? "success" : "default"}
                    sx={{
                      fontWeight: 500,
                      height: 24,
                    }}
                  />
                </Box>

                <CardContent sx={{ p: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 1.5,
                      pb: 1.5,
                      borderBottom: `1px solid ${alpha(
                        theme.palette.divider,
                        0.1
                      )}`,
                    }}
                  >
                    <AccessTimeIcon
                      color="primary"
                      fontSize="small"
                      sx={{ mr: 1 }}
                    />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontWeight: 500, mr: 1 }}
                    >
                      Duration:
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {subject.duration || "Not specified"}
                    </Typography>
                  </Box>

                  {subject.description && (
                    <Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                        }}
                      >
                        <DescriptionIcon
                          color="primary"
                          fontSize="small"
                          sx={{ mr: 1, mt: 0.3 }}
                        />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontWeight: 500, mb: 0.5 }}
                        >
                          Description:
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          pl: 3.5,
                          color: alpha(theme.palette.text.primary, 0.85),
                        }}
                      >
                        {subject.description}
                      </Typography>
                    </Box>
                  )}
                </CardContent>

                <CardActions
                  sx={{
                    px: 2,
                    pb: 2,
                    pt: 0,
                    borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    justifyContent: "flex-end",
                  }}
                >
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => handleOpen(subject)}
                    color="primary"
                    disabled={!subject._id}
                    sx={{
                      mr: 1,
                      borderRadius: 1.5,
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDelete(subject._id)}
                    color="error"
                    disabled={!subject._id}
                    sx={{ borderRadius: 1.5 }}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            ))
          ) : subjects.length > 0 ? (
            <Box
              sx={{
                p: 3,
                textAlign: "center",
                backgroundColor: alpha(theme.palette.primary.light, 0.05),
                borderRadius: 2,
                border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
                mb: 3,
              }}
            >
              <Typography
                variant="body1"
                color="text.secondary"
                fontWeight={500}
              >
                No subjects match your filter criteria
              </Typography>
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={clearFilters}
                sx={{ mt: 2, borderRadius: 1.5 }}
              >
                Clear Filters
              </Button>
            </Box>
          ) : (
            <Box
              sx={{
                p: 3,
                textAlign: "center",
                backgroundColor: alpha(theme.palette.primary.light, 0.05),
                borderRadius: 2,
                border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
                mb: 3,
              }}
            >
              <Typography
                variant="body1"
                color="text.secondary"
                fontWeight={500}
              >
                No subjects found
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                sx={{ mt: 2, borderRadius: 1.5 }}
                onClick={() => handleOpen()}
              >
                Add Subject
              </Button>
            </Box>
          )}
        </Stack>
      ) : (
        // Enhanced Desktop Table View
        <Paper
          elevation={2}
          sx={{
            overflow: "hidden",
            borderRadius: 2,
            transition: "all 0.3s ease",
            mb: 2,
            "&:hover": {
              boxShadow: 4,
            },
          }}
        >
          <TableContainer sx={{ maxHeight: 650, minHeight: 200 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      backgroundColor: theme.palette.primary.main,
                      color: "white",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                    }}
                  >
                    Name
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: theme.palette.primary.main,
                      color: "white",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                    }}
                  >
                    Duration
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: theme.palette.primary.main,
                      color: "white",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                    }}
                  >
                    Status
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      backgroundColor: theme.palette.primary.main,
                      color: "white",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSubjects && filteredSubjects.length > 0 ? (
                  filteredSubjects.map((subject, index) => (
                    <TableRow
                      key={subject._id || `subject-${index}`}
                      sx={{
                        "&:hover": {
                          backgroundColor: alpha(
                            theme.palette.primary.light,
                            0.1
                          ),
                        },
                        ...(index % 2
                          ? {
                              bgcolor: alpha(theme.palette.primary.light, 0.03),
                            }
                          : {}),
                      }}
                    >
                      <TableCell sx={{ display: "flex", alignItems: "center" }}>
                        <BookIcon
                          color="primary"
                          sx={{ mr: 1, fontSize: 18 }}
                        />
                        <Tooltip
                          title={subject.description || "No description"}
                          arrow
                        >
                          <Typography fontWeight={500}>
                            {subject.name || "Unnamed Subject"}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell
                        sx={{ color: alpha(theme.palette.text.primary, 0.9) }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <AccessTimeIcon
                            color="primary"
                            fontSize="small"
                            sx={{ mr: 1 }}
                          />
                          {subject.duration || "Not specified"}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={subject.status || "Unknown"}
                          size="small"
                          color={
                            subject.status === "active" ? "success" : "default"
                          }
                          sx={{
                            fontWeight: 500,
                            height: 24,
                            minWidth: 80,
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box
                          sx={{ display: "flex", justifyContent: "flex-end" }}
                        >
                          <Tooltip title="Edit Subject" arrow>
                            <IconButton
                              onClick={() => handleOpen(subject)}
                              color="primary"
                              disabled={!subject._id}
                              sx={{
                                bgcolor: alpha(
                                  theme.palette.primary.main,
                                  0.05
                                ),
                                mr: 1,
                                "&:hover": {
                                  bgcolor: alpha(
                                    theme.palette.primary.main,
                                    0.1
                                  ),
                                },
                              }}
                              size="small"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Subject" arrow>
                            <IconButton
                              onClick={() => handleDelete(subject._id)}
                              color="error"
                              disabled={!subject._id}
                              sx={{
                                bgcolor: alpha(theme.palette.error.main, 0.05),
                                "&:hover": {
                                  bgcolor: alpha(theme.palette.error.main, 0.1),
                                },
                              }}
                              size="small"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : subjects.length > 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                      <Box
                        sx={{
                          p: 2,
                          textAlign: "center",
                          backgroundColor: alpha(
                            theme.palette.primary.light,
                            0.05
                          ),
                          borderRadius: 2,
                          border: `1px dashed ${alpha(
                            theme.palette.primary.main,
                            0.2
                          )}`,
                          my: 2,
                        }}
                      >
                        <Typography
                          variant="body1"
                          color="text.secondary"
                          fontWeight={500}
                        >
                          No subjects match your filter criteria
                        </Typography>
                        <Button
                          variant="outlined"
                          startIcon={<ClearIcon />}
                          onClick={clearFilters}
                          sx={{ mt: 2, borderRadius: 1.5 }}
                        >
                          Clear Filters
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                      <Box
                        sx={{
                          p: 3,
                          textAlign: "center",
                          backgroundColor: alpha(
                            theme.palette.primary.light,
                            0.05
                          ),
                          borderRadius: 2,
                          border: `1px dashed ${alpha(
                            theme.palette.primary.main,
                            0.2
                          )}`,
                          my: 2,
                        }}
                      >
                        <Typography
                          variant="body1"
                          color="text.secondary"
                          fontWeight={500}
                        >
                          No subjects found
                        </Typography>
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<AddIcon />}
                          sx={{ mt: 2, borderRadius: 1.5 }}
                          onClick={() => handleOpen()}
                        >
                          Add Subject
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Subject Dialog - Create/Edit */}
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: "hidden",
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column"
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: theme.palette.primary.main,
            color: "white",
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {editingSubject && editingSubject._id ? (
              <EditIcon sx={{ mr: 1 }} />
            ) : (
              <AddCircleOutlineIcon sx={{ mr: 1 }} />
            )}
            <Typography variant="h6" fontWeight={600}>
              {editingSubject && editingSubject._id
                ? "Edit Subject"
                : "Add New Subject"}
            </Typography>
          </Box>
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleClose}
            aria-label="close"
            sx={{ color: "white" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <form onSubmit={formik.handleSubmit} style={{ display: "flex", flexDirection: "column", flexGrow: 1, overflow: "hidden" }}>
          <DialogContent dividers sx={{ p: 3, overflowY: "auto", flexGrow: 1 }}>
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2 }}
                fontWeight={500}
              >
                Complete the form below. Fields marked with{" "}
                <Box component="span" sx={{ color: "error.main" }}>
                  *
                </Box>{" "}
                are required.
              </Typography>

              <Divider sx={{ mb: 3 }} />

              <Typography
                variant="subtitle1"
                fontWeight={600}
                color="primary"
                sx={{ mb: 2 }}
              >
                Basic Information
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="name"
                    label="Subject Name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                    required
                    variant="outlined"
                    InputProps={{ sx: { borderRadius: 1 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="duration"
                    label="Duration"
                    value={formik.values.duration}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.duration && Boolean(formik.errors.duration)
                    }
                    helperText={
                      formik.touched.duration && formik.errors.duration
                    }
                    placeholder="e.g., 6 months, 45 hours, etc."
                    variant="outlined"
                    InputProps={{ sx: { borderRadius: 1 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
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
                    placeholder="Enter a detailed description of the subject..."
                    variant="outlined"
                    InputProps={{ sx: { borderRadius: 1 } }}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography
                variant="subtitle1"
                fontWeight={600}
                color="primary"
                sx={{ mb: 2 }}
              >
                Status
              </Typography>

              <FormControl component="fieldset">
                <FormLabel
                  component="legend"
                  sx={{ mb: 1, fontSize: "0.875rem" }}
                >
                  Subject Status
                </FormLabel>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    bgcolor: alpha(theme.palette.background.paper, 0.8),
                    p: 1.5,
                    borderRadius: 1,
                    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                  }}
                >
                  <Radio
                    name="status"
                    value="active"
                    checked={formik.values.status === "active"}
                    onChange={formik.handleChange}
                    color="success"
                  />
                  <Typography variant="body2" sx={{ mr: 3, fontWeight: 500 }}>
                    Active
                  </Typography>

                  <Radio
                    name="status"
                    value="inactive"
                    checked={formik.values.status === "inactive"}
                    onChange={formik.handleChange}
                    color="default"
                  />
                  <Typography variant="body2" fontWeight={500}>
                    Inactive
                  </Typography>
                </Box>
                <FormHelperText
                  error={formik.touched.status && Boolean(formik.errors.status)}
                >
                  {formik.touched.status && formik.errors.status}
                </FormHelperText>
              </FormControl>
            </Box>
          </DialogContent>

          <DialogActions
            sx={{
              px: 3,
              py: 2,
              bgcolor: alpha(theme.palette.primary.light, 0.05),
              position: "sticky",
              bottom: 0,
              borderTop: "1px solid",
              borderColor: "divider"
            }}
          >
            <Button
              variant="outlined"
              onClick={handleClose}
              disabled={submitting}
              startIcon={<CancelIcon />}
              sx={{
                borderRadius: 1.5,
                mr: 1,
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              color="primary"
              variant="contained"
              disabled={submitting}
              startIcon={
                submitting ? (
                  <CircularProgress size={20} />
                ) : editingSubject && editingSubject._id ? (
                  <SaveIcon />
                ) : (
                  <AddIcon />
                )
              }
              sx={{ borderRadius: 1.5 }}
            >
              {submitting
                ? "Saving..."
                : editingSubject && editingSubject._id
                ? "Update Subject"
                : "Add Subject"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: 10,
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column"
          },
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle
          sx={{
            bgcolor: theme.palette.error.main,
            color: "white",
            p: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <WarningIcon sx={{ mr: 1 }} />
            <Typography variant="h6" fontWeight={600}>
              Confirm Delete
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 1, overflowY: "auto", flexGrow: 1 }}>
          <Box sx={{ textAlign: "center", py: 2 }}>
            <ErrorOutlineIcon
              color="error"
              sx={{ fontSize: 60, mb: 2, opacity: 0.8 }}
            />
            <Typography variant="subtitle1" fontWeight={500} gutterBottom>
              Are you sure you want to delete this subject?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              This action cannot be undone. All related data will be permanently
              removed.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            py: 2,
            bgcolor: alpha(theme.palette.background.paper, 0.9),
          }}
        >
          <Button
            variant="outlined"
            onClick={() => setConfirmDelete(false)}
            sx={{
              borderRadius: 1.5,
              mr: 1,
            }}
            startIcon={<CancelIcon />}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            disabled={deleting}
            startIcon={
              deleting ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <DeleteIcon />
              )
            }
            sx={{ borderRadius: 1.5 }}
          >
            {deleting ? "Deleting..." : "Delete Subject"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
    </Box>
  );
};

export default Subjects;
