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
  Breadcrumbs,
  Link,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  Home as HomeIcon,
  Class as ClassIcon,
} from "@mui/icons-material";
import { fetchBatches, deleteBatch } from "../../../store/slices/batchSlice";
import { fetchStandards } from "../../../store/slices/standardSlice";
import { fetchSubjects } from "../../../store/slices/subjectSlice";
import { fetchTeachers } from "../../../store/slices/teacherSlice";
import DeleteConfirmationDialog from "../../../components/common/DeleteConfirmationDialog";
import RefreshButton from "../../../components/common/RefreshButton";

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

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  const openDeleteDialog = (batch) => {
    setBatchToDelete(batch);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setBatchToDelete(null);
  };

  const confirmDelete = async () => {
    if (!batchToDelete) return;

    try {
      setDeleteLoading(true);
      await dispatch(deleteBatch(batchToDelete._id)).unwrap();
      closeDeleteDialog();
    } catch (error) {
      alert("Failed to delete batch: " + error.message);
    } finally {
      setDeleteLoading(false);
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
      {/* Breadcrumbs */}
      <Breadcrumbs
        aria-label="breadcrumb"
        sx={{ mb: 2, mt: 1 }}
        separator="›"
      >
        <Link
          underline="hover"
          color="inherit"
          href="/app/dashboard"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
          Dashboard
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <ClassIcon sx={{ mr: 0.5 }} fontSize="small" />
          Batches
        </Typography>
      </Breadcrumbs>

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
          <Box sx={{ display: "flex", gap: 1 }}>
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
            <RefreshButton
              onRefresh={() => dispatch(fetchBatches())}
              loading={loading}
              tooltip="Refresh batches list"
            />
          </Box>
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
                endAdornment: (
                  <SearchIcon sx={{ color: "text.secondary", ml: 1 }} />
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
                  onClick={() => openDeleteDialog(batch)}
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
                          onClick={() => openDeleteDialog(batch)}
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

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
        loading={deleteLoading}
        itemName={batchToDelete?.name}
        title="Delete Batch"
        message="Are you sure you want to delete batch"
      />
    </Box>
  );
};

export default BatchList;
