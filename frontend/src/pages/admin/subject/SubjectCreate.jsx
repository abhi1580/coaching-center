import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Box,
  Button,
  Paper,
  TextField,
  Grid,
  Typography,
  Breadcrumbs,
  Link,
  useTheme,
  alpha,
  CircularProgress,
} from "@mui/material";
import {
  Book as BookIcon,
  Home as HomeIcon,
} from "@mui/icons-material";
import { createSubject } from "../../../store/slices/subjectSlice";
import Swal from "sweetalert2";

const SubjectCreate = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!formData.name || !formData.description || !formData.duration) {
      Swal.fire({
        icon: 'error',
        title: 'Required Fields Missing',
        text: 'Please fill all required fields: Name, Description, and Duration',
        confirmButtonColor: theme.palette.primary.main
      });
      return;
    }

    try {
      setSubmitting(true);
      await dispatch(createSubject(formData)).unwrap();

      Swal.fire({
        icon: 'success',
        title: 'Subject Created!',
        text: `"${formData.name}" has been created successfully.`,
        confirmButtonColor: theme.palette.primary.main,
        timer: 2000
      });

      navigate('/app/subjects');
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Failed to create subject: ${error.message || "Unknown error"}`,
        confirmButtonColor: theme.palette.primary.main
      });
    } finally {
      setSubmitting(false);
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
        <Link
          underline="hover"
          color="inherit"
          href="/app/subjects"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <BookIcon sx={{ mr: 0.5 }} fontSize="small" />
          Subjects
        </Link>
        <Typography color="text.primary">Create Subject</Typography>
      </Breadcrumbs>

      {/* Header */}
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
          flexWrap: "wrap",
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
          Create New Subject
        </Typography>
      </Paper>

      {/* Form */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information Section */}
            <Grid item xs={12}>
              <Typography
                variant="h6"
                color="primary"
                fontWeight={600}
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <BookIcon fontSize="small" />
                Subject Information
              </Typography>
            </Grid>

            {/* Subject Name */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="name"
                label="Subject Name"
                value={formData.name}
                onChange={handleChange}
                required
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </Grid>

            {/* Duration */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="duration"
                label="Duration"
                value={formData.duration}
                onChange={handleChange}
                required
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="description"
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={handleChange}
                required
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </Grid>

            {/* Action Buttons */}
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
                  onClick={() => navigate("/app/subjects")}
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
                    "Create Subject"
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

export default SubjectCreate;
