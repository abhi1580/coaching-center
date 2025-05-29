import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Paper,
  Typography,
  Grid,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  alpha,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Tooltip,
  FormHelperText,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Checkbox,
  Breadcrumbs,
  Link,
  Stack,
  Avatar,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  Home as HomeIcon,
  Class as ClassIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { fetchBatches, deleteBatch } from "../../../store/slices/batchSlice";
import {
  fetchStudents,
  createStudent,
} from "../../../store/slices/studentSlice";
import { batchService } from "../../../services/api";
import { studentService } from "../../../services/api";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import DeleteConfirmationDialog from "../../../components/common/DeleteConfirmationDialog";
import RefreshButton from "../../../components/common/RefreshButton";

const newStudentValidationSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  phone: Yup.string()
    .matches(/^[0-9]+$/, "Phone number should only contain digits")
    .min(10, "Phone number should be at least 10 digits")
    .required("Phone number is required"),
  parentName: Yup.string(),
  parentPhone: Yup.string()
    .matches(/^[0-9]*$/, "Phone number should only contain digits")
    .min(10, "Phone number should be at least 10 digits")
    .nullable(),
  gender: Yup.string().required("Gender is required"),
  dateOfBirth: Yup.date().nullable(),
  address: Yup.string(),
  board: Yup.string(),
  schoolName: Yup.string(),
  previousPercentage: Yup.number()
    .min(0, "Percentage cannot be less than 0")
    .max(100, "Percentage cannot exceed 100")
    .nullable(),
  joiningDate: Yup.date().required("Joining date is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const BatchList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();

  const { batches, loading } = useSelector((state) => state.batches);
  const { students } = useSelector((state) => state.students);

  const [selectedBatch, setSelectedBatch] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentDialogOpen, setStudentDialogOpen] = useState(false);
  const [addExistingStudentDialogOpen, setAddExistingStudentDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredBatches, setFilteredBatches] = useState([]);

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
    dispatch(fetchBatches({ populateEnrolledStudents: true }));
    dispatch(fetchStudents());
  }, [dispatch]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = batches.filter(
        (batch) =>
          batch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          batch.standard?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          batch.subject?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          batch.teacher?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBatches(filtered);
    } else {
      setFilteredBatches(batches);
    }
  }, [searchTerm, batches]);

  const handleDeleteClick = (batch) => {
    setSelectedBatch(batch);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await dispatch(deleteBatch(selectedBatch._id)).unwrap();
      setDeleteDialogOpen(false);
      setSelectedBatch(null);
    } catch (error) {
      console.error("Failed to delete batch:", error);
    }
  };

  const handleAddExistingStudentToBatch = () => {
    setAddExistingStudentDialogOpen(true);
  };

  const handleAddExistingStudent = async (studentId) => {
    try {
      await batchService.addStudentToBatch(selectedBatch._id, studentId);
      const updatedBatch = await batchService.getById(selectedBatch._id, {
        populateEnrolledStudents: true,
      });
      setSelectedBatch(updatedBatch.data);
      setAddExistingStudentDialogOpen(false);
    } catch (error) {
      console.error("Failed to add student to batch:", error);
    }
  };

  const generateStudentId = async () => {
    try {
      const response = await studentService.generateId();
      return response.data.studentId;
    } catch (error) {
      console.error("Failed to generate student ID:", error);
      throw error;
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
          <ClassIcon sx={{ mr: 0.5 }} fontSize="small" />
          Batches
        </Typography>
      </Breadcrumbs>

      {/* Header */}
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

      {/* Search Bar */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2,
          backgroundColor: (theme) => alpha(theme.palette.primary.light, 0.05),
        }}
      >
            <TextField
              fullWidth
          variant="outlined"
          placeholder="Search batches by name, standard, or subject..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
      </Paper>

      {/* Batches Table */}
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: 2,
          }}
        >
          <Table>
            <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Standard</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Teacher</TableCell>
              <TableCell>Students</TableCell>
              <TableCell>Schedule</TableCell>
              <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredBatches.length === 0 ? (
                <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">
                    {searchTerm
                      ? "No batches found matching your search"
                      : "No batches available"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
              filteredBatches.map((batch) => (
                  <TableRow
                    key={batch._id}
                  hover
                    sx={{
                      "&:hover": {
                        backgroundColor: (theme) =>
                          alpha(theme.palette.primary.main, 0.04),
                      },
                  }}
                >
                  <TableCell>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, color: "primary.main" }}
                    >
                      {batch.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {batch.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{batch.standard?.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Level {batch.standard?.level}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{batch.subject?.name}</Typography>
                  </TableCell>
                  <TableCell>
                    {batch.teacher ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.8),
                          }}
                        >
                          {batch.teacher.name?.charAt(0)?.toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {batch.teacher.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {batch.teacher.email}
                          </Typography>
                        </Box>
                      </Box>
                    ) : (
                      <Chip
                        label="Not Assigned"
                        size="small"
                        color="warning"
                        sx={{ borderRadius: 1 }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${batch.enrolledStudents?.length || 0}/${batch.capacity || "∞"}`}
                      color={
                        batch.enrolledStudents?.length >= batch.capacity
                          ? "error"
                          : "default"
                      }
                      size="small"
                      sx={{ borderRadius: 1 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                      {batch.schedule?.days?.map((day) => (
                        <Chip
                          key={day}
                          label={day.slice(0, 3)}
                          size="small"
                          sx={{ borderRadius: 1 }}
                        />
                      ))}
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {formatTime(batch.schedule?.startTime)} - {formatTime(batch.schedule?.endTime)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/app/batches/${batch._id}`)}
                          sx={{
                            color: "info.main",
                            "&:hover": {
                              backgroundColor: (theme) =>
                                alpha(theme.palette.info.main, 0.1),
                            },
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Batch">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/app/batches/${batch._id}/edit`)}
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
                      <Tooltip title="Delete Batch">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(batch)}
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
            )}
            </TableBody>
          </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Batch"
        content={`Are you sure you want to delete the batch "${selectedBatch?.name}"? This action cannot be undone.`}
      />

      {/* Add Existing Student Dialog */}
      <Dialog
        open={addExistingStudentDialogOpen}
        onClose={() => setAddExistingStudentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Existing Student</DialogTitle>
        <DialogContent>
          <List>
            {students
              .filter(
                (student) =>
                  !selectedBatch?.enrolledStudents?.some(
                    (enrolled) => enrolled._id === student._id
                  )
              )
              .map((student) => (
                <ListItem key={student._id} disablePadding>
                  <ListItemButton
                    onClick={() => handleAddExistingStudent(student._id)}
                  >
                    <ListItemText
                      primary={student.name}
                      secondary={`ID: ${student.studentId}`}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setAddExistingStudentDialogOpen(false)}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BatchList;
