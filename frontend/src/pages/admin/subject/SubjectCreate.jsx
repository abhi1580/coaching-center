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
  MenuItem,
  Breadcrumbs,
  Link,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Book as BookIcon,
  Home as HomeIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import { createSubject } from "../../../store/slices/subjectSlice";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  description: Yup.string().required("Description is required"),
  duration: Yup.string().required("Duration is required"),
  status: Yup.string()
    .oneOf(["active", "inactive"], "Invalid status")
    .required("Status is required"),
});

const SubjectCreate = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      setSubmitting(true);
      await dispatch(createSubject(values)).unwrap();
      alert("Subject created successfully!");
      navigate("/app/subjects");
    } catch (error) {
      console.error("Failed to create subject:", error);

      // Handle API validation errors
      if (error.response?.data?.errors) {
        const apiErrors = {};
        error.response.data.errors.forEach((err) => {
          apiErrors[err.param] = err.msg;
        });
        setErrors(apiErrors);
      } else {
        alert("Failed to create subject: " + (error.message || "Unknown error"));
      }
    } finally {
      setSubmitting(false);
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
        <Link
          underline="hover"
          color="inherit"
          href="/app/subjects"
          sx={{ display: 'flex', alignItems: 'center' }}
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
        <Formik
          initialValues={{
            name: "",
            description: "",
            duration: "",
            status: "active",
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form>
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
                  <Field name="name">
                    {({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Subject Name"
                        required
                        error={touched.name && Boolean(errors.name)}
                        helperText={touched.name && errors.name}
                        sx={{
                          "& .MuiOutlinedInput-root": { borderRadius: 2 },
                        }}
                      />
                    )}
                  </Field>
                </Grid>

                {/* Duration */}
                <Grid item xs={12} sm={6}>
                  <Field name="duration">
                    {({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Duration"
                        required
                        error={touched.duration && Boolean(errors.duration)}
                        helperText={touched.duration && errors.duration}
                        sx={{
                          "& .MuiOutlinedInput-root": { borderRadius: 2 },
                        }}
                      />
                    )}
                  </Field>
                </Grid>

                {/* Status */}
                <Grid item xs={12} sm={6}>
                  <Field name="status">
                    {({ field }) => (
                      <TextField
                        {...field}
                        select
                        fullWidth
                        label="Status"
                        required
                        error={touched.status && Boolean(errors.status)}
                        helperText={touched.status && errors.status}
                        sx={{
                          "& .MuiOutlinedInput-root": { borderRadius: 2 },
                        }}
                      >
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                      </TextField>
                    )}
                  </Field>
                </Grid>

                {/* Description */}
                <Grid item xs={12}>
                  <Field name="description">
                    {({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        multiline
                        rows={4}
                        label="Description"
                        required
                        error={touched.description && Boolean(errors.description)}
                        helperText={touched.description && errors.description}
                        sx={{
                          "& .MuiOutlinedInput-root": { borderRadius: 2 },
                        }}
                      />
                    )}
                  </Field>
                </Grid>

                {/* Action Buttons */}
                <Grid item xs={12}>
                  <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate("/app/subjects")}
                      sx={{ borderRadius: 2 }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isSubmitting}
                      startIcon={<SaveIcon />}
                      sx={{ borderRadius: 2 }}
                    >
                      {isSubmitting ? "Saving..." : "Save Subject"}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Paper>
    </Box>
  );
};

export default SubjectCreate; 