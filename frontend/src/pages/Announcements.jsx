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
  Chip,
  Grid,
  Divider,
  DialogContentText,
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
          Announcements
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Target Audience</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {announcements && announcements.length > 0 ? (
              announcements.map((announcement) => (
                <TableRow
                  key={
                    announcement._id || Math.random().toString(36).substr(2, 9)
                  }
                >
                  <TableCell>{announcement.title}</TableCell>
                  <TableCell>
                    <Chip
                      label={announcement.type}
                      color={
                        announcement.type === "Emergency"
                          ? "error"
                          : announcement.type === "Event"
                          ? "primary"
                          : "default"
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Typography
                      sx={{
                        color:
                          announcement.priority === "High"
                            ? "error.main"
                            : announcement.priority === "Medium"
                            ? "warning.main"
                            : "success.main",
                        fontWeight: "bold",
                      }}
                    >
                      {announcement.priority || "Medium"}
                    </Typography>
                  </TableCell>
                  <TableCell>{announcement.targetAudience}</TableCell>
                  <TableCell>
                    {announcement.startTime
                      ? new Date(announcement.startTime).toLocaleString() ||
                        "Invalid Date"
                      : "Not set"}
                  </TableCell>
                  <TableCell>
                    {announcement.endTime
                      ? new Date(announcement.endTime).toLocaleString() ||
                        "Invalid Date"
                      : "Not set"}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={announcement.status}
                      color={
                        announcement.status === "Active" ? "success" : "error"
                      }
                    />
                  </TableCell>
                  <TableCell>
                    {announcement.createdBy?.name || "Unknown"}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleView(announcement)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpen(announcement)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(announcement._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  No announcements found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* View/Delete Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => {
          setViewDialogOpen(false);
          setSelectedAnnouncement(null);
        }}
        maxWidth="md"
        fullWidth
      >
        {selectedAnnouncement && (
          <>
            <DialogTitle>
              {selectedAnnouncement.title}
              <IconButton
                onClick={() => handleOpen(selectedAnnouncement)}
                sx={{ position: "absolute", right: 8, top: 8 }}
              >
                <EditIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" color="text.secondary">
                  Type: {selectedAnnouncement.type}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Priority: {selectedAnnouncement.priority}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Target Audience: {selectedAnnouncement.targetAudience}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Status: {selectedAnnouncement.status}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Start Date:{" "}
                  {selectedAnnouncement.startTime
                    ? new Date(
                        selectedAnnouncement.startTime
                      ).toLocaleString() || "Invalid Date"
                    : "Not set"}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  End Date:{" "}
                  {selectedAnnouncement.endTime
                    ? new Date(selectedAnnouncement.endTime).toLocaleString() ||
                      "Invalid Date"
                    : "Not set"}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Created By:{" "}
                  {selectedAnnouncement.createdBy?.name || "Unknown"}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Created At:{" "}
                  {selectedAnnouncement.createdAt
                    ? new Date(
                        selectedAnnouncement.createdAt
                      ).toLocaleString() || "Invalid Date"
                    : "Not set"}
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                {selectedAnnouncement.content}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  setViewDialogOpen(false);
                  setSelectedAnnouncement(null);
                }}
              >
                Close
              </Button>
              <Button
                color="error"
                onClick={handleConfirmDelete}
                startIcon={<DeleteIcon />}
              >
                Delete
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Edit/Create Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingAnnouncement ? "Edit Announcement" : "Add New Announcement"}
        </DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="title"
                    label="Title"
                    value={formik.values.title}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.title && Boolean(formik.errors.title)}
                    helperText={formik.touched.title && formik.errors.title}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="content"
                    label="Content"
                    multiline
                    rows={4}
                    value={formik.values.content}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.content && Boolean(formik.errors.content)
                    }
                    helperText={formik.touched.content && formik.errors.content}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    name="type"
                    label="Type"
                    value={formik.values.type}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.type && Boolean(formik.errors.type)}
                    helperText={formik.touched.type && formik.errors.type}
                  >
                    <MenuItem value="General">General</MenuItem>
                    <MenuItem value="Event">Event</MenuItem>
                    <MenuItem value="Emergency">Emergency</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    name="priority"
                    label="Priority"
                    value={formik.values.priority}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.priority && Boolean(formik.errors.priority)
                    }
                    helperText={
                      formik.touched.priority && formik.errors.priority
                    }
                  >
                    <MenuItem value="High">High</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="Low">Low</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    name="targetAudience"
                    label="Target Audience"
                    value={formik.values.targetAudience}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.targetAudience &&
                      Boolean(formik.errors.targetAudience)
                    }
                    helperText={
                      formik.touched.targetAudience &&
                      formik.errors.targetAudience
                    }
                  >
                    <MenuItem value="All">All</MenuItem>
                    <MenuItem value="Students">Students</MenuItem>
                    <MenuItem value="Teachers">Teachers</MenuItem>
                    <MenuItem value="Parents">Parents</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="startDate"
                    label="Start Date"
                    type="date"
                    value={formik.values.startDate}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.startDate &&
                      Boolean(formik.errors.startDate)
                    }
                    helperText={
                      formik.touched.startDate && formik.errors.startDate
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="startTime"
                    label="Start Time"
                    type="time"
                    value={formik.values.startTime}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.startTime &&
                      Boolean(formik.errors.startTime)
                    }
                    helperText={
                      formik.touched.startTime && formik.errors.startTime
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="endDate"
                    label="End Date"
                    type="date"
                    value={formik.values.endDate}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.endDate && Boolean(formik.errors.endDate)
                    }
                    helperText={formik.touched.endDate && formik.errors.endDate}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="endTime"
                    label="End Time"
                    type="time"
                    value={formik.values.endTime}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.endTime && Boolean(formik.errors.endTime)
                    }
                    helperText={formik.touched.endTime && formik.errors.endTime}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={formik.isSubmitting}
            >
              {editingAnnouncement ? "Update" : "Add"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Announcements;
