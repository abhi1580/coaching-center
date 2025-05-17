import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Paper,
  Typography,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Card,
  CardContent,
  CardActions,
  Chip,
  Avatar,
  Stack,
  Divider,
  useTheme,
  useMediaQuery,
  alpha,
  Tooltip,
  Alert,
  CircularProgress,
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
  Clear as ClearIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  School as SchoolIcon,
  Home as HomeIcon,
} from "@mui/icons-material";
import {
  fetchStudents,
  deleteStudent,
} from "../../../store/slices/studentSlice";
import { fetchStandards } from "../../../store/slices/standardSlice";
import { fetchBatches } from "../../../store/slices/batchSlice";
import RefreshButton from "../../../components/common/RefreshButton";
import DeleteConfirmationDialog from "../../../components/common/DeleteConfirmationDialog";

const StudentList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const { students, loading, error } = useSelector((state) => state.students);
  const { standards, loading: standardsLoading } = useSelector(
    (state) => state.standards
  );
  const { batches, loading: batchesLoading } = useSelector(
    (state) => state.batches
  );

  // State for filtering
  const [nameFilter, setNameFilter] = useState("");
  const [standardFilter, setStandardFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [filteredStudentsList, setFilteredStudentsList] = useState([]);

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load data initially
  useEffect(() => {
    loadAllData();
  }, [dispatch]);

  const loadAllData = () => {
    dispatch(fetchStudents());
    dispatch(fetchStandards());
    dispatch(fetchBatches());
  };

  // Apply filters
  useEffect(() => {
    if (!students || students.length === 0) {
      setFilteredStudentsList([]);
      return;
    }

    let results = [...students];

    // Filter by name/email/phone
    if (nameFilter) {
      const searchTerm = nameFilter.toLowerCase();
      results = results.filter(
        (student) =>
          student.name?.toLowerCase().includes(searchTerm) ||
          student.email?.toLowerCase().includes(searchTerm) ||
          student.phone?.includes(searchTerm) ||
          student.parentName?.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by standard
    if (standardFilter) {
      results = results.filter(
        (student) =>
          student.standard?._id === standardFilter ||
          student.standard === standardFilter
      );
    }

    // Filter by gender
    if (genderFilter) {
      results = results.filter((student) => student.gender === genderFilter);
    }

    setFilteredStudentsList(results);
  }, [students, nameFilter, standardFilter, genderFilter]);

  // Initialize filtered students when students data loads
  useEffect(() => {
    setFilteredStudentsList(students || []);
  }, [students]);

  const clearFilters = () => {
    setNameFilter("");
    setStandardFilter("");
    setGenderFilter("");
  };

  const openDeleteDialog = (student) => {
    setStudentToDelete(student);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setStudentToDelete(null);
  };

  const confirmDelete = async () => {
    if (!studentToDelete) return;

    try {
      setDeleteLoading(true);
      await dispatch(deleteStudent(studentToDelete._id)).unwrap();
      closeDeleteDialog();
    } catch (error) {
      console.error("Error deleting student:", error);
      alert("Failed to delete student: " + error.message);
    } finally {
      setDeleteLoading(false);
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
          <PersonIcon sx={{ mr: 0.5 }} fontSize="small" />
          Students
        </Typography>
      </Breadcrumbs>

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
            Students
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate("/app/students/create")}
              sx={{
                borderRadius: 2,
                boxShadow: 2,
                "&:hover": {
                  boxShadow: 4,
                },
              }}
            >
              Add Student
            </Button>
            <RefreshButton onRefresh={loadAllData} loading={loading} />
          </Box>
        </Box>

        {/* Filters */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Search by name, email or phone"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: nameFilter && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setNameFilter("")}
                      edge="end"
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Standard</InputLabel>
              <Select
                value={standardFilter}
                onChange={(e) => setStandardFilter(e.target.value)}
                label="Filter by Standard"
                endAdornment={
                  standardFilter && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setStandardFilter("");
                      }}
                      sx={{
                        position: "absolute",
                        right: 32,
                        color: "text.secondary",
                      }}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  )
                }
              >
                <MenuItem value="">All Standards</MenuItem>
                {standards?.map((standard) => (
                  <MenuItem key={standard._id} value={standard._id}>
                    {standard.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Gender</InputLabel>
              <Select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                label="Filter by Gender"
                endAdornment={
                  genderFilter && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setGenderFilter("");
                      }}
                      sx={{
                        position: "absolute",
                        right: 32,
                        color: "text.secondary",
                      }}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  )
                }
              >
                <MenuItem value="">All Genders</MenuItem>
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Filter action buttons */}
        {(nameFilter || standardFilter || genderFilter) && (
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={clearFilters}
              startIcon={<ClearIcon />}
            >
              Clear Filters
            </Button>
          </Box>
        )}
      </Paper>

      {/* Students List */}
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            p: 5,
          }}
        >
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert
          severity="error"
          sx={{ maxWidth: "md", mx: "auto", borderRadius: 1.5 }}
        >
          Error loading students: {error}
        </Alert>
      ) : filteredStudentsList.length === 0 ? (
        <Paper
          sx={{
            p: 3,
            borderRadius: 2,
            textAlign: "center",
            boxShadow: theme.shadows[1],
          }}
        >
          <Typography color="text.secondary">
            {students.length === 0
              ? "No students found. Add students from the batch interface."
              : "No students match the current filters."}
          </Typography>
          {students.length > 0 && filteredStudentsList.length === 0 && (
            <Button
              startIcon={<ClearIcon />}
              onClick={clearFilters}
              variant="text"
              sx={{ mt: 1 }}
            >
              Clear filters
            </Button>
          )}
        </Paper>
      ) : (
        <>
          {/* Table view for desktop */}
          <Box sx={{ display: { xs: "none", md: "block" } }}>
            <TableContainer
              component={Paper}
              sx={{ borderRadius: 2, boxShadow: theme.shadows[1] }}
            >
              <Table>
                <TableHead
                  sx={{
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
                  }}
                >
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Standard</TableCell>
                    <TableCell>Batches</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredStudentsList.map((student) => (
                    <TableRow key={student._id} hover>
                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                          }}
                        >
                          <Avatar
                            sx={{
                              bgcolor: (theme) =>
                                student.gender === "female"
                                  ? theme.palette.info.main
                                  : student.gender === "male"
                                  ? theme.palette.primary.main
                                  : theme.palette.grey[500],
                              width: 40,
                              height: 40,
                              fontSize: "1rem",
                              fontWeight: 600,
                            }}
                          >
                            {student.name?.charAt(0)?.toUpperCase() || "S"}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" fontWeight={500}>
                              {student.name}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <Chip
                                label={student.gender || "Not specified"}
                                size="small"
                                sx={{ height: 20, fontSize: "0.7rem" }}
                              />
                            </Box>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <PhoneIcon
                              fontSize="small"
                              sx={{
                                color: "text.secondary",
                                fontSize: "0.9rem",
                              }}
                            />
                            <Typography variant="body2">
                              {student.phone}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <EmailIcon
                              fontSize="small"
                              sx={{
                                color: "text.secondary",
                                fontSize: "0.9rem",
                              }}
                            />
                            <Typography variant="body2">
                              {student.email}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {getRelatedData(
                            student.standard?._id || student.standard,
                            standards
                          )?.name || "No standard"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {student.batches?.length > 0 ? (
                          <Box
                            sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                          >
                            {student.batches.slice(0, 2).map((batch) => {
                              const batchData = getRelatedData(
                                batch._id || batch,
                                batches
                              );
                              return (
                                <Chip
                                  key={batch._id || batch}
                                  label={batchData?.name || "Batch"}
                                  size="small"
                                  sx={{
                                    borderRadius: 1,
                                    bgcolor: batchData
                                      ? alpha(
                                          getBatchStatusColor(batchData.status),
                                          0.1
                                        )
                                      : "primary.light",
                                    color: batchData
                                      ? getBatchStatusColor(batchData.status)
                                      : "primary.main",
                                    fontSize: "0.7rem",
                                    height: 22,
                                  }}
                                />
                              );
                            })}
                            {student.batches.length > 2 && (
                              <Chip
                                label={`+${student.batches.length - 2}`}
                                size="small"
                                sx={{
                                  borderRadius: 1,
                                  fontSize: "0.7rem",
                                  height: 22,
                                }}
                              />
                            )}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No batches
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            justifyContent: "flex-end",
                          }}
                        >
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() =>
                                navigate(`/app/students/${student._id}`)
                              }
                              color="default"
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Student">
                            <IconButton
                              size="small"
                              onClick={() =>
                                navigate(`/app/students/${student._id}/edit`)
                              }
                              color="primary"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Student">
                            <IconButton
                              size="small"
                              onClick={() => openDeleteDialog(student)}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Card view for mobile and tablet */}
          <Box sx={{ display: { xs: "block", md: "none" } }}>
            <Grid container spacing={2.5}>
              {filteredStudentsList.map((student) => (
                <Grid item xs={12} sm={6} key={student._id}>
                  <Card
                    sx={{
                      borderRadius: 2,
                      boxShadow: theme.shadows[1],
                      transition: "all 0.3s ease",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      "&:hover": {
                        boxShadow: theme.shadows[4],
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    <CardContent
                      sx={{
                        p: 2.5,
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          mb: 2,
                        }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: (theme) =>
                              student.gender === "female"
                                ? theme.palette.info.main
                                : student.gender === "male"
                                ? theme.palette.primary.main
                                : theme.palette.grey[500],
                            width: 50,
                            height: 50,
                            fontSize: "1.2rem",
                            fontWeight: 600,
                          }}
                        >
                          {student.name?.charAt(0)?.toUpperCase() || "S"}
                        </Avatar>

                        <Box sx={{ flexGrow: 1 }}>
                          <Typography
                            variant="h6"
                            fontWeight={600}
                            sx={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {student.name}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                textTransform: "capitalize",
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              {student.gender || "Not specified"}
                            </Typography>
                            {student.studentId && (
                              <Chip
                                label={student.studentId}
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{
                                  height: 20,
                                  fontSize: "0.7rem",
                                  fontWeight: 500,
                                }}
                              />
                            )}
                          </Box>
                        </Box>
                      </Box>

                      <Divider sx={{ mb: 2 }} />

                      <Stack spacing={1.5}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <PhoneIcon
                            fontSize="small"
                            sx={{ color: "text.secondary" }}
                          />
                          <Typography variant="body2">
                            {student.phone}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <EmailIcon
                            fontSize="small"
                            sx={{ color: "text.secondary" }}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {student.email}
                          </Typography>
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
                            sx={{ color: "text.secondary" }}
                          />
                          <Typography variant="body2">
                            {getRelatedData(
                              student.standard?._id || student.standard,
                              standards
                            )?.name || "No standard"}
                          </Typography>
                        </Box>

                        {student.batches?.length > 0 && (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                              flexWrap: "wrap",
                              mt: 0.5,
                            }}
                          >
                            {student.batches.slice(0, 2).map((batch) => {
                              const batchData = getRelatedData(
                                batch._id || batch,
                                batches
                              );
                              return (
                                <Chip
                                  key={batch._id || batch}
                                  label={batchData?.name || "Batch"}
                                  size="small"
                                  sx={{
                                    borderRadius: 1,
                                    bgcolor: batchData
                                      ? alpha(
                                          getBatchStatusColor(batchData.status),
                                          0.1
                                        )
                                      : "primary.light",
                                    color: batchData
                                      ? getBatchStatusColor(batchData.status)
                                      : "primary.main",
                                    fontSize: "0.7rem",
                                    height: 22,
                                  }}
                                />
                              );
                            })}
                            {student.batches.length > 2 && (
                              <Chip
                                label={`+${student.batches.length - 2}`}
                                size="small"
                                sx={{
                                  borderRadius: 1,
                                  fontSize: "0.7rem",
                                  height: 22,
                                }}
                              />
                            )}
                          </Box>
                        )}
                      </Stack>
                    </CardContent>

                    <CardActions
                      sx={{
                        p: 1.5,
                        borderTop: `1px solid ${alpha(
                          theme.palette.divider,
                          0.3
                        )}`,
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Button
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => navigate(`/app/students/${student._id}`)}
                      >
                        View
                      </Button>
                      <Box>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() =>
                            navigate(`/app/students/${student._id}/edit`)
                          }
                          sx={{ mr: 0.5 }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => openDeleteDialog(student)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
        title="Delete Student"
        content={`Are you sure you want to delete ${studentToDelete?.name}? This action cannot be undone.`}
        loading={deleteLoading}
      />
    </Box>
  );
};

export default StudentList;
