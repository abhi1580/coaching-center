import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  IconButton,
  TextField,
  MenuItem,
  Grid,
  useTheme,
  useMediaQuery,
  alpha,
  Card,
  CardContent,
  CardActions,
  Stack,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { fetchBatches, deleteBatch } from "../../../store/slices/batchSlice";
import { fetchStandards } from "../../../store/slices/standardSlice";
import { fetchSubjects } from "../../../store/slices/subjectSlice";
import { fetchTeachers } from "../../../store/slices/teacherSlice";

const BatchList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const { batches, loading } = useSelector((state) => state.batches);
  const { standards } = useSelector((state) => state.standards);
  const { subjects } = useSelector((state) => state.subjects);
  const { teachers } = useSelector((state) => state.teachers);

  const [filteredBatches, setFilteredBatches] = useState([]);
  const [nameFilter, setNameFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [standardFilter, setStandardFilter] = useState("");
  const [teacherFilter, setTeacherFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Load initial data
  useEffect(() => {
    dispatch(fetchBatches());
    dispatch(fetchStandards());
    dispatch(fetchSubjects());
    dispatch(fetchTeachers());
  }, [dispatch]);

  // Apply filters
  useEffect(() => {
    if (!batches) {
      setFilteredBatches([]);
      return;
    }

    let results = [...batches];

    if (nameFilter) {
      results = results.filter((batch) =>
        batch.name?.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }

    if (subjectFilter) {
      results = results.filter(
        (batch) =>
          batch.subject?._id === subjectFilter ||
          batch.subject === subjectFilter
      );
    }

    if (standardFilter) {
      results = results.filter(
        (batch) =>
          batch.standard?._id === standardFilter ||
          batch.standard === standardFilter
      );
    }

    if (teacherFilter) {
      results = results.filter(
        (batch) =>
          batch.teacher?._id === teacherFilter ||
          batch.teacher === teacherFilter
      );
    }

    if (statusFilter) {
      results = results.filter((batch) => batch.status === statusFilter);
    }

    setFilteredBatches(results);
  }, [
    batches,
    nameFilter,
    subjectFilter,
    standardFilter,
    teacherFilter,
    statusFilter,
  ]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this batch?")) {
      try {
        await dispatch(deleteBatch(id)).unwrap();
      } catch (error) {
        alert("Failed to delete batch: " + error.message);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
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

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header section with enhanced styling */}
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
            mb: 3,
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontSize: { xs: "1.5rem", sm: "2rem" },
              fontWeight: 600,
              color: "primary.main",
            }}
          >
            Batches
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/app/batches/create")}
            sx={{
              borderRadius: 2,
              boxShadow: 2,
              "&:hover": {
                boxShadow: 4,
              },
            }}
          >
            Add Batch
          </Button>
        </Box>

        {/* Enhanced filters section */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Search by Name"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              InputProps={{
                startAdornment: (
                  <SearchIcon sx={{ color: "text.secondary", mr: 1 }} />
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "background.paper",
                  borderRadius: 2,
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              select
              fullWidth
              label="Filter by Subject"
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "background.paper",
                  borderRadius: 2,
                },
              }}
            >
              <MenuItem value="">All Subjects</MenuItem>
              {subjects.map((subject) => (
                <MenuItem key={subject._id} value={subject._id}>
                  {subject.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              select
              fullWidth
              label="Filter by Standard"
              value={standardFilter}
              onChange={(e) => setStandardFilter(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "background.paper",
                  borderRadius: 2,
                },
              }}
            >
              <MenuItem value="">All Standards</MenuItem>
              {standards.map((standard) => (
                <MenuItem key={standard._id} value={standard._id}>
                  {standard.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Mobile view with cards */}
      {isMobile ? (
        <Stack spacing={2}>
          {filteredBatches.map((batch) => (
            <Card
              key={batch._id}
              sx={{
                borderRadius: 2,
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: 4,
                },
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" component="h2" gutterBottom>
                    {batch.name}
                  </Typography>
                  <Chip
                    label={
                      batch.status.charAt(0).toUpperCase() +
                      batch.status.slice(1)
                    }
                    color={getStatusColor(batch.status)}
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                </Box>

                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Standard:
                    </Typography>
                    <Typography variant="body2">
                      {batch.standard?.name || "N/A"}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Subject:
                    </Typography>
                    <Typography variant="body2">
                      {batch.subject?.name || "N/A"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Teacher:
                    </Typography>
                    <Typography variant="body2">
                      {batch.teacher?.name || "Not assigned"}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>

              <CardActions sx={{ px: 2, pb: 2 }}>
                <Button
                  size="small"
                  startIcon={<VisibilityIcon />}
                  onClick={() => navigate(`/app/batches/${batch._id}`)}
                  sx={{ borderRadius: 1.5 }}
                >
                  View
                </Button>
                <Button
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => navigate(`/app/batches/${batch._id}/edit`)}
                  sx={{ borderRadius: 1.5 }}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleDelete(batch._id)}
                  sx={{ borderRadius: 1.5, ml: "auto" }}
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          ))}
          {filteredBatches.length === 0 && (
            <Paper sx={{ p: 3, textAlign: "center", borderRadius: 2 }}>
              <Typography color="text.secondary">No batches found</Typography>
            </Paper>
          )}
        </Stack>
      ) : (
        // Desktop view with enhanced table
        <TableContainer
          component={Paper}
          sx={{ borderRadius: 2, overflow: "hidden" }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "primary.main" }}>
                <TableCell sx={{ color: "common.white", py: 2 }}>
                  Name
                </TableCell>
                <TableCell sx={{ color: "common.white" }}>Standard</TableCell>
                <TableCell sx={{ color: "common.white" }}>Subject</TableCell>
                {!isTablet && (
                  <TableCell sx={{ color: "common.white" }}>Teacher</TableCell>
                )}
                <TableCell sx={{ color: "common.white" }}>Status</TableCell>
                <TableCell sx={{ color: "common.white" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBatches.map((batch) => (
                <TableRow
                  key={batch._id}
                  sx={{
                    "&:hover": {
                      backgroundColor: (theme) =>
                        alpha(theme.palette.primary.main, 0.04),
                    },
                  }}
                >
                  <TableCell>{batch.name}</TableCell>
                  <TableCell>{batch.standard?.name}</TableCell>
                  <TableCell>{batch.subject?.name}</TableCell>
                  {!isTablet && (
                    <TableCell>
                      {batch.teacher?.name || "Not assigned"}
                    </TableCell>
                  )}
                  <TableCell>
                    <Chip
                      label={
                        batch.status.charAt(0).toUpperCase() +
                        batch.status.slice(1)
                      }
                      color={getStatusColor(batch.status)}
                      size="small"
                      sx={{ fontWeight: 500 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/app/batches/${batch._id}`)}
                          sx={{
                            color: "primary.main",
                            "&:hover": {
                              backgroundColor: (theme) =>
                                alpha(theme.palette.primary.main, 0.1),
                            },
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() =>
                            navigate(`/app/batches/${batch._id}/edit`)
                          }
                          sx={{
                            color: "primary.main",
                            "&:hover": {
                              backgroundColor: (theme) =>
                                alpha(theme.palette.primary.main, 0.1),
                            },
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(batch._id)}
                          sx={{
                            color: "error.main",
                            "&:hover": {
                              backgroundColor: (theme) =>
                                alpha(theme.palette.error.main, 0.1),
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {filteredBatches.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={isTablet ? 5 : 6}
                    align="center"
                    sx={{ py: 4 }}
                  >
                    <Typography color="text.secondary">
                      No batches found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default BatchList;
