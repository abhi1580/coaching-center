import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Alert,
  Chip,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import {
  fetchBatches,
  createBatch,
  updateBatch,
  deleteBatch,
  resetStatus,
} from "../store/slices/batchSlice";
import { fetchStandards } from "../store/slices/standardSlice";
import { fetchSubjects } from "../store/slices/subjectSlice";
import { fetchTeachers } from "../store/slices/teacherSlice";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const STATUS_OPTIONS = ["upcoming", "active", "completed", "cancelled"];

const Batches = () => {
  const dispatch = useDispatch();
  const { batches, loading, error, success } = useSelector(
    (state) => state.batches
  );
  const { standards } = useSelector((state) => state.standards);
  const { subjects } = useSelector((state) => state.subjects);
  const { teachers } = useSelector((state) => state.teachers);

  const [open, setOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    standard: "",
    subject: "",
    startDate: "",
    endDate: "",
    schedule: {
      days: [],
      startTime: "",
      endTime: "",
    },
    capacity: "",
    fees: "",
    status: "upcoming",
    description: "",
    teacher: "",
  });

  // Helper function to format error message
  const formatErrorMessage = (error) => {
    if (typeof error === "string") return error;
    if (error?.message) return error.message;
    if (error?.errors) {
      if (Array.isArray(error.errors)) return error.errors.join(", ");
      if (typeof error.errors === "object")
        return Object.values(error.errors).join(", ");
    }
    return "An error occurred";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await dispatch(fetchBatches()).unwrap();
        console.log("Fetched batches:", result);
      } catch (err) {
        console.error("Error fetching batches:", err);
      }
    };

    fetchData();
    dispatch(fetchStandards());
    dispatch(fetchSubjects());
    dispatch(fetchTeachers());
  }, [dispatch]);

  // Add debug logging for batches
  useEffect(() => {
    console.log("Current batches:", batches);
  }, [batches]);

  useEffect(() => {
    if (success) {
      handleClose();
      // Refresh the batches data after successful operation
      dispatch(fetchBatches());
      dispatch(resetStatus());
    }
  }, [success, dispatch]);

  // Add debug logging for related data
  useEffect(() => {
    console.log("Standards:", standards);
    console.log("Subjects:", subjects);
    console.log("Teachers:", teachers);
  }, [standards, subjects, teachers]);

  const handleOpen = (batch = null) => {
    if (batch) {
      console.log("Opening edit form with batch:", batch);
      setSelectedBatch(batch);

      // Filter subjects based on the batch's standard
      const relatedStandard = standards.find(
        (s) => s._id === batch.standard?._id || s._id === batch.standard
      );
      const standardSubjects = relatedStandard
        ? subjects.filter((subject) =>
            relatedStandard.subjects?.some((s) => (s._id || s) === subject._id)
          )
        : [];
      setFilteredSubjects(standardSubjects);

      // Filter teachers for the batch's subject
      const subjectId = batch.subject?._id || batch.subject;
      const subjectTeachers = teachers.filter((teacher) =>
        teacher.subjects?.some((s) => (s._id || s) === subjectId)
      );
      setFilteredTeachers(subjectTeachers);

      // Format the dates properly
      const startDate = batch.startDate
        ? new Date(batch.startDate).toISOString().split("T")[0]
        : "";
      const endDate = batch.endDate
        ? new Date(batch.endDate).toISOString().split("T")[0]
        : "";

      // Set the form data with proper formatting
      setFormData({
        name: batch.name || "",
        standard: batch.standard?._id || batch.standard || "",
        subject: batch.subject?._id || batch.subject || "",
        startDate: startDate,
        endDate: endDate,
        schedule: {
          days: batch.schedule?.days || [],
          startTime: batch.schedule?.startTime || "",
          endTime: batch.schedule?.endTime || "",
        },
        capacity: batch.capacity || "",
        fees: batch.fees || "",
        status: batch.status || "upcoming",
        description: batch.description || "",
        teacher: batch.teacher?._id || batch.teacher || "",
      });

      console.log("Set form data for editing:", {
        name: batch.name,
        standard: batch.standard?._id || batch.standard,
        subject: batch.subject?._id || batch.subject,
        startDate,
        endDate,
        schedule: {
          days: batch.schedule?.days,
          startTime: batch.schedule?.startTime,
          endTime: batch.schedule?.endTime,
        },
        capacity: batch.capacity,
        fees: batch.fees,
        status: batch.status,
        description: batch.description,
        teacher: batch.teacher?._id || batch.teacher,
      });
    } else {
      // Reset everything for new batch
      setSelectedBatch(null);
      setFilteredSubjects([]);
      setFilteredTeachers([]);
      setFormData({
        name: "",
        standard: "",
        subject: "",
        startDate: "",
        endDate: "",
        schedule: {
          days: [],
          startTime: "",
          endTime: "",
        },
        capacity: "",
        fees: "",
        status: "upcoming",
        description: "",
        teacher: "",
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedBatch(null);
    setFormData({
      name: "",
      standard: "",
      subject: "",
      startDate: "",
      endDate: "",
      schedule: {
        days: [],
        startTime: "",
        endTime: "",
      },
      capacity: "",
      fees: "",
      status: "upcoming",
      description: "",
      teacher: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
    if (selectedBatch) {
        await dispatch(
          updateBatch({ id: selectedBatch._id, batchData: formData })
        ).unwrap();
    } else {
        await dispatch(createBatch(formData)).unwrap();
      }
    } catch (err) {
      console.error("Batch operation failed:", err);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this batch?")) {
      dispatch(deleteBatch(id));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "standard") {
      const selectedStandard = standards.find((s) => s._id === value);
      const standardSubjects = selectedStandard
        ? subjects.filter((subject) =>
            selectedStandard.subjects.some((s) => s._id === subject._id)
          )
        : [];
      setFilteredSubjects(standardSubjects);
      setFilteredTeachers([]); // Reset filtered teachers when standard changes
      setFormData((prev) => ({
        ...prev,
        standard: value,
        subject: "",
        teacher: "",
      }));
    } else if (name === "subject") {
      // Filter teachers when subject is selected
      const subjectTeachers = teachers.filter((teacher) => {
        // Handle case where teacher.subjects might be array of IDs or array of objects
        const teacherSubjects =
          teacher.subjects?.map((s) => (typeof s === "string" ? s : s._id)) ||
          [];
        return teacherSubjects.includes(value);
      });

      console.log("Subject ID:", value);
      console.log("Available Teachers:", teachers);
      console.log("Filtered Teachers:", subjectTeachers);

      setFilteredTeachers(subjectTeachers);
      setFormData((prev) => ({
        ...prev,
        subject: value,
        teacher: "",
      }));
    } else if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
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

  // Add data validation helper
  const getBatchesArray = (batchesData) => {
    if (!batchesData) return [];
    if (Array.isArray(batchesData)) return batchesData;
    if (batchesData.data && Array.isArray(batchesData.data))
      return batchesData.data;
    return [];
  };

  // Helper function to safely get related data
  const getRelatedData = (id, array) => {
    if (!id || !array) return null;
    // Handle both string IDs and object IDs
    return array.find(
      (item) => item._id === id || item._id === id._id || item === id
    );
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Batches</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Batch
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {formatErrorMessage(error)}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Standard</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Teacher</TableCell>
              <TableCell>Schedule</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Capacity</TableCell>
              <TableCell>Fees</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={11} align="center">
                  Loading batches...
                </TableCell>
              </TableRow>
            ) : !batches || getBatchesArray(batches).length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} align="center">
                  No batches found
                </TableCell>
              </TableRow>
            ) : (
              getBatchesArray(batches).map((batch) => (
                <TableRow key={batch._id}>
                  <TableCell>{batch.name}</TableCell>
                  <TableCell>
                    {(() => {
                      const standard = getRelatedData(
                        batch.standard,
                        standards
                      );
                      console.log(
                        "Batch standard:",
                        batch.standard,
                        "Found:",
                        standard
                      );
                      return standard ? standard.name : "N/A";
                    })()}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const subject = getRelatedData(batch.subject, subjects);
                      console.log(
                        "Batch subject:",
                        batch.subject,
                        "Found:",
                        subject
                      );
                      return subject ? subject.name : "N/A";
                    })()}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const teacher = getRelatedData(batch.teacher, teachers);
                      console.log(
                        "Batch teacher:",
                        batch.teacher,
                        "Found:",
                        teacher
                      );
                      return teacher ? teacher.name : "N/A";
                    })()}
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                        Days: {batch.schedule?.days?.join(", ") || "N/A"}
                      </Typography>
                      <Typography variant="body2">
                        Time: {batch.schedule?.startTime || "N/A"} -{" "}
                        {batch.schedule?.endTime || "N/A"}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        Start: {new Date(batch.startDate).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2">
                        End: {new Date(batch.endDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    {batch.capacity || "N/A"}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      ₹{batch.fees?.toLocaleString() || "N/A"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        batch.status?.charAt(0).toUpperCase() +
                          batch.status?.slice(1) || "N/A"
                      }
                      color={getStatusColor(batch.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        maxWidth: 200,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={batch.description || "No description"}
                    >
                      {batch.description || "No description"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <IconButton
                        onClick={() => handleOpen(batch)}
                        color="primary"
                        size="small"
                        title="Edit"
                      >
                      <EditIcon />
                    </IconButton>
                      <IconButton
                        onClick={() => handleDelete(batch._id)}
                        color="error"
                        size="small"
                        title="Delete"
                      >
                      <DeleteIcon />
                    </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedBatch ? "Edit Batch" : "Add New Batch"}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Standard</InputLabel>
                  <Select
                    name="standard"
                    value={formData.standard}
                    onChange={handleChange}
                    label="Standard"
                  >
                    {standards.map((standard) => (
                      <MenuItem key={standard._id} value={standard._id}>
                        {standard.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Subject</InputLabel>
                  <Select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    label="Subject"
                    disabled={!formData.standard}
                  >
                    {filteredSubjects.map((subject) => (
                        <MenuItem key={subject._id} value={subject._id}>
                          {subject.name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Schedule Days</InputLabel>
                  <Select
                    multiple
                    name="schedule.days"
                    value={formData.schedule.days}
                    onChange={handleChange}
                    label="Schedule Days"
                  >
                    {DAYS_OF_WEEK.map((day) => (
                      <MenuItem key={day} value={day}>
                        {day}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Start Time"
                  name="schedule.startTime"
                  type="time"
                  value={formData.schedule.startTime}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="End Time"
                  name="schedule.endTime"
                  type="time"
                  value={formData.schedule.endTime}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Capacity"
                  name="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Teacher</InputLabel>
                  <Select
                    name="teacher"
                    value={formData.teacher}
                    onChange={handleChange}
                    label="Teacher"
                    disabled={!formData.subject} // Disable if no subject is selected
                  >
                    {filteredTeachers.map((teacher) => (
                      <MenuItem key={teacher._id} value={teacher._id}>
                        {teacher.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Batch Fee"
                  name="fees"
                  type="number"
                  value={formData.fees}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: "₹",
                  }}
                  helperText="One-time fee for the batch"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    label="Status"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {selectedBatch ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Batches;
