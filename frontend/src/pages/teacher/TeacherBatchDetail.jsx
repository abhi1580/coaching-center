import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  Chip,
  Avatar,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Breadcrumbs,
  Link,
  useTheme,
  alpha,
  useMediaQuery,
  Stack,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  AccessTime as AccessTimeIcon,
  CalendarToday as CalendarTodayIcon,
  LocationOn as LocationOnIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Book as BookIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
} from "@mui/icons-material";
import axios from "axios";

function TeacherBatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBatchDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication required");
          setLoading(false);
          return;
        }

        // Make API request to fetch batch details using environment variables
        const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const response = await axios.get(
          `${baseUrl}/batches/${id}?populate=enrolledStudents`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setBatch(response.data.data || response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching batch details:", err);
        setError(
          err.response?.data?.message || "Failed to load batch details"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBatchDetails();
    }
  }, [id]);

  // Format time function
  const formatTime = (timeString) => {
    if (!timeString) return "Not scheduled";

    try {
      const options = { hour: "2-digit", minute: "2-digit" };
      return new Date(`2000-01-01T${timeString}`).toLocaleTimeString(
        [],
        options
      );
    } catch (error) {
      return timeString;
    }
  };

  // Format days function
  const formatDays = (daysArray) => {
    if (!daysArray || !Array.isArray(daysArray) || daysArray.length === 0) {
      return "No days set";
    }

    const dayNames = {
      0: "Sunday",
      1: "Monday",
      2: "Tuesday",
      3: "Wednesday",
      4: "Thursday",
      5: "Friday",
      6: "Saturday",
    };

    return daysArray.map((day) => dayNames[day] || day).join(", ");
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "success";
      case "upcoming":
        return "info";
      case "completed":
        return "warning";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  // Generate student initials for Avatar
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/app/teacher/batches")}
          sx={{ mt: 2 }}
        >
          Back to Batches
        </Button>
      </Box>
    );
  }

  if (!batch) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">Batch not found</Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/app/teacher/batches")}
          sx={{ mt: 2 }}
        >
          Back to Batches
        </Button>
      </Box>
    );
  }

  // Mobile view for student list
  const StudentMobileList = () => (
    <List sx={{ width: '100%', p: 0 }}>
      {batch.enrolledStudents.map((student) => (
        <ListItem
          key={student._id}
          alignItems="flex-start"
          sx={{
            flexDirection: 'column',
            alignItems: 'flex-start',
            borderBottom: '1px solid',
            borderColor: 'divider',
            py: 2
          }}
        >
          <Box sx={{ display: 'flex', width: '100%', mb: 1 }}>
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: (theme) => alpha(theme.palette.primary.main, 0.8) }}>
                {getInitials(student.name)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={student.name}
              secondary={student.studentId || "ID: N/A"}
            />
          </Box>

          <Box sx={{ pl: 9, width: '100%' }}>
            <Stack spacing={1}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <SchoolIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
                <Typography variant="body2">
                  {student.standard?.name || student.standard || "N/A"}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center" }}>
                <EmailIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                  {student.email}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center" }}>
                <PhoneIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
                <Typography variant="body2">
                  {student.phone || "N/A"}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </ListItem>
      ))}
    </List>
  );

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2, mt: 1 }} separator="›" aria-label="breadcrumb">
        <Link
          underline="hover"
          color="inherit"
          onClick={() => navigate("/app/teacher/batches")}
          sx={{ cursor: "pointer", display: 'flex', alignItems: 'center' }}
        >
          <SchoolIcon sx={{ mr: 0.5 }} fontSize="small" />
          My Batches
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          {batch.name}
        </Typography>
      </Breadcrumbs>

      {/* Batch header */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 2,
          backgroundColor: (theme) => alpha(theme.palette.primary.light, 0.07),
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: isMobile ? "center" : "flex-start",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Box sx={{ width: isMobile ? "100%" : "auto" }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontSize: { xs: "1.25rem", sm: "1.5rem", md: "2rem" },
                fontWeight: 600,
                color: "primary.main",
                mb: 1,
                pr: isMobile ? 10 : 0, // Make room for status chip
              }}
            >
              {batch.name}
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <BookIcon
                fontSize="small"
                sx={{ mr: 1, color: "text.secondary" }}
              />
              <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                {batch.subject?.name || "No subject specified"}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center" }}>
              <SchoolIcon
                fontSize="small"
                sx={{ mr: 1, color: "text.secondary" }}
              />
              <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                {batch.standard?.name || "No standard specified"}
              </Typography>
            </Box>
          </Box>

          <Chip
            label={batch.status || "Unknown"}
            color={getStatusColor(batch.status)}
            sx={{
              fontWeight: "medium",
              position: isMobile ? "absolute" : "relative",
              top: isMobile ? 16 : "auto",
              right: isMobile ? 16 : "auto"
            }}
            size={isMobile ? "small" : "medium"}
          />
        </Box>
      </Paper>

      {/* Batch details */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Left side - Basic details */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, height: "100%" }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography
                variant="h6"
                component="h2"
                gutterBottom
                color="primary.main"
                sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
              >
                Schedule Details
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={2}>
                <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                  <AccessTimeIcon sx={{ mr: 2, color: "text.secondary", mt: 0.5 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Time
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                      {formatTime(batch.schedule?.startTime)} -{" "}
                      {formatTime(batch.schedule?.endTime)}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                  <CalendarTodayIcon
                    sx={{ mr: 2, color: "text.secondary", mt: 0.5 }}
                  />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Days
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                      {formatDays(batch.schedule?.days)}
                    </Typography>
                  </Box>
                </Box>

                {batch.location && (
                  <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                    <LocationOnIcon sx={{ mr: 2, color: "text.secondary", mt: 0.5 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Location
                      </Typography>
                      <Typography variant="body1" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        {batch.location}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Stack>

              {batch.description && (
                <>
                  <Typography
                    variant="h6"
                    component="h2"
                    gutterBottom
                    color="primary.main"
                    sx={{ mt: 3, fontSize: { xs: '1rem', sm: '1.25rem' } }}
                  >
                    Description
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body1" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    {batch.description}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right side - Student count and additional info */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, height: "100%" }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography
                variant="h6"
                component="h2"
                gutterBottom
                color="primary.main"
                sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
              >
                Class Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={2}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <PersonIcon sx={{ mr: 2, color: "text.secondary" }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total Students
                    </Typography>
                    <Typography
                      variant="h5"
                      color="primary.main"
                      sx={{ fontWeight: "medium", fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
                    >
                      {batch.enrolledStudents?.length || 0}
                    </Typography>
                  </Box>
                </Box>

                {batch.maxCapacity && (
                  <Box sx={{ display: "flex", alignItems: "flex-start", pl: 5 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Maximum Capacity
                      </Typography>
                      <Typography variant="body1" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        {batch.maxCapacity} students
                      </Typography>
                    </Box>
                  </Box>
                )}

                {batch.fee && (
                  <Box sx={{ display: "flex", alignItems: "flex-start", pl: 5 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Fee
                      </Typography>
                      <Typography variant="body1" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        ₹{batch.fee}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {batch.startDate && (
                  <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                    <CalendarTodayIcon sx={{ mr: 2, color: "text.secondary" }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Start Date
                      </Typography>
                      <Typography variant="body1" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        {new Date(batch.startDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {batch.endDate && (
                  <Box sx={{ display: "flex", alignItems: "flex-start", pl: 5 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        End Date
                      </Typography>
                      <Typography variant="body1" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        {new Date(batch.endDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Students list */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
        <Typography
          variant="h5"
          component="h2"
          sx={{
            mb: 2,
            fontWeight: 600,
            color: "primary.main",
            fontSize: { xs: '1.25rem', sm: '1.5rem' }
          }}
        >
          Enrolled Students
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {!batch.enrolledStudents || batch.enrolledStudents.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <SchoolIcon sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No students enrolled yet
            </Typography>
          </Box>
        ) : isMobile ? (
          <StudentMobileList />
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>StudentID</TableCell>
                  <TableCell>Standard</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {batch.enrolledStudents.map((student) => (
                  <TableRow key={student._id} hover>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Avatar
                          sx={{
                            bgcolor: (theme) =>
                              alpha(theme.palette.primary.main, 0.8),
                            mr: 2,
                          }}
                        >
                          {getInitials(student.name)}
                        </Avatar>
                        <Typography>{student.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{student.studentId || "N/A"}</TableCell>
                    <TableCell>
                      {student.standard?.name || student.standard || "N/A"}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <EmailIcon
                          fontSize="small"
                          sx={{ mr: 1, color: "text.secondary" }}
                        />
                        {student.email}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <PhoneIcon
                          fontSize="small"
                          sx={{ mr: 1, color: "text.secondary" }}
                        />
                        {student.phone || "N/A"}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
}

export default TeacherBatchDetail;
