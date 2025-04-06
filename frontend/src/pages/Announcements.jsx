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
    .oneOf(["General", "Event", "Emergency"], "Invalid type")
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
      type: "General",
      priority: "Medium",
      targetAudience: "All",
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
          type: values.type,
          priority: values.priority,
          targetAudience: values.targetAudience,
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
        type: announcement.type || "General",
        priority: announcement.priority || "Medium",
        targetAudience: announcement.targetAudience || "All",
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
      case "Emergency":
        return "error";
      case "Event":
        return "primary";
      default:
        return "default";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "error.main";
      case "Medium":
        return "warning.main";
      default:
        return "success.main";
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
                    <Typography
                      variant="body2"
                      sx={{
                        mr: 1,
                        color: getPriorityColor(announcement.priority),
                        fontWeight: "bold",
                      }}
                    >
                      {announcement.priority || "Medium"} Priority
                    </Typography>
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
                    startIcon={<VisibilityIcon />}
                    onClick={() => handleView(announcement)}
                    color="primary"
                  >
                    View
                  </Button>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleOpen(announcement)}
                    color="primary"
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
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
                      <Typography
                        sx={{
                          color: getPriorityColor(announcement.priority),
                          fontWeight: "bold",
                        }}
                      >
                        {announcement.priority || "Medium"}
                      </Typography>
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
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          color="primary"
                          onClick={() => handleOpen(announcement)}
                          size="small"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(announcement._id)}
                          size="small"
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
              <Box sx={{ pr: 4 }}>
                <Typography variant="h6" component="div">
                  {selectedAnnouncement.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Created by:{" "}
                  {selectedAnnouncement.createdBy?.name || "Unknown"}
                </Typography>
              </Box>
              <IconButton
                onClick={() => {
                  setViewDialogOpen(false);
                  handleOpen(selectedAnnouncement);
                }}
                sx={{ position: "absolute", right: 8, top: 8 }}
                size={isMobile ? "medium" : "small"}
              >
                <EditIcon fontSize={isMobile ? "small" : "inherit"} />
              </IconButton>
            </DialogTitle>
            <DialogContent
              dividers
              sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 2 } }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Type
                    </Typography>
                    <Chip
                      label={selectedAnnouncement.type}
                      color={getTypeColor(selectedAnnouncement.type)}
                      size="small"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Priority
                    </Typography>
                    <Typography
                      sx={{
                        color: getPriorityColor(selectedAnnouncement.priority),
                        fontWeight: "bold",
                      }}
                    >
                      {selectedAnnouncement.priority || "Medium"}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Target Audience
                    </Typography>
                    <Typography>
                      {selectedAnnouncement.targetAudience}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Status
                    </Typography>
                    <Chip
                      label={selectedAnnouncement.status}
                      color={
                        selectedAnnouncement.status === "Active"
                          ? "success"
                          : "error"
                      }
                      size="small"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Start Time
                    </Typography>
                    <Typography>
                      {formatDate(selectedAnnouncement.startTime)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      End Time
                    </Typography>
                    <Typography>
                      {formatDate(selectedAnnouncement.endTime)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Content
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      mt: 1,
                      backgroundColor: "background.default",
                      minHeight: "100px",
                    }}
                  >
                    <Typography variant="body2" whiteSpace="pre-line">
                      {selectedAnnouncement.content || "No content available"}
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
                <TextField
                  fullWidth
                  id="type"
                  name="type"
                  select
                  label="Type"
                  value={formik.values.type}
                  onChange={formik.handleChange}
                  error={formik.touched.type && Boolean(formik.errors.type)}
                  helperText={formik.touched.type && formik.errors.type}
                  margin="normal"
                  size={isMobile ? "medium" : "small"}
                >
                  <MenuItem value="General">General</MenuItem>
                  <MenuItem value="Event">Event</MenuItem>
                  <MenuItem value="Emergency">Emergency</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="priority"
                  name="priority"
                  select
                  label="Priority"
                  value={formik.values.priority}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.priority && Boolean(formik.errors.priority)
                  }
                  helperText={formik.touched.priority && formik.errors.priority}
                  margin="normal"
                  size={isMobile ? "medium" : "small"}
                >
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="targetAudience"
                  name="targetAudience"
                  select
                  label="Target Audience"
                  value={formik.values.targetAudience}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.targetAudience &&
                    Boolean(formik.errors.targetAudience)
                  }
                  helperText={
                    formik.touched.targetAudience &&
                    formik.errors.targetAudience
                  }
                  margin="normal"
                  size={isMobile ? "medium" : "small"}
                >
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="Students">Students</MenuItem>
                  <MenuItem value="Teachers">Teachers</MenuItem>
                  <MenuItem value="Parents">Parents</MenuItem>
                </TextField>
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
