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
  CircularProgress,
  TablePagination
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  School as SchoolIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Home as HomeIcon,
  Book as BookIcon,
  Person as PersonIcon,
  Event as EventIcon,
  Schedule as ScheduleIcon
} from "@mui/icons-material";
import { fetchBatches, deleteBatch } from "../../../store/slices/batchSlice";
import { fetchSubjects } from "../../../store/slices/subjectSlice";
import { fetchStandards } from "../../../store/slices/standardSlice";
import RefreshButton from "../../../components/common/RefreshButton";
import DeleteConfirmationDialog from "../../../components/common/DeleteConfirmationDialog";
import Swal from 'sweetalert2';

const BatchList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { batches, loading } = useSelector((state) => state.batches);
  const { subjects } = useSelector((state) => state.subjects);
  const { standards } = useSelector((state) => state.standards);

  const [nameFilter, setNameFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [standardFilter, setStandardFilter] = useState("");
  const [filteredBatches, setFilteredBatches] = useState([]);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10);

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Format time to AM/PM format
  const formatTime = (timeString) => {
    if (!timeString) return "";
    try {
      if (timeString.includes(":")) {
        const [hours, minutes] = timeString.split(":");
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? "PM" : "AM";
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
      }
      return timeString;
    } catch (error) {
      return timeString;
    }
  };

  useEffect(() => {
    dispatch(fetchBatches());
    dispatch(fetchSubjects());
    dispatch(fetchStandards());
  }, [dispatch]);

  useEffect(() => {
    if (!batches) return;

    let results = [...batches];

    if (nameFilter) {
      results = results.filter((batch) =>
        batch.name.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }

    if (subjectFilter) {
      results = results.filter(
        (batch) => batch.subject && batch.subject._id === subjectFilter
      );
    }

    if (standardFilter) {
      results = results.filter(
        (batch) => batch.standard && batch.standard._id === standardFilter
      );
    }

    setFilteredBatches(results);
  }, [batches, nameFilter, subjectFilter, standardFilter]);

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get paginated data
  const getPaginatedData = () => {
    return filteredBatches.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  };

  // Clear filters
  const clearFilters = () => {
    setNameFilter("");
    setSubjectFilter("");
    setStandardFilter("");
  };

  const openDeleteDialog = (batch) => {
    Swal.fire({
      title: 'Delete Batch',
      text: `Are you sure you want to delete "${batch.name}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: theme.palette.error.main,
      cancelButtonColor: theme.palette.grey[500],
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        confirmDelete(batch._id);
      }
    });
  };

  const confirmDelete = async (batchId) => {
    try {
      setDeleteLoading(true);
      await dispatch(deleteBatch(batchId)).unwrap();

      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Batch has been deleted successfully.',
        confirmButtonColor: theme.palette.primary.main,
        timer: 2000
      });
    } catch (error) {
      console.error("Failed to delete batch:", error);

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Failed to delete batch: ${error.message || "Unknown error"}`,
        confirmButtonColor: theme.palette.primary.main
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "upcoming":
        return "warning";
      case "completed":
        return "error";
      default:
        return "default";
    }
  };

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
          <SchoolIcon sx={{ mr: 0.5 }} fontSize="small" />
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
                startAdornment: <SearchIcon sx={{ color: "text.secondary", mr: 1 }} />,
                endAdornment: nameFilter ? (
                  <IconButton
                    size="small"
                    onClick={() => setNameFilter("")}
                    edge="end"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                ) : null,
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "background.paper",
                  borderRadius: 2,
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
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
          <Grid item xs={12} sm={6} md={3}>
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
          <Grid item xs={12} sm={6} md={2} sx={{ display: "flex", alignItems: "center" }}>
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={clearFilters}
              disabled={!nameFilter && !subjectFilter && !standardFilter}
              size="medium"
              sx={{ borderRadius: 1.5, height: "100%" }}
              fullWidth
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>

        {/* Batch count */}
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            {filteredBatches.length === 0
              ? "No batches found"
              : `Showing ${filteredBatches.length} batch${filteredBatches.length !== 1 ? 'es' : ''}`}
            {(nameFilter || subjectFilter || standardFilter) && " matching filters"}
          </Typography>
        </Box>
      </Paper>

      {/* Mobile view with cards */}
      {isMobile ? (
        <Box>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
              <CircularProgress size={28} sx={{ mr: 2 }} />
              <Typography variant="body1">Loading batches...</Typography>
            </Box>
          ) : filteredBatches.length === 0 ? (
            <Paper sx={{ textAlign: "center", py: 4, px: 2, borderRadius: 2, boxShadow: 2 }}>
              <Typography color="text.secondary" sx={{ mb: 2, fontWeight: 500 }}>
                No batches found matching your filters
              </Typography>
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={clearFilters}
                size="small"
              >
                Clear Filters
              </Button>
            </Paper>
          ) : (
            <Stack spacing={2}>
              {getPaginatedData().map((batch) => (
                <Card
                  key={batch._id}
                  sx={{
                    width: "100%",
                    borderRadius: 2,
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: 3,
                    },
                    overflow: "hidden",
                    borderLeft: `4px solid ${theme.palette.primary.main}`
                  }}
                  elevation={2}
                >
                  <CardContent sx={{ pb: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          fontSize: "1.1rem",
                          color: "primary.main",
                        }}
                      >
                        {batch.name}
                      </Typography>
                      <Chip
                        label={batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
                        color={getStatusColor(batch.status)}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontWeight: 500,
                          backgroundColor: (theme) => {
                            const color = getStatusColor(batch.status);
                            return alpha(theme.palette[color]?.main || '#e0e0e0', 0.08);
                          },
                          borderColor: (theme) => {
                            const color = getStatusColor(batch.status);
                            return alpha(theme.palette[color]?.main || '#e0e0e0', 0.3);
                          }
                        }}
                      />
                    </Box>

                    <Box sx={{ mb: 1.5 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 0.5,
                        }}
                      >
                        <SchoolIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.7 }} />
                        Standard: {batch.standard?.name || "N/A"}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 0.5,
                        }}
                      >
                        <BookIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.7 }} />
                        Subject: {batch.subject?.name || "N/A"}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <PersonIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.7 }} />
                        Teacher: {batch.teacher?.name || "Not assigned"}
                      </Typography>
                    </Box>

                    {/* Schedule section */}
                    <Box sx={{ mt: 1.5 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          fontWeight: 500,
                          mb: 0.5,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <ScheduleIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.7 }} />
                        Schedule:
                      </Typography>

                      {batch.schedule && batch.schedule.length > 0 ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {batch.schedule.slice(0, 2).map((scheduleItem, index) => (
                            <Chip
                              key={index}
                              label={`${scheduleItem.day} ${formatTime(scheduleItem.startTime)}-${formatTime(scheduleItem.endTime)}`}
                              size="small"
                              color="secondary"
                              variant="outlined"
                              sx={{
                                mb: 0.5,
                                fontWeight: 400,
                                backgroundColor: alpha(theme.palette.secondary.main, 0.05)
                              }}
                            />
                          ))}
                          {batch.schedule.length > 2 && (
                            <Chip
                              label={`+${batch.schedule.length - 2} more`}
                              size="small"
                              variant="outlined"
                              sx={{ mb: 0.5 }}
                            />
                          )}
                        </Box>
                      ) : batch.startTime && batch.endTime ? (
                        <Chip
                          label={`${formatTime(batch.startTime)} - ${formatTime(batch.endTime)}`}
                          size="small"
                          color="secondary"
                          variant="outlined"
                          sx={{
                            mb: 0.5,
                            fontWeight: 400,
                            backgroundColor: alpha(theme.palette.secondary.main, 0.05)
                          }}
                        />
                      ) : batch.schedule?.startTime && batch.schedule?.endTime ? (
                        <Chip
                          label={`${formatTime(batch.schedule.startTime)} - ${formatTime(batch.schedule.endTime)}`}
                          size="small"
                          color="secondary"
                          variant="outlined"
                          sx={{
                            mb: 0.5,
                            fontWeight: 400,
                            backgroundColor: alpha(theme.palette.secondary.main, 0.05)
                          }}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          No timing information available
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                  <CardActions sx={{
                    justifyContent: "flex-end",
                    px: 2,
                    pb: 2,
                    pt: 0.5,
                    borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                  }}>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/app/batches/${batch._id}`)}
                        sx={{
                          color: "primary.main",
                          backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                          "&:hover": {
                            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.2),
                          },
                        }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/app/batches/${batch._id}/edit`)}
                        sx={{
                          color: (theme) => theme.palette.info.main,
                          backgroundColor: (theme) => alpha(theme.palette.info.main, 0.1),
                          "&:hover": {
                            backgroundColor: (theme) => alpha(theme.palette.info.main, 0.2),
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
                          backgroundColor: (theme) => alpha(theme.palette.error.main, 0.1),
                          "&:hover": {
                            backgroundColor: (theme) => alpha(theme.palette.error.main, 0.2),
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              ))}

              {/* Mobile pagination */}
              {isMobile && filteredBatches.length > 0 && (
                <TablePagination
                  component={Paper}
                  count={filteredBatches.length}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[5, 10, 25]}
                  sx={{
                    borderTop: 'none',
                    boxShadow: 2,
                    borderRadius: 2,
                    mt: 2,
                    '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                      fontWeight: 500,
                    },
                    '.MuiTablePagination-toolbar': {
                      px: 2,
                    },
                  }}
                />
              )}
            </Stack>
          )}
        </Box>
      ) : (
        // Desktop table view
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: 2,
            "& .MuiTableRow-root:last-child .MuiTableCell-body": {
              borderBottom: "none"
            }
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: (theme) => alpha(theme.palette.primary.main, 0.9) }}>
                <TableCell
                  sx={{
                    color: "common.white",
                    py: 2.5,
                    fontWeight: 600,
                    fontSize: "0.95rem"
                  }}
                >
                  Name
                </TableCell>
                <TableCell
                  sx={{
                    color: "common.white",
                    fontWeight: 600,
                    fontSize: "0.95rem"
                  }}
                >
                  Standard
                </TableCell>
                <TableCell
                  sx={{
                    color: "common.white",
                    fontWeight: 600,
                    fontSize: "0.95rem"
                  }}
                >
                  Subject
                </TableCell>
                <TableCell
                  sx={{
                    color: "common.white",
                    fontWeight: 600,
                    fontSize: "0.95rem"
                  }}
                >
                  Teacher
                </TableCell>
                <TableCell
                  sx={{
                    color: "common.white",
                    fontWeight: 600,
                    fontSize: "0.95rem"
                  }}
                >
                  Status
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    color: "common.white",
                    fontWeight: 600,
                    fontSize: "0.95rem"
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2 }}>
                      <CircularProgress size={24} sx={{ mr: 1 }} />
                      <Typography variant="body1">Loading batches...</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : filteredBatches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary" sx={{ py: 2, fontWeight: 500 }}>
                      No batches found matching your filters
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<ClearIcon />}
                      onClick={clearFilters}
                      sx={{ mt: 1 }}
                      size="small"
                    >
                      Clear Filters
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                getPaginatedData().map((batch, index) => (
                  <TableRow
                    key={batch._id}
                    sx={{
                      "&:hover": {
                        backgroundColor: (theme) =>
                          alpha(theme.palette.primary.main, 0.04),
                      },
                      backgroundColor: index % 2 === 0 ? 'inherit' : (theme) =>
                        alpha(theme.palette.background.default, 0.5),
                      transition: 'background-color 0.2s ease',
                    }}
                  >
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{
                        color: "primary.main",
                        fontWeight: 500,
                        fontSize: "0.95rem",
                        py: 2.5,
                        borderLeft: (theme) => `4px solid ${alpha(theme.palette.primary.main, 0.6)}`,
                        pl: 2
                      }}
                    >
                      {batch.name}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.95rem", py: 2.5 }}>
                      {batch.standard?.name || "N/A"}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.95rem", py: 2.5 }}>
                      {batch.subject?.name || "N/A"}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.95rem", py: 2.5 }}>
                      {batch.teacher?.name || "Not assigned"}
                    </TableCell>
                    <TableCell sx={{ py: 2.5 }}>
                      <Chip
                        label={batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
                        color={getStatusColor(batch.status)}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontWeight: 500,
                          backgroundColor: (theme) => {
                            const color = getStatusColor(batch.status);
                            return alpha(theme.palette[color]?.main || '#e0e0e0', 0.08);
                          },
                          borderColor: (theme) => {
                            const color = getStatusColor(batch.status);
                            return alpha(theme.palette[color]?.main || '#e0e0e0', 0.3);
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ py: 2.5 }}>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          justifyContent: "center",
                        }}
                      >
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/app/batches/${batch._id}`)}
                            sx={{
                              color: "primary.main",
                              backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                              "&:hover": {
                                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.2),
                              },
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/app/batches/${batch._id}/edit`)}
                            sx={{
                              color: (theme) => theme.palette.info.main,
                              backgroundColor: (theme) => alpha(theme.palette.info.main, 0.1),
                              "&:hover": {
                                backgroundColor: (theme) => alpha(theme.palette.info.main, 0.2),
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
                              backgroundColor: (theme) => alpha(theme.palette.error.main, 0.1),
                              "&:hover": {
                                backgroundColor: (theme) => alpha(theme.palette.error.main, 0.2),
                              },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Desktop pagination */}
          {!isMobile && filteredBatches.length > 0 && (
            <TablePagination
              component="div"
              count={filteredBatches.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
              sx={{
                borderTop: 'none',
                '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                  fontWeight: 500,
                },
              }}
            />
          )}
        </TableContainer>
      )}
    </Box>
  );
};

export default BatchList;
