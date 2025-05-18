import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Paper,
  TextField,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  useTheme,
  InputAdornment,
  CircularProgress,
  Breadcrumbs,
  Link,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { updateBatch, fetchBatches } from "../../../store/slices/batchSlice";
import { fetchStandards } from "../../../store/slices/standardSlice";
import { fetchSubjects } from "../../../store/slices/subjectSlice";
import { fetchTeachers } from "../../../store/slices/teacherSlice";
import { Home as HomeIcon, Class as ClassIcon } from "@mui/icons-material";
import Swal from "sweetalert2";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const STATUS_OPTIONS = ["upcoming", "active", "completed"];

const BatchEdit = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();

  const { batches, loading } = useSelector((state) => state.batches);
  const { standards } = useSelector((state) => state.standards);
  const { subjects } = useSelector((state) => state.subjects);
  const { teachers } = useSelector((state) => state.teachers);

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
    status: "",
    description: "",
    teacher: "",
  });

  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchBatches());
    dispatch(fetchStandards());
    dispatch(fetchSubjects());
    dispatch(fetchTeachers());
  }, [dispatch]);

  useEffect(() => {
    if (batches && id) {
      const batch = batches.find((b) => b._id === id);
      if (batch) {
        const startDate = batch.startDate
          ? new Date(batch.startDate).toISOString().split("T")[0]
          : "";
        const endDate = batch.endDate
          ? new Date(batch.endDate).toISOString().split("T")[0]
          : "";

        setFormData({
          name: batch.name || "",
          standard: batch.standard?._id || batch.standard || "",
          subject: batch.subject?._id || batch.subject || "",
          startDate,
          endDate,
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

        if (batch.standard) {
          const standard = standards.find(
            (s) => s._id === (batch.standard._id || batch.standard)
          );
          if (standard) {
            const standardSubjects = subjects.filter((subject) =>
              standard.subjects?.some((s) => (s._id || s) === subject._id)
            );
            setFilteredSubjects(standardSubjects);
          }
        }

        if (batch.subject) {
          const subjectTeachers = teachers.filter((teacher) =>
            teacher.subjects?.some(
              (s) => (s._id || s) === (batch.subject._id || batch.subject)
            )
          );
          setFilteredTeachers(subjectTeachers);
        }
      }
    }
  }, [batches, id, standards, subjects, teachers]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "standard") {
      const standard = standards.find((s) => s._id === value);
      const standardSubjects = standard
        ? subjects.filter((subject) =>
            standard.subjects?.some((s) => (s._id || s) === subject._id)
          )
        : [];
      setFilteredSubjects(standardSubjects);
      setFilteredTeachers([]);
      setFormData({
        ...formData,
        standard: value,
        subject: "",
        teacher: "",
      });
    } else if (name === "subject") {
      console.log(`Selected subject ID: ${value}`);
      console.log(`Available teachers:`, teachers.length);

      const subjectTeachers = teachers.filter((teacher) => {
        if (!teacher.subjects || !Array.isArray(teacher.subjects)) {
          console.log(`Teacher ${teacher.name} has no subjects array`);
          return false;
        }

        // Log the teacher's subjects for debugging
        console.log(
          `Teacher ${teacher.name} subjects:`,
          JSON.stringify(
            teacher.subjects.map((s) => (typeof s === "object" ? s._id : s))
          )
        );

        return teacher.subjects.some((s) => {
          // Handle object format (populated subjects)
          if (typeof s === "object" && s !== null && s._id) {
            return s._id === value;
          }
          // Handle string format (just ID references)
          if (typeof s === "string") {
            return s === value;
          }
          return false;
        });
      });

      console.log(
        `Filtered ${subjectTeachers.length} teachers for subject ${value}`
      );

      if (subjectTeachers.length === 0) {
        console.log(
          `No teachers found for subject ID ${value}. All teachers:`,
          teachers.map((t) => ({ name: t.name, subjects: t.subjects }))
        );
      }

      setFilteredTeachers(subjectTeachers);
      setFormData({
        ...formData,
        subject: value,
        teacher: "",
      });
    } else if (name.startsWith("schedule.")) {
      const scheduleField = name.split(".")[1];
      setFormData({
        ...formData,
        schedule: {
          ...formData.schedule,
          [scheduleField]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleDayToggle = (day) => {
    const days = [...formData.schedule.days];
    const index = days.indexOf(day);
    if (index === -1) {
      days.push(day);
    } else {
      days.splice(index, 1);
    }
    setFormData({
      ...formData,
      schedule: {
        ...formData.schedule,
        days,
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!formData.name || !formData.standard || !formData.subject) {
      Swal.fire({
        icon: "error",
        title: "Required Fields Missing",
        text: "Please fill all required fields: Name, Standard, and Subject",
        confirmButtonColor: theme.palette.primary.main,
      });
      return;
    }

    try {
      setSubmitting(true);
      await dispatch(updateBatch({ id, data: formData })).unwrap();

      Swal.fire({
        icon: "success",
        title: "Batch Updated!",
        text: `"${formData.name}" batch has been updated successfully.`,
        confirmButtonColor: theme.palette.primary.main,
        timer: 2000,
      });

      navigate(`/app/batches/${id}`);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Failed to update batch: ${error.message || "Unknown error"}`,
        confirmButtonColor: theme.palette.primary.main,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !formData.name) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
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
        <Link
          underline="hover"
          color="inherit"
          href="/app/batches"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <ClassIcon sx={{ mr: 0.5 }} fontSize="small" />
          Batches
        </Link>
        <Link
          underline="hover"
          color="inherit"
          href={`/app/batches/${id}`}
          sx={{ display: "flex", alignItems: "center" }}
        >
          {formData.name}
        </Link>
        <Typography color="text.primary">Edit</Typography>
      </Breadcrumbs>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          backgroundColor: (theme) => alpha(theme.palette.primary.light, 0.05),
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          gap: 2,
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
          Edit Batch
        </Typography>
      </Paper>

      <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography
                variant="h6"
                color="primary"
                fontWeight={600}
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                Basic Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="name"
                label="Batch Name"
                value={formData.name}
                onChange={handleChange}
                required
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Standard</InputLabel>
                <Select
                  name="standard"
                  value={formData.standard}
                  onChange={handleChange}
                  label="Standard"
                  sx={{ borderRadius: 2 }}
                >
                  {standards.map((standard) => (
                    <MenuItem key={standard._id} value={standard._id}>
                      {standard.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required disabled={!formData.standard}>
                <InputLabel>Subject</InputLabel>
                <Select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  label="Subject"
                  sx={{ borderRadius: 2 }}
                >
                  {filteredSubjects.map((subject) => (
                    <MenuItem key={subject._id} value={subject._id}>
                      {subject.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={!formData.subject}>
                <InputLabel>Teacher</InputLabel>
                <Select
                  name="teacher"
                  value={formData.teacher}
                  onChange={handleChange}
                  label="Teacher"
                  sx={{ borderRadius: 2 }}
                >
                  {filteredTeachers.map((teacher) => (
                    <MenuItem key={teacher._id} value={teacher._id}>
                      {teacher.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography
                variant="h6"
                color="primary"
                fontWeight={600}
                gutterBottom
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mt: 2,
                }}
              >
                Schedule
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="startDate"
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="endDate"
                label="End Date"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography
                variant="subtitle2"
                gutterBottom
                color="text.secondary"
              >
                Class Days
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {DAYS_OF_WEEK.map((day) => (
                  <Chip
                    key={day}
                    label={day}
                    onClick={() => handleDayToggle(day)}
                    color={
                      formData.schedule.days.includes(day)
                        ? "primary"
                        : "default"
                    }
                    sx={{
                      borderRadius: 1,
                      transition: "all 0.2s",
                      "&:hover": {
                        transform: "translateY(-2px)",
                      },
                    }}
                  />
                ))}
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="schedule.startTime"
                label="Start Time"
                type="time"
                value={formData.schedule.startTime}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="schedule.endTime"
                label="End Time"
                type="time"
                value={formData.schedule.endTime}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography
                variant="h6"
                color="primary"
                fontWeight={600}
                gutterBottom
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mt: 2,
                }}
              >
                Additional Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="capacity"
                label="Capacity"
                type="number"
                value={formData.capacity}
                onChange={handleChange}
                required
                InputProps={{
                  inputProps: { min: 1 },
                }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="fees"
                label="Fees"
                type="number"
                value={formData.fees}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">₹</InputAdornment>
                  ),
                }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                  sx={{ borderRadius: 2 }}
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
                name="description"
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={handleChange}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    backgroundColor: (theme) =>
                      alpha(theme.palette.primary.light, 0.02),
                  },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  justifyContent: "flex-end",
                  mt: 2,
                }}
              >
                <Button
                  variant="outlined"
                  onClick={() => navigate("/app/batches")}
                  disabled={submitting}
                  sx={{ borderRadius: 2 }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={submitting}
                  sx={{
                    borderRadius: 2,
                    minWidth: 100,
                    position: "relative",
                  }}
                >
                  {submitting ? (
                    <CircularProgress
                      size={24}
                      sx={{
                        color: "inherit",
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        marginTop: "-12px",
                        marginLeft: "-12px",
                      }}
                    />
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default BatchEdit;
