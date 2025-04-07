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
      <Box p={isMobile ? 2 : 3}>
        <Alert severity="error">
          {error.message || "Failed to load announcements"}
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={isMobile ? 2 : 3}>
      {/* Responsive Header */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          mb: { xs: 2, sm: 3 },
          gap: { xs: 2, sm: 0 },
        }}
      >
        <Typography
          variant="h4"
          sx={{ fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" } }}
        >
          Announcements
        </Typography>
        <Box sx={{ display: "flex", width: { xs: "100%", sm: "auto" } }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
            sx={{
              mr: 1,
              flex: { xs: 1, sm: "none" },
              fontSize: { xs: "0.8125rem", sm: "0.875rem" },
            }}
            size={isMobile ? "small" : "medium"}
          >
            {isMobile ? "Add" : "Add Announcement"}
          </Button>
          <RefreshButton
            onClick={loadAllData}
            size={isMobile ? "small" : "medium"}
          />
        </Box>
      </Box>

      {/* Responsive Stats Cards */}
      <Grid container spacing={isMobile ? 1 : 3} mb={isMobile ? 2 : 3}>
        <Grid item xs={6} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
              <Typography
                color="textSecondary"
                gutterBottom
                variant={isMobile ? "body2" : "body1"}
              >
                Total
              </Typography>
              <Typography variant={isMobile ? "h5" : "h4"}>
                {counts?.total || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
              <Typography
                color="textSecondary"
                gutterBottom
                variant={isMobile ? "body2" : "body1"}
              >
                Active
              </Typography>
              <Typography variant={isMobile ? "h5" : "h4"} color="success.main">
                {counts?.active || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
              <Typography
                color="textSecondary"
                gutterBottom
                variant={isMobile ? "body2" : "body1"}
              >
                Scheduled
              </Typography>
              <Typography variant={isMobile ? "h5" : "h4"} color="warning.main">
                {counts?.scheduled || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
              <Typography
                color="textSecondary"
                gutterBottom
                variant={isMobile ? "body2" : "body1"}
              >
                Expired
              </Typography>
              <Typography variant={isMobile ? "h5" : "h4"} color="error.main">
                {counts?.expired || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Table for desktop, Cards for mobile */}
      <Hidden smDown>
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
      </Hidden>

      {/* Card layout for mobile */}
      <Hidden smUp>
        <Stack spacing={2}>
          {announcements?.map((announcement) => (
            <Card key={announcement._id} sx={{ mb: 1 }}>
              <CardContent sx={{ pb: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {announcement.title.length > 40
                    ? `${announcement.title.substring(0, 40)}...`
                    : announcement.title}
                </Typography>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1 }}>
                  <Chip
                    label={announcement.type}
                    color={getTypeColor(announcement.type)}
                    size="small"
                  />
                  <Chip
                    label={announcement.priority}
                    color={getPriorityColor(announcement.priority)}
                    size="small"
                  />
                  <Chip
                    label={announcement.status}
                    color={getStatusColor(announcement.status)}
                    size="small"
                  />
                </Box>

                <Box sx={{ mt: 1.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    Target: {announcement.targetAudience}
                  </Typography>
                  <Grid container spacing={1} sx={{ mt: 0.5 }}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Start: {formatDate(announcement.startDate)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        End: {formatDate(announcement.endDate)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  onClick={() => handleView(announcement)}
                  startIcon={<VisibilityIcon />}
                >
                  View Details
                </Button>
              </CardActions>
            </Card>
          ))}
        </Stack>
      </Hidden>

      {/* Responsive View Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={fullScreen}
        PaperProps={{
          sx: {
            borderRadius: fullScreen ? 0 : 2,
            minWidth: { sm: 500 },
            maxHeight: fullScreen ? "100%" : "90vh",
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography
              variant="h6"
              sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
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
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
              >
                {selectedAnnouncement.title}
              </Typography>
              <Typography variant="body1" paragraph>
                {selectedAnnouncement.content}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={6}>
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
                <Grid item xs={6} sm={6}>
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
                <Grid item xs={6} sm={6}>
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
                <Grid item xs={6} sm={6}>
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
                <Grid item xs={6} sm={6}>
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
                <Grid item xs={6} sm={6}>
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
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1.5, sm: 2 } }}>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Responsive Add/Edit Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        fullScreen={fullScreen}
        PaperProps={{
          sx: {
            borderRadius: fullScreen ? 0 : 2,
            minWidth: { sm: 500 },
            maxHeight: fullScreen ? "100%" : "90vh",
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>
            {editingAnnouncement ? "Edit Announcement" : "Add Announcement"}
          </Typography>
        </DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent dividers>
            <Grid container spacing={isMobile ? 1.5 : 2}>
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
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size={isMobile ? "small" : "medium"}>
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
                <FormControl fullWidth size={isMobile ? "small" : "medium"}>
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
                <FormControl fullWidth size={isMobile ? "small" : "medium"}>
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
                  size={isMobile ? "small" : "medium"}
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
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions
            sx={{
              px: { xs: 2, sm: 3 },
              py: { xs: 1.5, sm: 2 },
              flexDirection: isMobile ? "column" : "row",
              alignItems: isMobile ? "stretch" : "center",
            }}
          >
            <Button
              onClick={handleClose}
              fullWidth={isMobile}
              sx={{ mb: isMobile ? 1 : 0 }}
              size={isMobile ? "small" : "medium"}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth={isMobile}
              size={isMobile ? "small" : "medium"}
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
