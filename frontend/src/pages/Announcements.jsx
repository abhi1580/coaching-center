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
  title: Yup.string()
    .required("Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must not exceed 100 characters")
    .trim(),
  content: Yup.string()
    .required("Content is required")
    .min(10, "Content must be at least 10 characters"),
  type: Yup.string()
    .required("Type is required")
    .oneOf(
      ["General", "Academic", "Event", "Holiday", "Emergency"],
      "Invalid type"
    ),
  priority: Yup.string()
    .required("Priority is required")
    .oneOf(["Low", "Medium", "High"], "Invalid priority"),
  targetAudience: Yup.string()
    .required("Target audience is required")
    .oneOf(["All", "Students", "Teachers", "Staff"], "Invalid target audience"),
  startDate: Yup.date()
    .required("Start date is required")
    .min(new Date(), "Start date cannot be in the past"),
  endDate: Yup.date()
    .required("End date is required")
    .min(Yup.ref("startDate"), "End date must be after start date"),
  status: Yup.string()
    .required("Status is required")
    .oneOf(["Active", "Inactive"], "Invalid status"),
});

const Announcements = () => {
  const dispatch = useDispatch();
  const { announcements, loading, error, success } = useSelector(
    (state) => state.announcements
  );
  const [open, setOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  useEffect(() => {
    dispatch(fetchAnnouncements());
  }, [dispatch]);

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
      priority: "Medium",
      targetAudience: "All",
      startDate: "",
      endDate: "",
      status: "Active",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (editingAnnouncement) {
          await dispatch(
            updateAnnouncement({ id: editingAnnouncement._id, data: values })
          ).unwrap();
        } else {
          await dispatch(createAnnouncement(values)).unwrap();
        }
      } catch (error) {
        console.error("Error submitting form:", error);
      }
    },
  });

  const handleOpen = (announcement = null) => {
    if (announcement) {
      setEditingAnnouncement(announcement);
      formik.setValues({
        title: announcement.title,
        content: announcement.content,
        type: announcement.type,
        priority: announcement.priority,
        targetAudience: announcement.targetAudience,
        startDate: new Date(announcement.startDate).toISOString().split("T")[0],
        endDate: new Date(announcement.endDate).toISOString().split("T")[0],
        status: announcement.status,
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

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      dispatch(deleteAnnouncement(id));
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
            {announcements &&
            announcements.data &&
            announcements.data.length > 0 ? (
              announcements.data.map((announcement) => (
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
                    {new Date(announcement.startDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(announcement.endDate).toLocaleDateString()}
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

      {/* View Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedAnnouncement && (
          <>
            <DialogTitle>{selectedAnnouncement.title}</DialogTitle>
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
                  {new Date(
                    selectedAnnouncement.startDate
                  ).toLocaleDateString()}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  End Date:{" "}
                  {new Date(selectedAnnouncement.endDate).toLocaleDateString()}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Created By:{" "}
                  {selectedAnnouncement.createdBy?.name || "Unknown"}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Created At:{" "}
                  {new Date(selectedAnnouncement.createdAt).toLocaleString()}
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                {selectedAnnouncement.content}
              </Typography>
            </DialogContent>
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
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="title"
                  label="Title"
                  value={formik.values.title}
                  onChange={formik.handleChange}
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
                  error={
                    formik.touched.content && Boolean(formik.errors.content)
                  }
                  helperText={formik.touched.content && formik.errors.content}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    name="type"
                    value={formik.values.type}
                    onChange={formik.handleChange}
                    error={formik.touched.type && Boolean(formik.errors.type)}
                  >
                    <MenuItem value="General">General</MenuItem>
                    <MenuItem value="Academic">Academic</MenuItem>
                    <MenuItem value="Event">Event</MenuItem>
                    <MenuItem value="Holiday">Holiday</MenuItem>
                    <MenuItem value="Emergency">Emergency</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    name="priority"
                    value={formik.values.priority}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.priority && Boolean(formik.errors.priority)
                    }
                  >
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Target Audience</InputLabel>
                  <Select
                    name="targetAudience"
                    value={formik.values.targetAudience}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.targetAudience &&
                      Boolean(formik.errors.targetAudience)
                    }
                  >
                    <MenuItem value="All">All</MenuItem>
                    <MenuItem value="Students">Students</MenuItem>
                    <MenuItem value="Teachers">Teachers</MenuItem>
                    <MenuItem value="Staff">Staff</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formik.values.status}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.status && Boolean(formik.errors.status)
                    }
                  >
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="startDate"
                  label="Start Date"
                  type="date"
                  value={formik.values.startDate}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.startDate && Boolean(formik.errors.startDate)
                  }
                  helperText={
                    formik.touched.startDate && formik.errors.startDate
                  }
                  InputLabelProps={{
                    shrink: true,
                  }}
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
                  error={
                    formik.touched.endDate && Boolean(formik.errors.endDate)
                  }
                  helperText={formik.touched.endDate && formik.errors.endDate}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
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
