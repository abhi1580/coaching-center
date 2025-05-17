import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  TablePagination,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Home as HomeIcon,
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Book as BookIcon,
} from "@mui/icons-material";
import {
  fetchTeachers,
  deleteTeacher,
} from "../../../store/slices/teacherSlice";
import { fetchSubjects } from "../../../store/slices/subjectSlice";
import RefreshButton from "../../../components/common/RefreshButton";
import Swal from 'sweetalert2';

const TeacherList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const { teachers, loading } = useSelector((state) => state.teachers);
  const { subjects } = useSelector((state) => state.subjects);

  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [nameFilter, setNameFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [filterExpanded, setFilterExpanded] = useState(false);

  // Add pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10);

  // Delete confirmation state
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Clear filters
  const clearFilters = () => {
    setNameFilter("");
    setSubjectFilter("");
    setStatusFilter("");
  };

  // Load data
  const loadAllData = useCallback(() => {
    dispatch(fetchTeachers());
    dispatch(fetchSubjects());
  }, [dispatch]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

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
    return filteredTeachers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  };

  // Filter teachers
  useEffect(() => {
    if (!teachers || !Array.isArray(teachers)) {
      setFilteredTeachers([]);
      return;
    }

    let results = [...teachers];

    // Filter by name or email
    if (nameFilter) {
      const searchTerm = nameFilter.toLowerCase();
      results = results.filter(
        (teacher) =>
          teacher.name?.toLowerCase().includes(searchTerm) ||
          teacher.email?.toLowerCase().includes(searchTerm) ||
          teacher.phone?.includes(searchTerm)
      );
    }

    // Filter by subject
    if (subjectFilter) {
      results = results.filter((teacher) => {
        if (!teacher.subjects) return false;
        return teacher.subjects.some(
          (subject) =>
            (typeof subject === "object" && subject._id === subjectFilter) ||
            subject === subjectFilter
        );
      });
    }

    // Filter by status
    if (statusFilter) {
      results = results.filter((teacher) => teacher.status === statusFilter);
    }

    setFilteredTeachers(results);
  }, [teachers, nameFilter, subjectFilter, statusFilter]);

  // Delete handler
  const handleDeleteClick = (teacher) => {
    Swal.fire({
      title: 'Delete Teacher',
      text: `Are you sure you want to delete ${teacher.name}? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: theme.palette.error.main,
      cancelButtonColor: theme.palette.grey[500],
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        handleDeleteConfirm(teacher);
      }
    });
  };

  const handleDeleteConfirm = async (teacherToDelete) => {
    if (!teacherToDelete) return;

    setDeleteLoading(true);
    try {
      await dispatch(deleteTeacher(teacherToDelete._id)).unwrap();

      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: `${teacherToDelete.name} has been removed successfully.`,
        confirmButtonColor: theme.palette.primary.main,
        timer: 2000
      });

    } catch (error) {
      console.error("Error deleting teacher:", error);

      Swal.fire({
        icon: 'error',
        title: 'Delete Failed',
        text: error.message || 'An unknown error occurred while deleting the teacher.',
        confirmButtonColor: theme.palette.primary.main
      });

    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2, mt: 1 }} separator="›">
        <RouterLink
          to="/app/dashboard"
          style={{ display: "flex", alignItems: "center", textDecoration: 'none', color: 'inherit' }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
          Dashboard
        </RouterLink>
        <Typography
          color="text.primary"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <PersonIcon sx={{ mr: 0.5 }} fontSize="small" />
          Teachers
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
            Teachers
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate("/app/teachers/create")}
              sx={{
                borderRadius: 2,
                boxShadow: 2,
                "&:hover": {
                  boxShadow: 4,
                },
              }}
            >
              Add Teacher
            </Button>
            <RefreshButton
              onRefresh={loadAllData}
              loading={loading}
              tooltip="Refresh teachers list"
            />
          </Box>
        </Box>

        {/* Filter section */}
        <Accordion
          expanded={filterExpanded}
          onChange={() => setFilterExpanded(!filterExpanded)}
          disableGutters
          elevation={0}
          sx={{
            bgcolor: "transparent",
            "&:before": { display: "none" },
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            borderRadius: 2,
            mb: 2,
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              minHeight: 50,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.03),
              "&:hover": {
                bgcolor: alpha(theme.palette.primary.main, 0.05),
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <FilterIcon sx={{ mr: 1, color: "primary.main" }} />
              <Typography variant="subtitle1" fontWeight={500}>
                Filters
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2} sx={{ mt: 1, mb: 1 }}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  label="By name or email"
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        {nameFilter && (
                          <IconButton
                            size="small"
                            onClick={() => setNameFilter("")}
                            edge="end"
                          >
                            <ClearIcon fontSize="small" />
                          </IconButton>
                        )}
                        <SearchIcon
                          fontSize="small"
                          sx={{ ml: 1, color: "action.active" }}
                        />
                      </Box>
                    ),
                  }}
                  sx={{ bgcolor: "background.paper" }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  select
                  variant="outlined"
                  size="small"
                  label="Filter by subject"
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  sx={{ bgcolor: "background.paper" }}
                >
                  <MenuItem value="">All Subjects</MenuItem>
                  {subjects &&
                    subjects.map((subject) => (
                      <MenuItem key={subject._id} value={subject._id}>
                        {subject.name}
                      </MenuItem>
                    ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  select
                  variant="outlined"
                  size="small"
                  label="Filter by status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{ bgcolor: "background.paper" }}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={2} sx={{ display: "flex" }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={clearFilters}
                  fullWidth
                  startIcon={<ClearIcon />}
                  disabled={!nameFilter && !subjectFilter && !statusFilter}
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Refresh button */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}></Box>
      </Paper>

      {/* Teachers List */}
      {isMobile ? (
        // Mobile card view
        <Box>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
              <CircularProgress size={28} sx={{ mr: 2 }} />
              <Typography variant="body1">Loading teachers...</Typography>
            </Box>
          ) : filteredTeachers.length === 0 ? (
            <Paper sx={{ textAlign: "center", py: 4, px: 2, borderRadius: 2, boxShadow: 2 }}>
              <Typography color="text.secondary" sx={{ mb: 2, fontWeight: 500 }}>
                No teachers found matching your filters
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
              {getPaginatedData().map((teacher) => (
                <Card
                  key={teacher._id}
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
                        {teacher.name}
                      </Typography>
                      <Chip
                        label={teacher.status === "inactive" ? "Inactive" : "Active"}
                        color={teacher.status === "inactive" ? "default" : "success"}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontWeight: 500,
                          backgroundColor: theme => teacher.status === "inactive"
                            ? alpha(theme.palette.grey[500], 0.08)
                            : alpha(theme.palette.success.main, 0.08),
                          borderColor: theme => teacher.status === "inactive"
                            ? alpha(theme.palette.grey[500], 0.3)
                            : alpha(theme.palette.success.main, 0.3)
                        }}
                      />
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 0.5,
                      }}
                    >
                      <EmailIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.7 }} />
                      {teacher.email}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 1.5,
                      }}
                    >
                      <PhoneIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.7 }} />
                      {teacher.phone || "No phone number"}
                    </Typography>

                    {/* Subjects section */}
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
                        <BookIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.7 }} />
                        Subjects:
                      </Typography>

                      {teacher.subjects && Array.isArray(teacher.subjects) && teacher.subjects.length > 0 ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {teacher.subjects.map((subject, index) => (
                            <Chip
                              key={index}
                              label={typeof subject === "object" ? subject.name : subject}
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
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          No subjects assigned
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
                        onClick={() => navigate(`/app/teachers/${teacher._id}`)}
                        sx={{
                          color: "primary.main",
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          "&:hover": {
                            bgcolor: alpha(theme.palette.primary.main, 0.2),
                          },
                          mr: 1,
                        }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/app/teachers/${teacher._id}/edit`)}
                        sx={{
                          color: theme.palette.info.main,
                          bgcolor: alpha(theme.palette.info.main, 0.1),
                          "&:hover": {
                            bgcolor: alpha(theme.palette.info.main, 0.2),
                          },
                          mr: 1,
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(teacher)}
                        sx={{
                          color: "error.main",
                          bgcolor: alpha(theme.palette.error.main, 0.1),
                          "&:hover": {
                            bgcolor: alpha(theme.palette.error.main, 0.2),
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
              {isMobile && filteredTeachers.length > 0 && (
                <TablePagination
                  component={Paper}
                  count={filteredTeachers.length}
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
                  Contact Info
                </TableCell>
                <TableCell
                  sx={{
                    color: "common.white",
                    fontWeight: 600,
                    fontSize: "0.95rem"
                  }}
                >
                  Qualification
                </TableCell>
                <TableCell
                  sx={{
                    color: "common.white",
                    fontWeight: 600,
                    fontSize: "0.95rem"
                  }}
                >
                  Subjects
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
                      <Typography variant="body1">Loading teachers...</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : filteredTeachers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary" sx={{ py: 2, fontWeight: 500 }}>
                      No teachers found matching your filters
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
                getPaginatedData().map((teacher, index) => (
                  <TableRow
                    key={teacher._id}
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
                      {teacher.name}
                      {teacher.gender && (
                        <Typography
                          variant="caption"
                          display="block"
                          color="text.secondary"
                        >
                          {teacher.gender.charAt(0).toUpperCase() +
                            teacher.gender.slice(1)}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell
                      sx={{ whiteSpace: "normal", wordBreak: "break-word" }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ display: "flex", alignItems: "center", mb: 0.5 }}
                      >
                        <EmailIcon
                          fontSize="small"
                          sx={{
                            mr: 0.5,
                            opacity: 0.7,
                            fontSize: "1rem",
                            flexShrink: 0,
                          }}
                        />
                        <span>{teacher.email}</span>
                      </Typography>
                      {teacher.phone && (
                        <Typography
                          variant="body2"
                          sx={{ display: "flex", alignItems: "center" }}
                        >
                          <PhoneIcon
                            fontSize="small"
                            sx={{
                              mr: 0.5,
                              opacity: 0.7,
                              fontSize: "1rem",
                              flexShrink: 0,
                            }}
                          />
                          <span>{teacher.phone}</span>
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell
                      sx={{ whiteSpace: "normal", wordBreak: "break-word" }}
                    >
                      {teacher.qualification || "N/A"}
                      {teacher.experience && (
                        <Typography
                          variant="caption"
                          display="block"
                          color="text.secondary"
                        >
                          {teacher.experience}{" "}
                          {Number(teacher.experience) === 1 ? "year" : "years"}{" "}
                          experience
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 0.5,
                          maxWidth: "100%",
                        }}
                      >
                        {teacher.subjects && teacher.subjects.length > 0 ? (
                          teacher.subjects.map((subject, index) => (
                            <Chip
                              key={index}
                              label={
                                typeof subject === "object"
                                  ? subject.name
                                  : subject
                              }
                              size="small"
                              variant="outlined"
                              sx={{
                                fontSize: "0.7rem",
                                maxWidth: "100%",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            />
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            None assigned
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={teacher.status || "Active"}
                        color={
                          teacher.status === "inactive" ? "default" : "success"
                        }
                        size="small"
                        sx={{ fontWeight: 500 }}
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
                            onClick={() => navigate(`/app/teachers/${teacher._id}`)}
                            sx={{
                              color: "primary.main",
                              backgroundColor: theme => alpha(theme.palette.primary.main, 0.1),
                              "&:hover": {
                                backgroundColor: theme => alpha(theme.palette.primary.main, 0.2),
                              },
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/app/teachers/${teacher._id}/edit`)}
                            sx={{
                              color: theme => theme.palette.info.main,
                              backgroundColor: theme => alpha(theme.palette.info.main, 0.1),
                              "&:hover": {
                                backgroundColor: theme => alpha(theme.palette.info.main, 0.2),
                              },
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(teacher)}
                            sx={{
                              color: "error.main",
                              backgroundColor: theme => alpha(theme.palette.error.main, 0.1),
                              "&:hover": {
                                backgroundColor: theme => alpha(theme.palette.error.main, 0.2),
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
          {!isMobile && filteredTeachers.length > 0 && (
            <TablePagination
              component="div"
              count={filteredTeachers.length}
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

export default TeacherList;
