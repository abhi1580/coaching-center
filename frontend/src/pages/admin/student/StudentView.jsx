import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Paper,
  Typography,
  Grid,
  Chip,
  IconButton,
  useTheme,
  alpha,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Breadcrumbs,
  Link,
  Stack,
  Avatar,
  Divider,
  Card,
  CardContent,
  Tooltip,
  Alert,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  School as SchoolIcon,
  CalendarToday as CalendarTodayIcon,
  Book as BookIcon,
  Info as InfoIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import {
  fetchStudents,
  deleteStudent,
} from "../../../store/slices/studentSlice";
import { fetchStandards } from "../../../store/slices/standardSlice";
import { fetchBatches } from "../../../store/slices/batchSlice";
import DeleteConfirmationDialog from "../../../components/common/DeleteConfirmationDialog";

const StudentView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();

  const { students, loading, error } = useSelector((state) => state.students);
  const { standards } = useSelector((state) => state.standards);
  const { batches } = useSelector((state) => state.batches);

  const [selectedStudent, setSelectedStudent] = useState(null);

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load data initially
  useEffect(() => {
    dispatch(fetchStudents());
    dispatch(fetchStandards());
    dispatch(fetchBatches());
  }, [dispatch]);

  // Set selected student when data is loaded
  useEffect(() => {
    if (students && id) {
      const student = students.find((s) => s._id === id);
      if (student) {
        setSelectedStudent(student);
      }
    }
  }, [students, id]);

  const openDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  const confirmDelete = async () => {
    try {
      setDeleteLoading(true);
      await dispatch(deleteStudent(id)).unwrap();
      navigate("/app/students");
    } catch (error) {
      console.error("Error deleting student:", error);
      alert("Failed to delete student: " + error.message);
    } finally {
      setDeleteLoading(false);
      closeDeleteDialog();
    }
  };

  // Helper function to get related data
  const getRelatedData = (id, array) => {
    if (!id || !array || !array.length) return null;
    return array.find((item) => (item._id || item) === id);
  };

  const getBatchStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return theme.palette.success.main;
      case "upcoming":
        return theme.palette.info.main;
      case "completed":
        return theme.palette.warning.main;

      default:
        return theme.palette.grey[500];
    }
  };

  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(date);
    } catch (error) {
      return "N/A";
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    try {
      const [hours, minutes] = timeString.split(":");
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? "PM" : "AM";
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    } catch (error) {
      return timeString;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Error loading student data: {error}
      </Alert>
    );
  }

  if (!selectedStudent) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        Student not found. The student may have been deleted or the ID is
        invalid.
      </Alert>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2, mt: 1 }} separator="›">
        <Link
          underline="hover"
          color="inherit"
          href="/app/dashboard"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
          Dashboard
        </Link>
        <Link
          underline="hover"
          color="inherit"
          href="/app/students"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <PersonIcon sx={{ mr: 0.5 }} fontSize="small" />
          Students
        </Link>
        <Typography
          color="text.primary"
          sx={{ display: "flex", alignItems: "center" }}
        >
          {selectedStudent.name}
        </Typography>
      </Breadcrumbs>

      {/* Header with actions */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          backgroundColor: (theme) => alpha(theme.palette.primary.light, 0.05),
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: (theme) =>
                  selectedStudent.gender === "female"
                    ? theme.palette.info.main
                    : selectedStudent.gender === "male"
                    ? theme.palette.primary.main
                    : theme.palette.grey[500],
                width: { xs: 50, sm: 60 },
                height: { xs: 50, sm: 60 },
                fontSize: { xs: "1.5rem", sm: "2rem" },
                fontWeight: 600,
              }}
            >
              {selectedStudent.name?.charAt(0)?.toUpperCase() || "S"}
            </Avatar>
            <Box>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontSize: { xs: "1.5rem", sm: "2rem" },
                  fontWeight: 600,
                  color: "primary.main",
                }}
              >
                {selectedStudent.name}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip
                  label={selectedStudent.gender || "Not specified"}
                  size="small"
                  sx={{ textTransform: "capitalize" }}
                />
                {selectedStudent.studentId && (
                  <Chip
                    label={`ID: ${selectedStudent.studentId}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/app/students")}
            >
              Back to List
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/app/students/${id}/edit`)}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={openDeleteDialog}
            >
              Delete
            </Button>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Personal Information */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%", borderRadius: 2 }}>
            <CardContent>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  fontWeight: 600,
                  color: "primary.main",
                }}
              >
                <PersonIcon fontSize="small" />
                Personal Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={2}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1,
                  }}
                >
                  <PhoneIcon
                    fontSize="small"
                    sx={{ color: "text.secondary", mt: 0.5 }}
                  />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Phone Number
                    </Typography>
                    <Typography variant="body1">
                      {selectedStudent.phone || "Not provided"}
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1,
                  }}
                >
                  <EmailIcon
                    fontSize="small"
                    sx={{ color: "text.secondary", mt: 0.5 }}
                  />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Email Address
                    </Typography>
                    <Typography variant="body1">
                      {selectedStudent.email || "Not provided"}
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1,
                  }}
                >
                  <HomeIcon
                    fontSize="small"
                    sx={{ color: "text.secondary", mt: 0.5 }}
                  />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Address
                    </Typography>
                    <Typography variant="body1">
                      {selectedStudent.address || "Not provided"}
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1,
                  }}
                >
                  <CalendarTodayIcon
                    fontSize="small"
                    sx={{ color: "text.secondary", mt: 0.5 }}
                  />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Date of Birth
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(selectedStudent.dateOfBirth)}
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1,
                  }}
                >
                  <PersonIcon
                    fontSize="small"
                    sx={{ color: "text.secondary", mt: 0.5 }}
                  />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Parent Information
                    </Typography>
                    <Typography variant="body1">
                      {selectedStudent.parentName || "Not provided"}
                    </Typography>
                    {selectedStudent.parentPhone && (
                      <Typography variant="body2" color="text.secondary">
                        Phone: {selectedStudent.parentPhone}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Academic Information */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%", borderRadius: 2 }}>
            <CardContent>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  fontWeight: 600,
                  color: "primary.main",
                }}
              >
                <SchoolIcon fontSize="small" />
                Academic Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={2}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1,
                  }}
                >
                  <SchoolIcon
                    fontSize="small"
                    sx={{ color: "text.secondary", mt: 0.5 }}
                  />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Standard
                    </Typography>
                    <Typography variant="body1">
                      {getRelatedData(
                        selectedStudent.standard?._id ||
                          selectedStudent.standard,
                        standards
                      )?.name || "Not assigned"}
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1,
                  }}
                >
                  <SchoolIcon
                    fontSize="small"
                    sx={{ color: "text.secondary", mt: 0.5 }}
                  />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      School & Board
                    </Typography>
                    <Typography variant="body1">
                      {selectedStudent.schoolName || "Not provided"}
                    </Typography>
                    {selectedStudent.board && (
                      <Typography variant="body2" color="text.secondary">
                        Board: {selectedStudent.board}
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1,
                  }}
                >
                  <InfoIcon
                    fontSize="small"
                    sx={{ color: "text.secondary", mt: 0.5 }}
                  />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Previous Academic Performance
                    </Typography>
                    <Typography variant="body1">
                      {selectedStudent.previousPercentage
                        ? `${selectedStudent.previousPercentage}%`
                        : "Not provided"}
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1,
                  }}
                >
                  <CalendarTodayIcon
                    fontSize="small"
                    sx={{ color: "text.secondary", mt: 0.5 }}
                  />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Joining Date
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(selectedStudent.joiningDate)}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Enrolled Batches */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  fontWeight: 600,
                  color: "primary.main",
                }}
              >
                <BookIcon fontSize="small" />
                Enrolled Batches
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {selectedStudent.batches && selectedStudent.batches.length > 0 ? (
                <TableContainer
                  component={Paper}
                  sx={{
                    boxShadow: "none",
                    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                  }}
                >
                  <Table>
                    <TableHead
                      sx={{ bgcolor: alpha(theme.palette.primary.light, 0.05) }}
                    >
                      <TableRow>
                        <TableCell>Batch Name</TableCell>
                        <TableCell>Subject</TableCell>
                        <TableCell>Schedule</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedStudent.batches.map((batchId) => {
                        const batchData = getRelatedData(
                          typeof batchId === "object" ? batchId._id : batchId,
                          batches
                        );
                        return batchData ? (
                          <TableRow key={batchData._id}>
                            <TableCell>{batchData.name}</TableCell>
                            <TableCell>
                              {batchData.subject?.name || "N/A"}
                            </TableCell>
                            <TableCell>
                              {batchData.schedule?.days?.join(", ") || "N/A"}
                              <Typography
                                variant="caption"
                                display="block"
                                color="text.secondary"
                              >
                                {batchData.schedule?.startTime &&
                                batchData.schedule?.endTime
                                  ? `${formatTime(
                                      batchData.schedule.startTime
                                    )} - ${formatTime(
                                      batchData.schedule.endTime
                                    )}`
                                  : "No time specified"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={batchData.status || "N/A"}
                                size="small"
                                color={
                                  batchData.status === "active"
                                    ? "success"
                                    : batchData.status === "upcoming"
                                    ? "info"
                                    : batchData.status === "completed"
                                    ? "warning"
                                    : "default"
                                }
                                sx={{ textTransform: "capitalize" }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Tooltip title="View Batch Details">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    navigate(`/app/batches/${batchData._id}`)
                                  }
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ) : null;
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ textAlign: "center", py: 2 }}>
                  <Typography color="text.secondary">
                    Not enrolled in any batches
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
        title="Delete Student"
        content={`Are you sure you want to delete ${selectedStudent.name}? This action cannot be undone.`}
        loading={deleteLoading}
      />
    </Box>
  );
};

export default StudentView;
