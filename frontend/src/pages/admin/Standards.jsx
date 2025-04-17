import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MenuBook as MenuBookIcon,
  School as SchoolIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useFormik } from "formik";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import RefreshButton from "../../components/RefreshButton";
import { fetchSubjects } from "../../store/slices/subjectSlice";
import {
  createStandard,
  deleteStandard,
  fetchStandards,
  resetStatus,
  updateStandard,
} from "../../store/slices/standardSlice";

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
            Standards
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
              Add Standard
            </Button>
            <RefreshButton
              onRefresh={loadAllData}
              tooltip="Refresh standards data"
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
                Total Standards
              </Typography>
              <Typography
                variant={isMobile ? "h5" : "h4"}
                sx={{ fontWeight: 600 }}
              >
                {standardsArray.length}
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
                Active Standards
              </Typography>
              <Typography
                variant={isMobile ? "h5" : "h4"}
                color="success.main"
                sx={{ fontWeight: 600 }}
              >
                {standardsArray.filter((std) => std.isActive).length}
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
                Total Subjects
              </Typography>
              <Typography
                variant={isMobile ? "h5" : "h4"}
                color="primary.main"
                sx={{ fontWeight: 600 }}
              >
                {subjectsArray.length}
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
                Inactive Standards
              </Typography>
              <Typography
                variant={isMobile ? "h5" : "h4"}
                color="text.secondary"
                sx={{ fontWeight: 600 }}
              >
                {standardsArray.filter((std) => !std.isActive).length}
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

      {standardsArray.length === 0 && !loading ? (
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
          <Typography variant="body1" color="text.secondary" fontWeight={500}>
            No standards found
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            sx={{ mt: 2, borderRadius: 1.5 }}
            onClick={() => handleOpen()}
          >
            Add Standard
          </Button>
        </Box>
      ) : null}

      {isMobile ? (
        // Enhanced Mobile card view
        <Stack spacing={2}>
          {standardsArray.length > 0 ? (
            standardsArray.map((standard) => (
              <Card
                key={standard._id}
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
                onClick={() => handleViewStandard(standard)}
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
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    color="white"
                  >
                    {standard.name}
                  </Typography>
                  <Chip
                    label={standard.isActive ? "Active" : "Inactive"}
                    size="small"
                    color={standard.isActive ? "success" : "default"}
                    sx={{
                      fontWeight: 500,
                      height: 24,
                    }}
                  />
                </Box>

                <CardContent sx={{ pb: 1, pt: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mt: 1,
                      mb: 2,
                    }}
                  >
                    <SchoolIcon
                      fontSize="small"
                      color="primary"
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Class Level: {standard.level}
                    </Typography>
                  </Box>

                  {standard.description && (
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary", mb: 2 }}
                    >
                      {standard.description.length > 100
                        ? `${standard.description.substring(0, 100)}...`
                        : standard.description}
                    </Typography>
                  )}

                  {standard.subjects && standard.subjects.length > 0 && (
                    <Box>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ fontWeight: 600, mb: 1 }}
                      >
                        Subjects:
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 0.5,
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
                                icon={<MenuBookIcon />}
                              />
                            ) : null;
                          }
                        )}
                      </Box>
                    </Box>
                  )}
                </CardContent>
                <CardActions
                  sx={{
                    px: 2,
                    py: 1,
                    borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    justifyContent: "flex-end",
                  }}
                >
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewStandard(standard);
                    }}
                    startIcon={<VisibilityIcon />}
                    sx={{
                      borderRadius: 1.5,
                      textTransform: "none",
                    }}
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
        // Enhanced Desktop table view
        <TableContainer
          component={Paper}
          elevation={2}
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            mb: 4,
          }}
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
                  <TableRow
                    key={standard._id}
                    sx={{
                      "&:nth-of-type(odd)": {
                        backgroundColor: theme.palette.action.hover,
                      },
                      "&:hover": {
                        backgroundColor: alpha(
                          theme.palette.primary.light,
                          0.1
                        ),
                        cursor: "pointer",
                      },
                    }}
                    onClick={() => handleViewStandard(standard)}
                  >
                    <TableCell sx={{ fontWeight: 500 }}>
                      {standard.name}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <SchoolIcon
                          fontSize="small"
                          color="primary"
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="body2" fontWeight={500}>
                          {standard.level}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={standard.isActive ? "Active" : "Inactive"}
                        size="small"
                        color={standard.isActive ? "success" : "default"}
                        sx={{ fontWeight: 500 }}
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
                                  icon={<MenuBookIcon fontSize="small" />}
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
                        {standard.description}
                      </Typography>
                    </TableCell>
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
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewStandard(standard);
                            }}
                            sx={{
                              backgroundColor: alpha(
                                theme.palette.primary.main,
                                0.1
                              ),
                              "&:hover": {
                                backgroundColor: alpha(
                                  theme.palette.primary.main,
                                  0.2
                                ),
                              },
                            }}
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

      {/* Enhanced View Standard Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={handleCloseViewDialog}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 2,
            overflow: "hidden",
            height: isMobile ? "100%" : "auto",
            display: "flex",
            flexDirection: "column",
            maxHeight: isMobile ? "100%" : "90vh",
          },
        }}
      >
        {selectedStandard && (
          <>
            <DialogTitle
              sx={{
                p: 0,
                position: "relative",
              }}
            >
              <Box
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  color: "white",
                  p: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexShrink: 0,
                }}
              >
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    {selectedStandard.name}
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    sx={{ opacity: 0.9, mt: 0.5 }}
                  >
                    Class {selectedStandard.level}
                  </Typography>
                </Box>
                <Chip
                  label={selectedStandard.isActive ? "Active" : "Inactive"}
                  color={selectedStandard.isActive ? "success" : "default"}
                  size="small"
                  sx={{ fontWeight: 500 }}
                />
              </Box>
            </DialogTitle>

            <DialogContent
              dividers
              sx={{
                p: { xs: 2, sm: 3 },
                overflowY: "auto",
                flexGrow: 1,
              }}
            >
              <Box sx={{ py: 1 }}>
                {/* Standard Details Card */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    mb: 3,
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.primary.light, 0.05),
                    border: `1px solid ${alpha(
                      theme.palette.primary.main,
                      0.1
                    )}`,
                  }}
                >
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      fontSize: { xs: "1.1rem", sm: "1.25rem" },
                      fontWeight: 600,
                      color: theme.palette.primary.main,
                      pb: 1,
                      borderBottom: `1px solid ${alpha(
                        theme.palette.primary.main,
                        0.2
                      )}`,
                    }}
                  >
                    Standard Details
                  </Typography>

                  <Grid container spacing={3} sx={{ mt: 0.5 }}>
                    <Grid item xs={12} sm={6} md={4}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          pb: 1,
                          borderBottom: `1px solid ${alpha(
                            theme.palette.divider,
                            0.3
                          )}`,
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontWeight={500}
                        >
                          Name:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {selectedStandard.name || "N/A"}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          pb: 1,
                          borderBottom: `1px solid ${alpha(
                            theme.palette.divider,
                            0.3
                          )}`,
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontWeight={500}
                        >
                          Level:
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <SchoolIcon
                            fontSize="small"
                            color="primary"
                            sx={{ mr: 0.5 }}
                          />
                          <Typography variant="body2" fontWeight="medium">
                            Class {selectedStandard.level}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          pb: 1,
                          borderBottom: `1px solid ${alpha(
                            theme.palette.divider,
                            0.3
                          )}`,
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontWeight={500}
                        >
                          Status:
                        </Typography>
                        <Chip
                          label={
                            selectedStandard.isActive ? "Active" : "Inactive"
                          }
                          color={
                            selectedStandard.isActive ? "success" : "default"
                          }
                          size="small"
                          sx={{ fontWeight: 500 }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontWeight={500}
                        gutterBottom
                      >
                        Description:
                      </Typography>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          mt: 1,
                          backgroundColor: "background.default",
                          borderRadius: 1,
                        }}
                      >
                        <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                          {selectedStandard.description ||
                            "No description available"}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Paper>

                {/* Subjects Section Card */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                  }}
                >
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      fontSize: { xs: "1.1rem", sm: "1.25rem" },
                      fontWeight: 600,
                      color: theme.palette.primary.main,
                      pb: 1,
                      borderBottom: `1px solid ${alpha(
                        theme.palette.primary.main,
                        0.2
                      )}`,
                    }}
                  >
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
                          mt: 1.5,
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
                                sx={{ fontWeight: 500 }}
                              />
                            );
                          }
                        )}
                      </Box>

                      <TableContainer
                        component={Paper}
                        variant="outlined"
                        sx={{
                          borderRadius: 1,
                          overflow: "hidden",
                        }}
                      >
                        <Table size="small">
                          <TableHead>
                            <TableRow
                              sx={{
                                backgroundColor: alpha(
                                  theme.palette.primary.main,
                                  0.08
                                ),
                              }}
                            >
                              <TableCell sx={{ fontWeight: 600 }}>
                                Subject Name
                              </TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>
                                Duration
                              </TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>
                                Status
                              </TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>
                                Description
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {getSubjectIdsFromStandard(selectedStandard).map(
                              (subjectId) => {
                                const subject = findSubjectById(subjectId);
                                if (!subject) return null;

                                return (
                                  <TableRow
                                    key={subject._id}
                                    hover
                                    sx={{
                                      "&:nth-of-type(odd)": {
                                        backgroundColor: alpha(
                                          theme.palette.action.hover,
                                          0.5
                                        ),
                                      },
                                    }}
                                  >
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
                                          fontWeight={500}
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
                                        sx={{ fontWeight: 500 }}
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
                </Paper>
              </Box>
            </DialogContent>

            <DialogActions
              sx={{
                px: { xs: 2, sm: 3 },
                py: 2,
                position: isMobile ? "sticky" : "relative",
                bottom: 0,
                backgroundColor: "background.paper",
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                zIndex: 1,
                mt: "auto",
                flexShrink: 0,
                gap: 1,
              }}
            >
              <Button
                onClick={() => handleCloseViewDialog()}
                variant="outlined"
                sx={{ borderRadius: 1.5 }}
              >
                Close
              </Button>
              <Button
                color="primary"
                variant="contained"
                onClick={() => {
                  handleCloseViewDialog();
                  handleOpen(selectedStandard);
                }}
                startIcon={<EditIcon />}
                sx={{ borderRadius: 1.5 }}
              >
                Edit
              </Button>
              <Button
                color="error"
                variant="outlined"
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
                sx={{ borderRadius: 1.5 }}
              >
                Delete
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Enhanced Create/Edit Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        fullScreen={isMobile}
        keepMounted={false}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 2,
            overflow: "hidden",
            height: isMobile ? "100%" : "auto",
            display: "flex",
            flexDirection: "column",
            maxHeight: isMobile ? "100%" : "90vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            p: 0,
          }}
        >
          <Box
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: "white",
              p: 2,
              flexShrink: 0,
            }}
          >
            <Typography
              variant="h6"
              fontWeight={600}
              sx={{
                fontSize: { xs: "1.1rem", sm: "1.25rem" },
              }}
            >
              {editingStandard
                ? `Edit Standard: ${editingStandard.name}`
                : "Add New Standard"}
            </Typography>
          </Box>
        </DialogTitle>

        <form
          onSubmit={formik.handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            height: isMobile ? "100%" : "auto",
            overflow: "hidden",
            flexGrow: 1,
          }}
        >
          <DialogContent
            dividers
            sx={{
              p: { xs: 2, sm: 3 },
              overflowY: "auto",
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Fill in the details below to{" "}
                {editingStandard ? "update" : "create"} a standard. Fields
                marked with * are required.
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography
                  variant="subtitle1"
                  color="primary"
                  fontWeight={600}
                  gutterBottom
                >
                  Basic Information
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="name"
                  label="Standard Name *"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                  InputProps={{
                    sx: { borderRadius: 1 },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="level"
                  label="Level (1-12) *"
                  type="number"
                  inputProps={{ min: 1, max: 12 }}
                  value={formik.values.level}
                  onChange={formik.handleChange}
                  error={formik.touched.level && Boolean(formik.errors.level)}
                  helperText={formik.touched.level && formik.errors.level}
                  InputProps={{
                    sx: { borderRadius: 1 },
                    startAdornment: (
                      <InputAdornment position="start">
                        <SchoolIcon fontSize="small" color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="description"
                  label="Description *"
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
                  InputProps={{
                    sx: { borderRadius: 1 },
                  }}
                />
              </Grid>

              <Grid item xs={12} sx={{ mt: 1 }}>
                <Typography
                  variant="subtitle1"
                  color="primary"
                  fontWeight={600}
                  gutterBottom
                >
                  Associated Subjects
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth sx={{ mb: 1 }}>
                  <InputLabel id="subjects-label">Subjects</InputLabel>
                  <Select
                    labelId="subjects-label"
                    multiple
                    name="subjects"
                    value={formik.values.subjects}
                    onChange={formik.handleChange}
                    sx={{ borderRadius: 1 }}
                    startAdornment={
                      formik.values.subjects.length > 0 ? (
                        <InputAdornment position="start">
                          <MenuBookIcon fontSize="small" color="primary" />
                        </InputAdornment>
                      ) : null
                    }
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selected.map((value) => {
                          const subject = findSubjectById(value);
                          return (
                            <Chip
                              key={value}
                              label={subject ? subject.name : value}
                              size="small"
                              color="primary"
                              sx={{ fontWeight: 500 }}
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
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontSize="0.75rem"
                >
                  Select the subjects associated with this standard
                </Typography>
              </Grid>

              <Grid item xs={12} sx={{ mt: 1 }}>
                <Typography
                  variant="subtitle1"
                  color="primary"
                  fontWeight={600}
                  gutterBottom
                >
                  Status
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    backgroundColor: alpha(theme.palette.primary.light, 0.03),
                  }}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        name="isActive"
                        checked={formik.values.isActive}
                        onChange={formik.handleChange}
                        color="success"
                      />
                    }
                    label={
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography sx={{ mr: 1 }}>
                          {formik.values.isActive ? "Active" : "Inactive"}
                        </Typography>
                        <Chip
                          label={formik.values.isActive ? "Active" : "Inactive"}
                          size="small"
                          color={formik.values.isActive ? "success" : "default"}
                          sx={{ fontWeight: 500 }}
                        />
                      </Box>
                    }
                  />
                </Paper>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions
            sx={{
              px: { xs: 2, sm: 3 },
              py: 2,
              position: isMobile ? "sticky" : "relative",
              bottom: 0,
              backgroundColor: "background.paper",
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              zIndex: 1,
              mt: "auto",
              flexShrink: 0,
              gap: 1,
            }}
          >
            <Button
              onClick={handleClose}
              variant="outlined"
              sx={{ borderRadius: 1.5 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={formik.isSubmitting}
              sx={{ borderRadius: 1.5, px: 3 }}
            >
              {formik.isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : editingStandard ? (
                "Update Standard"
              ) : (
                "Create Standard"
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Standards;
