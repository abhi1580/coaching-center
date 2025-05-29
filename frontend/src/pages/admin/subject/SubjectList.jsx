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
  InputAdornment,
  CircularProgress,
  TablePagination,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Book as BookIcon,
  Search as SearchIcon,
  AccessTime as AccessTimeIcon,
  Clear as ClearIcon,
  Home as HomeIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import {
  fetchSubjects,
  deleteSubject,
} from "../../../store/slices/subjectSlice";
import RefreshButton from "../../../components/common/RefreshButton";
import { capitalizeFirstLetter } from "../../../utils/helpers";
import Swal from "sweetalert2";

const SubjectList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const { subjects, loading } = useSelector((state) => state.subjects);

  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [nameFilter, setNameFilter] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Add pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10);

  useEffect(() => {
    dispatch(fetchSubjects());
  }, [dispatch]);

  useEffect(() => {
    if (!subjects) return;

    let results = [...subjects];
    // console.log("Total subjects:", results.length);

    if (nameFilter) {
      const searchTerm = nameFilter.toLowerCase();
      results = results.filter((subject) =>
        subject.name.toLowerCase().includes(searchTerm)
      );
    }

    // Reset page to 0 when filter changes
    setPage(0);

    // console.log("Filtered subjects:", results.length);
    setFilteredSubjects(results);
  }, [subjects, nameFilter]);

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
    return filteredSubjects.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  };

  const openDeleteDialog = (subject) => {
    Swal.fire({
      title: "Delete Subject",
      text: `Are you sure you want to delete "${subject.name}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: theme.palette.error.main,
      cancelButtonColor: theme.palette.grey[500],
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        confirmDelete(subject._id);
      }
    });
  };

  const confirmDelete = async (subjectId) => {
    try {
      setDeleteLoading(true);
      await dispatch(deleteSubject(subjectId)).unwrap();

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Subject has been deleted successfully.",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      console.error("Failed to delete subject:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Failed to delete subject: ${error.message || "Unknown error"}`,
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const clearFilters = () => {
    setNameFilter("");
  };

  const loadAllData = () => {
    dispatch(fetchSubjects());
  };

  if (loading && subjects.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress size={40} sx={{ mr: 2 }} />
        <Typography variant="h6">Loading subjects...</Typography>
      </Box>
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
        <Typography
          color="text.primary"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <BookIcon sx={{ mr: 0.5 }} fontSize="small" />
          Subjects
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
            Subjects
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate("/app/subjects/create")}
              sx={{
                borderRadius: 2,
                boxShadow: 2,
                "&:hover": {
                  boxShadow: 4,
                },
              }}
            >
              Add Subject
            </Button>
            <RefreshButton onRefresh={loadAllData} tooltip="Refresh subjects" />
          </Box>
        </Box>

        {/* Filter Section */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Search by name"
              variant="outlined"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <SearchIcon
                    fontSize="small"
                    sx={{ mr: 1, color: "action.active" }}
                  />
                ),
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
              sx={{ backgroundColor: "background.paper" }}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            sx={{ display: "flex", alignItems: "center" }}
          >
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={clearFilters}
              disabled={!nameFilter}
              size="medium"
              sx={{ borderRadius: 1.5, height: "100%" }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>

        {/* Subject count */}
        <Box
          sx={{
            mt: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontWeight: 500 }}
          >
            {filteredSubjects.length === 0
              ? "No subjects found"
              : `Showing ${filteredSubjects.length} subject${
                  filteredSubjects.length !== 1 ? "s" : ""
                }`}
            {nameFilter && ` matching "${nameFilter}"`}
          </Typography>
        </Box>
      </Paper>

      {/* Render subjects based on screen size */}
      {isMobile ? (
        // Mobile card view
        <Box>
          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                py: 4,
              }}
            >
              <CircularProgress size={28} sx={{ mr: 2 }} />
              <Typography variant="body1">Loading subjects...</Typography>
            </Box>
          ) : filteredSubjects.length === 0 ? (
            <Paper
              sx={{
                textAlign: "center",
                py: 4,
                px: 2,
                borderRadius: 2,
                boxShadow: 2,
              }}
            >
              <Typography
                color="text.secondary"
                sx={{ mb: 2, fontWeight: 500 }}
              >
                No subjects found matching your filters
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
              {getPaginatedData().map((subject) => (
                <Card
                  key={subject._id}
                  sx={{
                    width: "100%",
                    borderRadius: 2,
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: 3,
                    },
                    overflow: "hidden",
                    borderLeft: `4px solid ${theme.palette.primary.main}`,
                  }}
                  elevation={2}
                >
                  <CardContent sx={{ pb: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          fontSize: "1.1rem",
                          fontWeight: 600,
                          color: "primary.main",
                        }}
                      >
                        {capitalizeFirstLetter(subject.name) || "Unnamed Subject"}
                      </Typography>

                      <Chip
                        icon={<AccessTimeIcon fontSize="small" />}
                        label={subject.duration || "N/A"}
                        size="small"
                        color="secondary"
                        variant="outlined"
                        sx={{
                          fontWeight: 500,
                          backgroundColor: (theme) =>
                            alpha(theme.palette.secondary.main, 0.05),
                          borderColor: (theme) =>
                            alpha(theme.palette.secondary.main, 0.3),
                        }}
                      />
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        mb: 1.5,
                        fontStyle: "italic",
                      }}
                    >
                      {subject.description || "No description available"}
                    </Typography>

                    {/* Topic details section */}
                    <Box sx={{ mt: 1.5 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          fontWeight: 500,
                          mb: 0.5,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <DescriptionIcon
                          fontSize="small"
                          sx={{ mr: 0.5, opacity: 0.7 }}
                        />
                        Details:
                      </Typography>

                      <Chip
                        label={`Duration: ${
                          subject.duration || "Not specified"
                        }`}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{
                          mb: 0.5,
                          mr: 0.5,
                          fontWeight: 400,
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.05
                          ),
                        }}
                      />
                    </Box>
                  </CardContent>
                  <CardActions
                    sx={{
                      justifyContent: "flex-end",
                      px: 2,
                      pb: 2,
                      pt: 0.5,
                      borderTop: `1px solid ${alpha(
                        theme.palette.divider,
                        0.1
                      )}`,
                    }}
                  >
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/app/subjects/${subject._id}`)}
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
                        onClick={() =>
                          navigate(`/app/subjects/${subject._id}/edit`)
                        }
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
                        onClick={() => openDeleteDialog(subject)}
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
              {filteredSubjects.length > 0 && (
                <TablePagination
                  component={Paper}
                  count={filteredSubjects.length}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[5, 10, 25]}
                  sx={{
                    borderTop: "none",
                    boxShadow: 2,
                    borderRadius: 2,
                    mt: 2,
                    ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows":
                      {
                        fontWeight: 500,
                        color: "text.secondary",
                      },
                    ".MuiTablePagination-toolbar": {
                      px: 2,
                      py: 1.5,
                    },
                    ".MuiTablePagination-select": {
                      borderRadius: 1,
                      "&:focus": {
                        borderRadius: 1,
                      },
                    },
                    ".MuiTablePagination-actions": {
                      marginLeft: 2,
                    },
                    ".MuiIconButton-root": {
                      color: "primary.main",
                      "&:hover": {
                        backgroundColor: (theme) =>
                          alpha(theme.palette.primary.main, 0.1),
                      },
                      "&.Mui-disabled": {
                        color: "text.disabled",
                      },
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
              borderBottom: "none",
            },
          }}
        >
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.9),
                }}
              >
                <TableCell
                  sx={{
                    color: "common.white",
                    py: 2.5,
                    fontWeight: 600,
                    fontSize: "0.95rem",
                  }}
                >
                  Subject Name
                </TableCell>
                <TableCell
                  sx={{
                    color: "common.white",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                  }}
                >
                  Duration
                </TableCell>
                <TableCell
                  sx={{
                    color: "common.white",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                  }}
                >
                  Description
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    color: "common.white",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        py: 2,
                      }}
                    >
                      <CircularProgress size={24} sx={{ mr: 1 }} />
                      <Typography variant="body1">
                        Loading subjects...
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : filteredSubjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography
                      color="text.secondary"
                      sx={{ py: 2, fontWeight: 500 }}
                    >
                      No subjects found matching your filters
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
                getPaginatedData().map((subject, index) => (
                  <TableRow
                    key={subject._id}
                    sx={{
                      "&:hover": {
                        backgroundColor: (theme) =>
                          alpha(theme.palette.primary.main, 0.04),
                      },
                      backgroundColor:
                        index % 2 === 0
                          ? "inherit"
                          : (theme) =>
                              alpha(theme.palette.background.default, 0.5),
                      transition: "background-color 0.2s ease",
                    }}
                  >
                    <TableCell
                      sx={{
                        py: 2.5,
                        borderLeft: (theme) =>
                          `4px solid ${alpha(theme.palette.primary.main, 0.6)}`,
                        pl: 2,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <BookIcon
                          fontSize="small"
                          color="primary"
                          sx={{ mr: 1 }}
                        />
                        <Typography fontWeight={500} fontSize="0.95rem">
                          {capitalizeFirstLetter(subject.name) || "Unnamed Subject"}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.95rem", py: 2.5 }}>
                      <Chip
                        icon={<AccessTimeIcon fontSize="small" />}
                        label={subject.duration || "Not specified"}
                        size="small"
                        color="secondary"
                        variant="outlined"
                        sx={{
                          fontWeight: 500,
                          backgroundColor: (theme) =>
                            alpha(theme.palette.secondary.main, 0.05),
                          borderColor: (theme) =>
                            alpha(theme.palette.secondary.main, 0.3),
                        }}
                      />
                    </TableCell>
                    <TableCell
                      sx={{
                        maxWidth: "250px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        color: "text.secondary",
                        py: 2.5,
                      }}
                    >
                      {subject.description || "No description available"}
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
                            onClick={() =>
                              navigate(`/app/subjects/${subject._id}`)
                            }
                            sx={{
                              color: "primary.main",
                              backgroundColor: (theme) =>
                                alpha(theme.palette.primary.main, 0.1),
                              "&:hover": {
                                backgroundColor: (theme) =>
                                  alpha(theme.palette.primary.main, 0.2),
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
                              navigate(`/app/subjects/${subject._id}/edit`)
                            }
                            sx={{
                              color: (theme) => theme.palette.info.main,
                              backgroundColor: (theme) =>
                                alpha(theme.palette.info.main, 0.1),
                              "&:hover": {
                                backgroundColor: (theme) =>
                                  alpha(theme.palette.info.main, 0.2),
                              },
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => openDeleteDialog(subject)}
                            sx={{
                              color: "error.main",
                              backgroundColor: (theme) =>
                                alpha(theme.palette.error.main, 0.1),
                              "&:hover": {
                                backgroundColor: (theme) =>
                                  alpha(theme.palette.error.main, 0.2),
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
          {!isMobile && filteredSubjects.length > 0 && (
            <TablePagination
              component="div"
              count={filteredSubjects.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
              sx={{
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows":
                  {
                    fontWeight: 500,
                    color: "text.secondary",
                  },
                ".MuiTablePagination-toolbar": {
                  px: 3,
                  py: 2,
                },
                ".MuiTablePagination-select": {
                  borderRadius: 1,
                  "&:focus": {
                    borderRadius: 1,
                  },
                },
                ".MuiTablePagination-actions": {
                  marginLeft: 2,
                },
                ".MuiIconButton-root": {
                  color: "primary.main",
                  "&:hover": {
                    backgroundColor: (theme) =>
                      alpha(theme.palette.primary.main, 0.1),
                  },
                  "&.Mui-disabled": {
                    color: "text.disabled",
                  },
                },
              }}
            />
          )}
        </TableContainer>
      )}
    </Box>
  );
};

export default SubjectList;
