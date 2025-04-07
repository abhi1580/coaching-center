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
  clearSuccess,
  formatDate,
  formatDateForInput,
  getStatusColor,
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
    onSubmit: async (values) => {
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
      <Box p={3}>
        <Alert severity="error">
          {error.message || "Failed to load announcements"}
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">Announcements</Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
            sx={{ mr: 1 }}
          >
            Add Announcement
          </Button>
          <RefreshButton onClick={loadAllData} />
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Announcements
              </Typography>
              <Typography variant="h4">{counts?.total || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active
              </Typography>
              <Typography variant="h4" color="success.main">
                {counts?.active || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Scheduled
              </Typography>
              <Typography variant="h4" color="warning.main">
                {counts?.scheduled || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Expired
              </Typography>
              <Typography variant="h4" color="error.main">
                {counts?.expired || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Announcements Table */}
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
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {announcements?.map((announcement) => (
              <TableRow key={announcement._id}>
                <TableCell>
                  {announcement.title.length > 30
                    ? `${announcement.title.substring(0, 30)}...`
                    : announcement.title}
                </TableCell>
                <TableCell>
                  <Chip
                    label={announcement.type}
                    color={getTypeColor(announcement.type)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={announcement.priority}
                    color={getPriorityColor(announcement.priority)}
                    size="small"
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
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleView(announcement)}
                    color="primary"
                    title="View Details"
                  >
                    <VisibilityIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* View Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: { sm: 500 },
            maxHeight: "90vh",
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">Announcement Details</Typography>
            <Box>
              <IconButton
                size="small"
                onClick={() => {
                  setViewDialogOpen(false);
                  handleOpen(selectedAnnouncement);
                }}
                color="primary"
                sx={{ mr: 1 }}
                title="Edit"
              >
                <EditIcon />
              </IconButton>
              <IconButton
                size="small"
                onClick={handleConfirmDelete}
                color="error"
                title="Delete"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedAnnouncement && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedAnnouncement.title}
              </Typography>
              <Typography variant="body1" paragraph>
                {selectedAnnouncement.content}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography
                    variant="subtitle2"
                    color="textSecondary"
                    gutterBottom
                  >
                    Type
                  </Typography>
                  <Chip
                    label={selectedAnnouncement.type}
                    color={getTypeColor(selectedAnnouncement.type)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography
                    variant="subtitle2"
                    color="textSecondary"
                    gutterBottom
                  >
                    Priority
                  </Typography>
                  <Chip
                    label={selectedAnnouncement.priority}
                    color={getPriorityColor(selectedAnnouncement.priority)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography
                    variant="subtitle2"
                    color="textSecondary"
                    gutterBottom
                  >
                    Target Audience
                  </Typography>
                  <Typography variant="body1">
                    {selectedAnnouncement.targetAudience}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography
                    variant="subtitle2"
                    color="textSecondary"
                    gutterBottom
                  >
                    Status
                  </Typography>
                  <Chip
                    label={selectedAnnouncement.status}
                    color={getStatusColor(selectedAnnouncement.status)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography
                    variant="subtitle2"
                    color="textSecondary"
                    gutterBottom
                  >
                    Start Date
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(selectedAnnouncement.startDate)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography
                    variant="subtitle2"
                    color="textSecondary"
                    gutterBottom
                  >
                    End Date
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(selectedAnnouncement.endDate)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: { sm: 500 },
            maxHeight: "90vh",
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          {editingAnnouncement ? "Edit Announcement" : "Add Announcement"}
        </DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  name="title"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  error={formik.touched.title && Boolean(formik.errors.title)}
                  helperText={formik.touched.title && formik.errors.title}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Content"
                  name="content"
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
                    <MenuItem value="Event">Event</MenuItem>
                    <MenuItem value="Holiday">Holiday</MenuItem>
                    <MenuItem value="Exam">Exam</MenuItem>
                    <MenuItem value="Emergency">Emergency</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
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
                    <MenuItem value="High">High</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="Low">Low</MenuItem>
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
                    <MenuItem value="Parents">Parents</MenuItem>
                  </Select>
                </FormControl>
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
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {editingAnnouncement ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Announcements;
