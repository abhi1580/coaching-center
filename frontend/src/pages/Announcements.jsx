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
  Chip,
  Grid,
  Divider,
  DialogContentText,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  CardActions,
  Stack,
  Hidden,
  CardHeader,
  Container,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  fetchAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  clearSuccess,
  formatDate,
  formatDateForInput,
  getStatusColor,
} from "../store/slices/announcementSlice";
import RefreshButton from "../components/RefreshButton";
import { alpha } from "@mui/material/styles";

const validationSchema = Yup.object({
  title: Yup.string().required("Title is required"),
  content: Yup.string().required("Content is required"),
  type: Yup.string()
    .oneOf(
      ["General", "Event", "Holiday", "Exam", "Emergency", "Other"],
      "Invalid type"
    )
    .required("Type is required"),
  priority: Yup.string()
    .oneOf(["High", "Medium", "Low"], "Invalid priority")
    .required("Priority is required"),
  targetAudience: Yup.string()
    .oneOf(
      ["All", "Students", "Teachers", "Parents"],
      "Invalid target audience"
    )
    .required("Target audience is required"),
  startDate: Yup.date().required("Start date is required"),
  endDate: Yup.date().required("End date is required"),
});

const Announcements = () => {
  const dispatch = useDispatch();
  const {
    data: announcements,
    counts,
    loading,
    error,
    success,
  } = useSelector((state) => state.announcements);
  const [open, setOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  const loadAllData = useCallback(() => {
    dispatch(fetchAnnouncements());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchAnnouncements());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      setOpen(false);
      setEditingAnnouncement(null);
      dispatch(clearSuccess());
      dispatch(fetchAnnouncements());
    }
  }, [success, dispatch]);

  const formik = useFormik({
    initialValues: {
      title: "",
      content: "",
      type: "",
      priority: "",
      targetAudience: "",
      startDate: "",
      endDate: "",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const announcementData = {
          title: values.title,
          content: values.content,
          type: values.type,
          priority: values.priority,
          targetAudience: values.targetAudience,
          startDate: values.startDate,
          endDate: values.endDate,
        };

        if (editingAnnouncement) {
          await dispatch(
            updateAnnouncement({
              id: editingAnnouncement._id,
              data: announcementData,
            })
          ).unwrap();
        } else {
          await dispatch(createAnnouncement(announcementData)).unwrap();
        }

        setOpen(false);
        formik.resetForm();
      } catch (error) {
        console.error("Error submitting form:", error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleOpen = (announcement = null) => {
    if (announcement) {
      setEditingAnnouncement(announcement);
      formik.setValues({
        title: announcement.title || "",
        content: announcement.content || "",
        type: announcement.type || "",
        priority: announcement.priority || "",
        targetAudience: announcement.targetAudience || "",
        startDate: announcement.startDate
          ? new Date(announcement.startDate).toISOString().split("T")[0]
          : "",
        endDate: announcement.endDate
          ? new Date(announcement.endDate).toISOString().split("T")[0]
          : "",
      });
    } else {
      setEditingAnnouncement(null);
      formik.resetForm();
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingAnnouncement(null);
    formik.resetForm();
  };

  const handleView = (announcement) => {
    setSelectedAnnouncement(announcement);
    setViewDialogOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteAnnouncement(id)).unwrap();
      setViewDialogOpen(false);
      setSelectedAnnouncement(null);
    } catch (error) {
      console.error("Error deleting announcement:", error);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await dispatch(deleteAnnouncement(selectedAnnouncement._id)).unwrap();
      setViewDialogOpen(false);
      setSelectedAnnouncement(null);
    } catch (error) {
      console.error("Error deleting announcement:", error);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "General":
        return "primary";
      case "Event":
        return "success";
      case "Holiday":
        return "warning";
      case "Exam":
        return "error";
      case "Emergency":
        return "error";
      case "Other":
        return "info";
      default:
        return "default";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "error";
      case "Medium":
        return "warning";
      case "Low":
        return "success";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={isMobile ? 2 : 3}>
        <Alert severity="error">
          {error.message || "Failed to load announcements"}
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={isMobile ? 2 : 3}>
      {/* Enhanced Header with shadow and better spacing */}
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
            sx={{
              fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
              fontWeight: 600,
              color: "white",
            }}
          >
            Announcements
          </Typography>
          <Box
            sx={{ display: "flex", width: { xs: "100%", sm: "auto" }, gap: 1 }}
          >
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={() => handleOpen()}
              sx={{
                mr: 1,
                flex: { xs: 1, sm: "none" },
                fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                borderRadius: 1.5,
                boxShadow: 2,
                "&:hover": {
                  boxShadow: 4,
                },
              }}
              size={isMobile ? "small" : "medium"}
            >
              {isMobile ? "Add" : "Add Announcement"}
            </Button>
            <RefreshButton
              onClick={loadAllData}
              size={isMobile ? "small" : "medium"}
              color="secondary"
            />
          </Box>
        </Box>
      </Paper>

      {/* Enhanced Stats Cards */}
      <Grid container spacing={isMobile ? 1.5 : 3} mb={isMobile ? 3 : 4}>
        <Grid item xs={6} sm={6} md={3}>
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
                Total Announcements
              </Typography>
              <Typography
                variant={isMobile ? "h5" : "h4"}
                sx={{ fontWeight: 600 }}
              >
                {counts?.total || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
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
                Active Announcements
              </Typography>
              <Typography
                variant={isMobile ? "h5" : "h4"}
                color="success.main"
                sx={{ fontWeight: 600 }}
              >
                {counts?.active || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
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
                Scheduled Announcements
              </Typography>
              <Typography
                variant={isMobile ? "h5" : "h4"}
                color="warning.main"
                sx={{ fontWeight: 600 }}
              >
                {counts?.scheduled || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
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
                Expired Announcements
              </Typography>
              <Typography
                variant={isMobile ? "h5" : "h4"}
                color="error.main"
                sx={{ fontWeight: 600 }}
              >
                {counts?.expired || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Enhanced Table for desktop */}
      <Hidden smDown>
        <TableContainer
          component={Paper}
          elevation={2}
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            mb: 4,
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>
                  Title
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>
                  Type
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>
                  Priority
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>
                  Target Audience
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>
                  Start Date
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>
                  End Date
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>
                  Status
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {announcements?.map((announcement) => (
                <TableRow
                  key={announcement._id}
                  sx={{
                    "&:nth-of-type(odd)": {
                      backgroundColor: theme.palette.action.hover,
                    },
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.primary.light, 0.1),
                      cursor: "pointer",
                    },
                  }}
                  onClick={() => handleView(announcement)}
                >
                  <TableCell sx={{ fontWeight: 500 }}>
                    {announcement.title.length > 30
                      ? `${announcement.title.substring(0, 30)}...`
                      : announcement.title}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={announcement.type}
                      color={getTypeColor(announcement.type)}
                      size="small"
                      sx={{ fontWeight: 500 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={announcement.priority}
                      color={getPriorityColor(announcement.priority)}
                      size="small"
                      sx={{ fontWeight: 500 }}
                    />
                  </TableCell>
                  <TableCell>{announcement.targetAudience}</TableCell>
                  <TableCell>{formatDate(announcement.startDate)}</TableCell>
                  <TableCell>{formatDate(announcement.endDate)}</TableCell>
                  <TableCell>
                    <Chip
                      label={announcement.status}
                      color={getStatusColor(announcement.status)}
                      size="small"
                      sx={{ fontWeight: 500 }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleView(announcement);
                      }}
                      color="primary"
                      title="View Details"
                      sx={{
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Hidden>

      {/* Enhanced Card layout for mobile */}
      <Hidden smUp>
        <Stack spacing={2}>
          {announcements?.map((announcement) => (
            <Card
              key={announcement._id}
              sx={{
                borderRadius: 2,
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: 3,
                },
                overflow: "hidden",
              }}
              elevation={2}
              onClick={() => handleView(announcement)}
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
                <Typography variant="subtitle1" fontWeight={600} color="white">
                  {announcement.title.length > 30
                    ? `${announcement.title.substring(0, 30)}...`
                    : announcement.title}
                </Typography>
                <Chip
                  label={announcement.status}
                  color={getStatusColor(announcement.status)}
                  size="small"
                  sx={{
                    fontWeight: 500,
                    height: 24,
                  }}
                />
              </Box>

              <CardContent sx={{ pb: 1, pt: 2 }}>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                  <Chip
                    label={announcement.type}
                    color={getTypeColor(announcement.type)}
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                  <Chip
                    label={announcement.priority}
                    color={getPriorityColor(announcement.priority)}
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                </Box>

                <Box sx={{ mt: 1.5 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontWeight: 600, minWidth: "70px" }}
                    >
                      Audience:
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {announcement.targetAudience}
                    </Typography>
                  </Box>

                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontWeight: 600 }}
                        >
                          Start:
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight={500}
                          sx={{ ml: 1 }}
                        >
                          {formatDate(announcement.startDate)}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontWeight: 600 }}
                        >
                          End:
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight={500}
                          sx={{ ml: 1 }}
                        >
                          {formatDate(announcement.endDate)}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
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
                    handleView(announcement);
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
          ))}

          {announcements?.length === 0 && (
            <Box
              sx={{
                p: 3,
                textAlign: "center",
                backgroundColor: alpha(theme.palette.primary.light, 0.05),
                borderRadius: 2,
                border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              <Typography
                variant="body1"
                color="text.secondary"
                fontWeight={500}
              >
                No announcements found
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                sx={{ mt: 2, borderRadius: 1.5 }}
                onClick={() => handleOpen()}
              >
                Add Announcement
              </Button>
            </Box>
          )}
        </Stack>
      </Hidden>

      {/* Enhanced Responsive View Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={fullScreen}
        PaperProps={{
          sx: {
            borderRadius: fullScreen ? 0 : 2,
            overflow: "hidden",
            height: fullScreen ? "100%" : "auto",
            display: "flex",
            flexDirection: "column",
            maxHeight: fullScreen ? "100%" : "90vh",
          },
        }}
      >
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
            <Typography
              variant="h6"
              sx={{
                fontSize: { xs: "1.1rem", sm: "1.25rem" },
                fontWeight: 600,
              }}
            >
              Announcement Details
            </Typography>
            <Box>
              <IconButton
                size="small"
                onClick={() => {
                  setViewDialogOpen(false);
                  handleOpen(selectedAnnouncement);
                }}
                sx={{
                  color: "white",
                  backgroundColor: alpha(theme.palette.common.white, 0.1),
                  mr: 1,
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.common.white, 0.2),
                  },
                }}
                title="Edit"
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={handleConfirmDelete}
                sx={{
                  color: "white",
                  backgroundColor: alpha(theme.palette.error.main, 0.6),
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.error.main, 0.8),
                  },
                }}
                title="Delete"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
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
          {selectedAnnouncement && (
            <Box>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  mb: 3,
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.primary.light, 0.05),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                }}
              >
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{
                    fontSize: { xs: "1.3rem", sm: "1.5rem" },
                    fontWeight: 600,
                    color: theme.palette.primary.main,
                  }}
                >
                  {selectedAnnouncement.title}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    mt: 1,
                    lineHeight: 1.6,
                    color: theme.palette.text.secondary,
                  }}
                >
                  {selectedAnnouncement.content}
                </Typography>
              </Paper>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      height: "100%",
                      borderRadius: 2,
                      border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      fontWeight="bold"
                      color="primary"
                      sx={{
                        pb: 1,
                        borderBottom: `1px solid ${alpha(
                          theme.palette.primary.main,
                          0.2
                        )}`,
                      }}
                    >
                      Announcement Information
                    </Typography>

                    <Box
                      sx={{
                        mt: 2,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                      }}
                    >
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
                          Type:
                        </Typography>
                        <Chip
                          label={selectedAnnouncement.type}
                          color={getTypeColor(selectedAnnouncement.type)}
                          size="small"
                          sx={{ fontWeight: 500 }}
                        />
                      </Box>

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
                          Priority:
                        </Typography>
                        <Chip
                          label={selectedAnnouncement.priority}
                          color={getPriorityColor(
                            selectedAnnouncement.priority
                          )}
                          size="small"
                          sx={{ fontWeight: 500 }}
                        />
                      </Box>

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
                          label={selectedAnnouncement.status}
                          color={getStatusColor(selectedAnnouncement.status)}
                          size="small"
                          sx={{ fontWeight: 500 }}
                        />
                      </Box>

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
                          Target Audience:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {selectedAnnouncement.targetAudience}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      height: "100%",
                      borderRadius: 2,
                      border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      fontWeight="bold"
                      color="primary"
                      sx={{
                        pb: 1,
                        borderBottom: `1px solid ${alpha(
                          theme.palette.primary.main,
                          0.2
                        )}`,
                      }}
                    >
                      Schedule Information
                    </Typography>

                    <Box
                      sx={{
                        mt: 2,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                      }}
                    >
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
                          Start Date:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {formatDate(selectedAnnouncement.startDate)}
                        </Typography>
                      </Box>

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
                          End Date:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {formatDate(selectedAnnouncement.endDate)}
                        </Typography>
                      </Box>

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
                          Created Date:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {formatDate(selectedAnnouncement.createdAt)}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: { xs: 2, sm: 3 },
            py: 2,
            position: fullScreen ? "sticky" : "relative",
            bottom: 0,
            backgroundColor: "background.paper",
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            zIndex: 1,
            mt: "auto",
            flexShrink: 0,
          }}
        >
          <Button
            onClick={() => setViewDialogOpen(false)}
            variant="contained"
            sx={{
              borderRadius: 1.5,
              px: 3,
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enhanced Add/Edit Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        fullScreen={fullScreen}
        PaperProps={{
          sx: {
            borderRadius: fullScreen ? 0 : 2,
            overflow: "hidden",
            height: fullScreen ? "100%" : "auto",
            display: "flex",
            flexDirection: "column",
            maxHeight: fullScreen ? "100%" : "90vh",
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
              sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
            >
              {editingAnnouncement
                ? "Edit Announcement"
                : "Add New Announcement"}
            </Typography>
          </Box>
        </DialogTitle>

        <form
          onSubmit={formik.handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            height: fullScreen ? "100%" : "auto",
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
                {editingAnnouncement ? "update" : "create"} an announcement. All
                fields are required.
              </Typography>
            </Box>

            <Grid container spacing={isMobile ? 2 : 3}>
              <Grid item xs={12}>
                <Typography
                  variant="subtitle1"
                  color="primary"
                  fontWeight={600}
                  gutterBottom
                >
                  Announcement Details
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  name="title"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  error={formik.touched.title && Boolean(formik.errors.title)}
                  helperText={formik.touched.title && formik.errors.title}
                  size={isMobile ? "small" : "medium"}
                  InputProps={{
                    sx: { borderRadius: 1 },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={isMobile ? 3 : 4}
                  label="Content"
                  name="content"
                  value={formik.values.content}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.content && Boolean(formik.errors.content)
                  }
                  helperText={formik.touched.content && formik.errors.content}
                  size={isMobile ? "small" : "medium"}
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
                  Classification
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl
                  fullWidth
                  size={isMobile ? "small" : "medium"}
                  error={formik.touched.type && Boolean(formik.errors.type)}
                >
                  <InputLabel>Type</InputLabel>
                  <Select
                    name="type"
                    value={formik.values.type}
                    onChange={formik.handleChange}
                    sx={{ borderRadius: 1 }}
                  >
                    <MenuItem value="General">General</MenuItem>
                    <MenuItem value="Event">Event</MenuItem>
                    <MenuItem value="Holiday">Holiday</MenuItem>
                    <MenuItem value="Exam">Exam</MenuItem>
                    <MenuItem value="Emergency">Emergency</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                  {formik.touched.type && formik.errors.type && (
                    <Typography variant="caption" color="error">
                      {formik.errors.type}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl
                  fullWidth
                  size={isMobile ? "small" : "medium"}
                  error={
                    formik.touched.priority && Boolean(formik.errors.priority)
                  }
                >
                  <InputLabel>Priority</InputLabel>
                  <Select
                    name="priority"
                    value={formik.values.priority}
                    onChange={formik.handleChange}
                    sx={{ borderRadius: 1 }}
                  >
                    <MenuItem value="High">High</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="Low">Low</MenuItem>
                  </Select>
                  {formik.touched.priority && formik.errors.priority && (
                    <Typography variant="caption" color="error">
                      {formik.errors.priority}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl
                  fullWidth
                  size={isMobile ? "small" : "medium"}
                  error={
                    formik.touched.targetAudience &&
                    Boolean(formik.errors.targetAudience)
                  }
                >
                  <InputLabel>Target Audience</InputLabel>
                  <Select
                    name="targetAudience"
                    value={formik.values.targetAudience}
                    onChange={formik.handleChange}
                    sx={{ borderRadius: 1 }}
                  >
                    <MenuItem value="All">All</MenuItem>
                    <MenuItem value="Students">Students</MenuItem>
                    <MenuItem value="Teachers">Teachers</MenuItem>
                    <MenuItem value="Parents">Parents</MenuItem>
                  </Select>
                  {formik.touched.targetAudience &&
                    formik.errors.targetAudience && (
                      <Typography variant="caption" color="error">
                        {formik.errors.targetAudience}
                      </Typography>
                    )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sx={{ mt: 1 }}>
                <Typography
                  variant="subtitle1"
                  color="primary"
                  fontWeight={600}
                  gutterBottom
                >
                  Schedule
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Start Date"
                  name="startDate"
                  value={formik.values.startDate}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.startDate && Boolean(formik.errors.startDate)
                  }
                  helperText={
                    formik.touched.startDate && formik.errors.startDate
                  }
                  InputLabelProps={{ shrink: true }}
                  size={isMobile ? "small" : "medium"}
                  InputProps={{
                    sx: { borderRadius: 1 },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="End Date"
                  name="endDate"
                  value={formik.values.endDate}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.endDate && Boolean(formik.errors.endDate)
                  }
                  helperText={formik.touched.endDate && formik.errors.endDate}
                  InputLabelProps={{ shrink: true }}
                  size={isMobile ? "small" : "medium"}
                  InputProps={{
                    sx: { borderRadius: 1 },
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions
            sx={{
              px: { xs: 2, sm: 3 },
              py: 2,
              position: fullScreen ? "sticky" : "relative",
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
              sx={{
                borderRadius: 1.5,
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{
                borderRadius: 1.5,
                px: 3,
              }}
            >
              {formik.isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : editingAnnouncement ? (
                "Update Announcement"
              ) : (
                "Save Announcement"
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Announcements;
