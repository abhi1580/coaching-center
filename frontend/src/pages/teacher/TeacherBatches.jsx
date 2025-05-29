import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  TextField,
  InputAdornment,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  Paper,
  Divider,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Class as ClassIcon,
  Schedule as ScheduleIcon,
  CalendarMonth as CalendarIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import api from "../../services/common/apiClient";

function TeacherBatches() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useSelector((state) => state.auth);
  const [batches, setBatches] = useState([]);
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [standardFilter, setStandardFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");

  // Lists for filters
  const [standards, setStandards] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const fetchTeacherBatches = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use the configured API client
        const response = await api.get("/teacher/batches", {
          params: {
            populate: "enrolledStudents"
          }
        });

        const batchesData = response.data.data || response.data || [];
        setBatches(batchesData);
        setFilteredBatches(batchesData);

        // Extract unique standards and subjects for filters
        const uniqueStandards = [
          ...new Set(batchesData.map((batch) => batch.standard?.name || "")),
        ];
        const uniqueSubjects = [
          ...new Set(batchesData.map((batch) => batch.subject?.name || "")),
        ];

        setStandards(uniqueStandards);
        setSubjects(uniqueSubjects);

      } catch (err) {
        console.error("Error fetching teacher batches:", err);
        setError(err.response?.data?.message || "Failed to load batches");
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherBatches();
  }, [user]);

  // Apply filters when any filter changes
  useEffect(() => {
    if (!batches.length) {
      setFilteredBatches([]);
      return;
    }

    let filtered = [...batches];

    // Apply text search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (batch) =>
          batch.name?.toLowerCase().includes(query) ||
          batch.standard?.name?.toLowerCase().includes(query) ||
          batch.subject?.name?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter((batch) => batch.status === statusFilter);
    }

    // Apply standard filter
    if (standardFilter) {
      filtered = filtered.filter(
        (batch) => batch.standard?.name === standardFilter
      );
    }

    // Apply subject filter
    if (subjectFilter) {
      filtered = filtered.filter(
        (batch) => batch.subject?.name === subjectFilter
      );
    }

    setFilteredBatches(filtered);
  }, [batches, searchQuery, statusFilter, standardFilter, subjectFilter]);

  const handleViewBatch = (batchId) => {
    navigate(`/app/teacher/batches/${batchId}`);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "ongoing":
        return "success";
      case "upcoming":
        return "warning";
      case "completed":
        return "error";
      default:
        return "default";
    }
  };

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
      0: "Sun",
      1: "Mon",
      2: "Tue",
      3: "Wed",
      4: "Thu",
      5: "Fri",
      6: "Sat",
    };

    return daysArray.map((day) => dayNames[day] || day).join(", ");
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
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header section */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          backgroundColor: (theme) => alpha(theme.palette.primary.light, 0.05),
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontSize: { xs: "1.5rem", sm: "2rem" },
            fontWeight: 600,
            color: "primary.main",
            mb: 1,
          }}
        >
          My Batches
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage and view all your assigned batches
        </Typography>
      </Paper>

      {/* Filters section */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search batches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 },
              }}
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={8}>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="">All Status</MenuItem>
                    <MenuItem value="ongoing">Ongoing</MenuItem>
                    <MenuItem value="upcoming">Upcoming</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Standard</InputLabel>
                  <Select
                    value={standardFilter}
                    label="Standard"
                    onChange={(e) => setStandardFilter(e.target.value)}
                  >
                    <MenuItem value="">All Standards</MenuItem>
                    {standards.map((standard) => (
                      <MenuItem key={standard} value={standard}>
                        {standard}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Subject</InputLabel>
                  <Select
                    value={subjectFilter}
                    label="Subject"
                    onChange={(e) => setSubjectFilter(e.target.value)}
                  >
                    <MenuItem value="">All Subjects</MenuItem>
                    {subjects.map((subject) => (
                      <MenuItem key={subject} value={subject}>
                        {subject}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      {/* Batches grid */}
      {filteredBatches.length === 0 ? (
        <Paper
          sx={{
            p: 3,
            textAlign: "center",
            borderRadius: 2,
            bgcolor: alpha(theme.palette.background.paper, 0.7),
          }}
        >
          <ClassIcon
            color="disabled"
            sx={{ fontSize: 48, mb: 2, opacity: 0.6 }}
          />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No batches found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {batches.length === 0
              ? "You don't have any assigned batches yet."
              : "No batches match your current filter criteria. Try changing your filters."}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredBatches.map((batch) => (
            <Grid item xs={12} sm={6} md={4} key={batch._id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 2,
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4,
                  },
                }}
              >
                <Box
                  sx={{
                    bgcolor: alpha(
                      theme.palette[getStatusColor(batch.status)].light,
                      0.2
                    ),
                    p: 1,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Chip
                    label={batch.status || "Unknown"}
                    color={getStatusColor(batch.status)}
                    size="small"
                  />
                  <Typography variant="caption" color="text.secondary">
                    {batch.enrolledStudents?.length || 0} students
                  </Typography>
                </Box>

                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography
                    variant="h6"
                    component="h2"
                    gutterBottom
                    sx={{
                      color: "primary.main",
                      fontWeight: 600,
                      display: "-webkit-box",
                      overflow: "hidden",
                      WebkitBoxOrient: "vertical",
                      WebkitLineClamp: 1,
                    }}
                  >
                    {batch.name}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      <strong>Standard:</strong>{" "}
                      {batch.standard?.name || "Not specified"}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      <strong>Subject:</strong>{" "}
                      {batch.subject?.name || "Not specified"}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 1 }} />

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <ScheduleIcon
                      fontSize="small"
                      sx={{ color: "text.secondary", mr: 1 }}
                    />
                    <Typography variant="body2">
                      {formatTime(batch.schedule?.startTime)} -{" "}
                      {formatTime(batch.schedule?.endTime)}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <CalendarIcon
                      fontSize="small"
                      sx={{ color: "text.secondary", mr: 1 }}
                    />
                    <Typography variant="body2">
                      {formatDays(batch.schedule?.days)}
                    </Typography>
                  </Box>
                </CardContent>

                <CardActions sx={{ justifyContent: "flex-end", p: 2, pt: 0 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={() => handleViewBatch(batch._id)}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default TeacherBatches;
