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
  Book as BookIcon,
  Search as SearchIcon,
  AccessTime as AccessTimeIcon,
  Clear as ClearIcon,
  Home as HomeIcon,
} from "@mui/icons-material";
import { fetchSubjects, deleteSubject } from "../../../store/slices/subjectSlice";
import RefreshButton from "../../../components/common/RefreshButton";
import DeleteConfirmationDialog from "../../../components/common/DeleteConfirmationDialog";

const SubjectList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const { subjects, loading } = useSelector((state) => state.subjects);

  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [nameFilter, setNameFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchSubjects());
  }, [dispatch]);

  useEffect(() => {
    if (!subjects) return;

    let results = [...subjects];

    if (nameFilter) {
      const searchTerm = nameFilter.toLowerCase();
      results = results.filter((subject) =>
        subject.name.toLowerCase().includes(searchTerm)
      );
    }

    if (statusFilter) {
      results = results.filter((subject) => subject.status === statusFilter);
    }

    setFilteredSubjects(results);
  }, [subjects, nameFilter, statusFilter]);

  const openDeleteDialog = (subject) => {
    setSubjectToDelete(subject);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSubjectToDelete(null);
  };

  const confirmDelete = async () => {
    if (!subjectToDelete) return;

    try {
      setDeleteLoading(true);
      await dispatch(deleteSubject(subjectToDelete._id)).unwrap();
    } catch (error) {
      console.error("Failed to delete subject:", error);
      alert("Failed to delete subject: " + (error.message || "Unknown error"));
    } finally {
      setDeleteLoading(false);
      closeDeleteDialog();
    }
  };

  const clearFilters = () => {
    setNameFilter("");
    setStatusFilter("");
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
        </Box>

        {/* Filter Section */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Search by name"
              variant="outlined"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: "action.active" }} />,
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
              sx={{ borderRadius: 1 }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              select
              fullWidth
              label="Status"
              variant="outlined"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              size="small"
              sx={{ borderRadius: 1 }}
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={4} sx={{ display: "flex", alignItems: "center" }}>
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={clearFilters}
              disabled={!nameFilter && !statusFilter}
              size="medium"
              sx={{ borderRadius: 1.5, height: "100%" }}
            >
              Clear Filters
            </Button>
            <Box sx={{ ml: 1 }}>
              <RefreshButton onRefresh={loadAllData} tooltip="Refresh subjects" />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Render subjects based on screen size */}
      {isMobile ? (
        // Mobile card view
        <Stack spacing={2}>
          {filteredSubjects && filteredSubjects.length > 0 ? (
            filteredSubjects.map((subject) => (
              <Card
                key={subject._id}
                sx={{
                  width: "100%",
                  borderRadius: 2,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: 3,
                  },
                  overflow: "hidden",
                }}
                elevation={2}
              >
                <Box
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    py: 1,
                    px: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <BookIcon sx={{ color: "white", mr: 1, fontSize: 18 }} />
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      color="white"
                    >
                      {subject.name || "Unnamed Subject"}
                    </Typography>
                  </Box>
                  <Chip
                    label={subject.status || "Unknown"}
                    size="small"
                    color={subject.status === "active" ? "success" : "default"}
                    sx={{
                      fontWeight: 500,
                      height: 24,
                    }}
                  />
                </Box>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <AccessTimeIcon fontSize="small" sx={{ verticalAlign: "middle", mr: 0.5 }} />
                    Duration: {subject.duration || "Not specified"}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      mb: 1
                    }}
                  >
                    {subject.description || "No description available"}
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={() => navigate(`/app/subjects/${subject._id}`)}
                    sx={{ borderRadius: 1.5 }}
                  >
                    View
                  </Button>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => navigate(`/app/subjects/${subject._id}/edit`)}
                    sx={{ borderRadius: 1.5 }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => openDeleteDialog(subject)}
                    sx={{ borderRadius: 1.5 }}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            ))
          ) : (
            <Box
              sx={{
                p: 3,
                textAlign: "center",
                backgroundColor: alpha(theme.palette.primary.light, 0.05),
                borderRadius: 2,
                border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              <Typography variant="body1" color="text.secondary" fontWeight={500}>
                No subjects found
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                sx={{ mt: 2, borderRadius: 1.5 }}
                onClick={() => navigate("/app/subjects/create")}
              >
                Add Subject
              </Button>
            </Box>
          )}
        </Stack>
      ) : (
        // Desktop table view
        <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: "hidden" }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
                <TableCell sx={{ fontWeight: "bold" }}>Subject Name</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Duration</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Description</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSubjects && filteredSubjects.length > 0 ? (
                filteredSubjects.map((subject) => (
                  <TableRow
                    key={subject._id}
                    sx={{
                      "&:hover": {
                        backgroundColor: alpha(theme.palette.primary.light, 0.05),
                      },
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <BookIcon
                          fontSize="small"
                          color="primary"
                          sx={{ mr: 1 }}
                        />
                        <Typography fontWeight={500}>
                          {subject.name || "Unnamed Subject"}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{subject.duration || "Not specified"}</TableCell>
                    <TableCell
                      sx={{
                        maxWidth: "300px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {subject.description || "No description available"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={subject.status.charAt(0).toUpperCase() + subject.status.slice(1)}
                        color={subject.status === "active" ? "success" : "default"}
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/app/subjects/${subject._id}`)}
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
                            onClick={() => navigate(`/app/subjects/${subject._id}/edit`)}
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
                            onClick={() => openDeleteDialog(subject)}
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
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1" color="text.secondary">
                      No subjects found
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => navigate("/app/subjects/create")}
                      sx={{ mt: 2, borderRadius: 1.5 }}
                    >
                      Add Subject
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
        loading={deleteLoading}
        itemName={subjectToDelete?.name}
        title="Delete Subject"
        message="Are you sure you want to delete subject"
      />
    </Box>
  );
};

export default SubjectList; 