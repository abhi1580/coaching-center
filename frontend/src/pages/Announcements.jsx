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
  resetStatus,
} from "../store/slices/announcementSlice";
import RefreshButton from "../components/RefreshButton";

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
  startDate: Yup.string().required("Start date is required"),
  startTime: Yup.string().required("Start time is required"),
  endDate: Yup.string().required("End date is required"),
  endTime: Yup.string().required("End time is required"),
});

const Announcements = () => {
  const dispatch = useDispatch();
  const {
    data: announcements,
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

  const loadAllData = useCallback(() => {
    dispatch(fetchAnnouncements());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchAnnouncements());
  }, [dispatch]);

  useEffect(() => {
    console.log("Current announcements state:", announcements);
    console.log("Loading state:", loading);
    console.log("Error state:", error);
  }, [announcements, loading, error]);

  useEffect(() => {
    if (success) {
      setOpen(false);
      setEditingAnnouncement(null);
      dispatch(resetStatus());
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
      startTime: "",
      endDate: "",
      endTime: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const announcementData = {
          title: values.title,
          content: values.content,
          type: values.type || "General",
          priority: values.priority || "Medium",
          targetAudience: values.targetAudience || "All",
          startDate: values.startDate,
          startTime: values.startTime,
          endDate: values.endDate,
          endTime: values.endTime,
          createdBy: "65f1a2b3c4d5e6f7g8h9i0j1",
        };

        console.log("Submitting announcement data:", announcementData);

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
        dispatch(fetchAnnouncements());
      } catch (error) {
        console.error("Error submitting form:", error);
      }
    },
  });

  const handleOpen = (announcement = null) => {
    if (announcement) {
      setEditingAnnouncement(announcement);
      let startDate = new Date(announcement.startTime);
      let endDate = new Date(announcement.endTime);

      if (isNaN(startDate.getTime())) {
        startDate = new Date();
        console.warn(
          "Invalid start date detected, using current date as fallback"
        );
      }
      if (isNaN(endDate.getTime())) {
        endDate = new Date();
        console.warn(
          "Invalid end date detected, using current date as fallback"
        );
      }

      formik.setValues({
        title: announcement.title || "",
        content: announcement.content || "",
        type: announcement.type || "",
        priority: announcement.priority || "",
        targetAudience: announcement.targetAudience || "",
        startDate: startDate.toISOString().split("T")[0],
        startTime: startDate.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        }),
        endDate: endDate.toISOString().split("T")[0],
        endTime: endDate.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        }),
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
    setSelectedAnnouncement(announcements.find((a) => a._id === id));
    setViewDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await dispatch(deleteAnnouncement(selectedAnnouncement._id)).unwrap();
      setViewDialogOpen(false);
      setSelectedAnnouncement(null);
      dispatch(fetchAnnouncements());
    } catch (error) {
      console.error("Error deleting announcement:", error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleString();
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "General":
        return "primary";
      case "Event":
        return "success";
      case "Holiday":
        return "secondary";
      case "Exam":
        return "warning";
      case "Emergency":
        return "error";
      case "Other":
        return "info";
      default:
        return "info";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "error";
      case "Medium":
        return "warning";
      default:
        return "success";
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
            Announcements
          </Typography>
          <RefreshButton
            onRefresh={loadAllData}
            tooltip="Refresh announcements data"
            sx={{ ml: 1 }}
          />
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          sx={{ alignSelf: { xs: "flex-start", sm: "auto" } }}
        >
          Add Announcement
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.message || error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Operation completed successfully
        </Alert>
      )}

      {isMobile ? (
        <Stack spacing={2}>
          {announcements && announcements.length > 0 ? (
            announcements.map((announcement) => (
              <Card
                key={
                  announcement._id || Math.random().toString(36).substr(2, 9)
                }
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
                      {announcement.title}
                    </Typography>
                    <Chip
                      label={announcement.type}
                      size="small"
                      color={getTypeColor(announcement.type)}
                    />
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Chip
                      label={`${announcement.priority || "Medium"} Priority`}
                      size="small"
                      color={getPriorityColor(announcement.priority)}
                      sx={{ mr: 1 }}
                    />
                    <Chip
                      label={`For: ${announcement.targetAudience}`}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>

                  <Divider sx={{ my: 1 }} />

                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Start: {formatDate(announcement.startTime)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      End: {formatDate(announcement.endTime)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", mt: 1, alignItems: "center" }}>
                    <Chip
                      label={announcement.status}
                      size="small"
                      color={
                        announcement.status === "Active" ? "success" : "error"
                      }
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      By: {announcement.createdBy?.name || "Unknown"}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<VisibilityIcon />}
                    onClick={() => handleView(announcement)}
                    color="primary"
                    sx={{ mr: 1 }}
                  >
                    View
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => handleOpen(announcement)}
                    color="primary"
                    sx={{ mr: 1 }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDelete(announcement._id)}
                    color="error"
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            ))
          ) : (
            <Typography align="center" sx={{ py: 3 }}>
              No announcements found
            </Typography>
          )}
        </Stack>
      ) : (
        <TableContainer
          component={Paper}
          sx={{ borderRadius: 2, overflow: "hidden" }}
        >
          <Table size={isTablet ? "small" : "medium"}>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Title
                </TableCell>
                {!isTablet && (
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Type
                  </TableCell>
                )}
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Priority
                </TableCell>
                {!isTablet && (
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Target
                  </TableCell>
                )}
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Start Date
                </TableCell>
                {!isTablet && (
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    End Date
                  </TableCell>
                )}
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Status
                </TableCell>
                {!isTablet && (
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Created By
                  </TableCell>
                )}
                <TableCell
                  sx={{ color: "white", fontWeight: "bold" }}
                  align="right"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {announcements && announcements.length > 0 ? (
                announcements.map((announcement) => (
                  <TableRow
                    key={
                      announcement._id ||
                      Math.random().toString(36).substr(2, 9)
                    }
                    hover
                  >
                    <TableCell>{announcement.title}</TableCell>
                    {!isTablet && (
                      <TableCell>
                        <Chip
                          label={announcement.type}
                          size="small"
                          color={getTypeColor(announcement.type)}
                        />
                      </TableCell>
                    )}
                    <TableCell>
                      <Chip
                        label={announcement.priority || "Medium"}
                        size="small"
                        color={getPriorityColor(announcement.priority)}
                      />
                    </TableCell>
                    {!isTablet && (
                      <TableCell>{announcement.targetAudience}</TableCell>
                    )}
                    <TableCell>{formatDate(announcement.startTime)}</TableCell>
                    {!isTablet && (
                      <TableCell>{formatDate(announcement.endTime)}</TableCell>
                    )}
                    <TableCell>
                      <Chip
                        label={announcement.status}
                        size="small"
                        color={
                          announcement.status === "Active" ? "success" : "error"
                        }
                      />
                    </TableCell>
                    {!isTablet && (
                      <TableCell>
                        {announcement.createdBy?.name || "Unknown"}
                      </TableCell>
                    )}
                    <TableCell align="right">
                      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <IconButton
                          color="primary"
                          onClick={() => handleView(announcement)}
                          size="small"
                          title="View Details"
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          color="primary"
                          onClick={() => handleOpen(announcement)}
                          size="small"
                          title="Edit"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(announcement._id)}
                          size="small"
                          title="Delete"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={isTablet ? 5 : 9} align="center">
                    No announcements found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={viewDialogOpen}
        onClose={() => {
          setViewDialogOpen(false);
          setSelectedAnnouncement(null);
        }}
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
        {selectedAnnouncement && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Box>
                <Typography variant="h6" component="div">
                  {selectedAnnouncement.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Created by:{" "}
                  {selectedAnnouncement.createdBy?.name || "Unknown"}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Type
                  </Typography>
                  <Chip
                    label={selectedAnnouncement.type}
                    size="small"
                    color={getTypeColor(selectedAnnouncement.type)}
                    sx={{ mt: 0.5 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Priority
                  </Typography>
                  <Chip
                    label={selectedAnnouncement.priority}
                    size="small"
                    color={getPriorityColor(selectedAnnouncement.priority)}
                    sx={{ mt: 0.5 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Target Audience
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {selectedAnnouncement.targetAudience}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Start Date
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {formatDate(selectedAnnouncement.startTime)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    End Date
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {formatDate(selectedAnnouncement.endTime)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={selectedAnnouncement.status}
                    size="small"
                    color={
                      selectedAnnouncement.status === "Active"
                        ? "success"
                        : "error"
                    }
                    sx={{ mt: 0.5 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Content
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{ p: 2, mt: 0.5, minHeight: "100px" }}
                  >
                    <Typography
                      variant="body2"
                      style={{ whiteSpace: "pre-wrap" }}
                    >
                      {selectedAnnouncement.content}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 2 } }}>
              <Button
                onClick={() => {
                  setViewDialogOpen(false);
                  setSelectedAnnouncement(null);
                }}
                color="primary"
              >
                Close
              </Button>
              <Button
                color="primary"
                variant="outlined"
                onClick={() => {
                  setViewDialogOpen(false);
                  handleOpen(selectedAnnouncement);
                }}
                startIcon={<EditIcon />}
              >
                Edit
              </Button>
              <Button
                color="error"
                variant="contained"
                onClick={handleConfirmDelete}
                startIcon={<DeleteIcon />}
              >
                Delete
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Dialog
        open={open}
        onClose={handleClose}
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
        <DialogTitle>
          {editingAnnouncement
            ? "Edit Announcement"
            : "Create New Announcement"}
        </DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent
            dividers
            sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 2 } }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="title"
                  name="title"
                  label="Title"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  error={formik.touched.title && Boolean(formik.errors.title)}
                  helperText={formik.touched.title && formik.errors.title}
                  margin="normal"
                  size={isMobile ? "medium" : "small"}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl
                  fullWidth
                  margin="normal"
                  size={isMobile ? "medium" : "small"}
                  error={formik.touched.type && Boolean(formik.errors.type)}
                >
                  <InputLabel id="type-label">Type</InputLabel>
                  <Select
                    labelId="type-label"
                    id="type"
                    name="type"
                    value={formik.values.type}
                    onChange={formik.handleChange}
                    label="Type"
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
                  margin="normal"
                  size={isMobile ? "medium" : "small"}
                  error={
                    formik.touched.priority && Boolean(formik.errors.priority)
                  }
                >
                  <InputLabel id="priority-label">Priority</InputLabel>
                  <Select
                    labelId="priority-label"
                    id="priority"
                    name="priority"
                    value={formik.values.priority}
                    onChange={formik.handleChange}
                    label="Priority"
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
                  margin="normal"
                  size={isMobile ? "medium" : "small"}
                  error={
                    formik.touched.targetAudience &&
                    Boolean(formik.errors.targetAudience)
                  }
                >
                  <InputLabel id="targetAudience-label">
                    Target Audience
                  </InputLabel>
                  <Select
                    labelId="targetAudience-label"
                    id="targetAudience"
                    name="targetAudience"
                    value={formik.values.targetAudience}
                    onChange={formik.handleChange}
                    label="Target Audience"
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
              <Grid item xs={12} sm={6}>
                {/* This can be left empty for alignment, or used for another field if needed */}
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <TextField
                    fullWidth
                    id="startDate"
                    name="startDate"
                    label="Start Date"
                    type="date"
                    value={formik.values.startDate}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.startDate &&
                      Boolean(formik.errors.startDate)
                    }
                    helperText={
                      formik.touched.startDate && formik.errors.startDate
                    }
                    InputLabelProps={{ shrink: true }}
                    margin="normal"
                    size={isMobile ? "medium" : "small"}
                  />
                  <TextField
                    fullWidth
                    id="startTime"
                    name="startTime"
                    label="Start Time"
                    type="time"
                    value={formik.values.startTime}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.startTime &&
                      Boolean(formik.errors.startTime)
                    }
                    helperText={
                      formik.touched.startTime && formik.errors.startTime
                    }
                    InputLabelProps={{ shrink: true }}
                    margin="normal"
                    size={isMobile ? "medium" : "small"}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <TextField
                    fullWidth
                    id="endDate"
                    name="endDate"
                    label="End Date"
                    type="date"
                    value={formik.values.endDate}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.endDate && Boolean(formik.errors.endDate)
                    }
                    helperText={formik.touched.endDate && formik.errors.endDate}
                    InputLabelProps={{ shrink: true }}
                    margin="normal"
                    size={isMobile ? "medium" : "small"}
                  />
                  <TextField
                    fullWidth
                    id="endTime"
                    name="endTime"
                    label="End Time"
                    type="time"
                    value={formik.values.endTime}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.endTime && Boolean(formik.errors.endTime)
                    }
                    helperText={formik.touched.endTime && formik.errors.endTime}
                    InputLabelProps={{ shrink: true }}
                    margin="normal"
                    size={isMobile ? "medium" : "small"}
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="content"
                  name="content"
                  label="Content"
                  multiline
                  rows={6}
                  value={formik.values.content}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.content && Boolean(formik.errors.content)
                  }
                  helperText={formik.touched.content && formik.errors.content}
                  margin="normal"
                  size={isMobile ? "medium" : "small"}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 2 } }}>
            <Button onClick={handleClose} color="inherit">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={formik.isSubmitting}
              startIcon={
                formik.isSubmitting ? <CircularProgress size={20} /> : null
              }
            >
              {editingAnnouncement ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Announcements;
