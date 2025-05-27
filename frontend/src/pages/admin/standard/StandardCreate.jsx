import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
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
  FormControlLabel,
  Switch,
  FormHelperText,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  ListItemText,
  OutlinedInput,
  CircularProgress,
} from "@mui/material";
import {
  School as SchoolIcon,
  Home as HomeIcon,
  Save as SaveIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import {
  createStandard,
  checkDuplicateStandard,
  fetchStandards,
} from "../../../store/slices/standardSlice";
import { fetchSubjects } from "../../../store/slices/subjectSlice";
import * as Yup from "yup";
import { Formik, Form } from "formik";
import Swal from "sweetalert2";

const validationSchema = Yup.object({
  name: Yup.string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must not exceed 50 characters")
    .matches(
      /^[a-zA-Z0-9\s-]+$/,
      "Name can only contain letters, numbers, spaces, and hyphens"
    )
    .test(
      "no-whitespace",
      "Name cannot be empty or contain only spaces",
      (value) => {
        return value && value.trim().length > 0;
      }
    ),
  level: Yup.number()
    .typeError("Level must be a number")
    .required("Level is required")
    .positive("Level must be a positive number")
    .integer("Level must be an integer"),
  description: Yup.string()
    .required("Description is required")
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must not exceed 500 characters"),
  subjects: Yup.array()
    .of(Yup.string())
    .min(1, "At least one subject must be selected")
    .required("Please select at least one subject"),
});

const StandardCreate = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const { subjects } = useSelector((state) => state.subjects);
  const { standards, duplicateCheck } = useSelector((state) => state.standards);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchSubjects());
    dispatch(fetchStandards());
  }, [dispatch]);

  const initialValues = {
    name: "",
    level: "",
    description: "",
    subjects: [],
  };

  const handleSubmit = async (
    values,
    { setSubmitting, setErrors, resetForm }
  ) => {
    setSubmitting(true);
    try {
      setLoading(true);

      // Normalize the name (trim and convert to lowercase)
      const normalizedName = values.name.trim().toLowerCase();

      // Check for duplicates
      const duplicateCheck = await dispatch(
        checkDuplicateStandard({
          name: normalizedName,
          level: values.level,
        })
      ).unwrap();

      if (duplicateCheck.isDuplicate) {
        let errors = {};
        if (duplicateCheck.duplicateType.name) {
          errors.name = "A standard with this name already exists";
        }
        if (duplicateCheck.duplicateType.level) {
          errors.level = "A standard with this level already exists";
        }
        setErrors(errors);
        setLoading(false);
        setSubmitting(false);
        return;
      }

      // Format the data for the API
      const formattedData = {
        ...values,
        name: normalizedName,
        level: Number(values.level),
        subjects: Array.isArray(values.subjects)
          ? values.subjects.map((subject) =>
              typeof subject === "object" && subject._id ? subject._id : subject
            )
          : [],
      };

      await dispatch(createStandard(formattedData)).unwrap();

      // Success notification
      Swal.fire({
        icon: "success",
        title: "Standard Created!",
        text: `${values.name} has been successfully created.`,
        confirmButtonColor: theme.palette.primary.main,
      });

      resetForm();
      navigate("/app/standards");
    } catch (error) {
      console.error("Error creating standard:", error);

      // Handle API validation errors
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else if (
        error.message === "One or more subjects are invalid" ||
        error.response?.data?.message === "One or more subjects are invalid"
      ) {
        setErrors({
          subjects:
            "One or more selected subjects are invalid or no longer exist",
        });
      } else {
        // For unexpected errors, show in the form
        setErrors({
          name: error.message || "Failed to create standard. Please try again.",
        });
      }

      setSubmitting(false);
    } finally {
      setLoading(false);
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
          href="/app/standards"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <SchoolIcon sx={{ mr: 0.5 }} fontSize="small" />
          Standards
        </Link>
        <Typography color="text.primary">Create Standard</Typography>
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
          Create New Standard
        </Typography>
      </Paper>

      {/* Create Form */}
      <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            setFieldValue,
            isSubmitting,
          }) => (
            <Form>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    id="name"
                    name="name"
                    label="Standard Name"
                    variant="outlined"
                    value={values.name}
                    onChange={handleChange}
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    disabled={isSubmitting}
                    sx={{
                      "& .MuiOutlinedInput-root": { borderRadius: 2 },
                      "& .MuiFormHelperText-root": {
                        color: errors.name ? "error.main" : "text.secondary",
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    id="level"
                    name="level"
                    label="Level (Class)"
                    variant="outlined"
                    type="number"
                    value={values.level}
                    onChange={handleChange}
                    error={touched.level && Boolean(errors.level)}
                    helperText={touched.level && errors.level}
                    disabled={isSubmitting}
                    sx={{
                      "& .MuiOutlinedInput-root": { borderRadius: 2 },
                      "& .MuiFormHelperText-root": {
                        color: errors.level ? "error.main" : "text.secondary",
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="description"
                    name="description"
                    label="Description"
                    variant="outlined"
                    multiline
                    rows={4}
                    value={values.description}
                    onChange={handleChange}
                    error={touched.description && Boolean(errors.description)}
                    helperText={touched.description && errors.description}
                    disabled={isSubmitting}
                    sx={{
                      "& .MuiOutlinedInput-root": { borderRadius: 2 },
                      "& .MuiFormHelperText-root": {
                        color: errors.description
                          ? "error.main"
                          : "text.secondary",
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl
                    fullWidth
                    error={touched.subjects && Boolean(errors.subjects)}
                  >
                    <InputLabel id="subjects-label">
                      Associated Subjects *
                    </InputLabel>
                    <Select
                      labelId="subjects-label"
                      id="subjects"
                      name="subjects"
                      multiple
                      value={values.subjects}
                      onChange={handleChange}
                      input={<OutlinedInput label="Associated Subjects *" />}
                      renderValue={(selected) => {
                        if (!subjects) return "Loading subjects...";
                        return selected
                          .map(
                            (value) =>
                              subjects.find((subject) => subject._id === value)
                                ?.name || value
                          )
                          .join(", ");
                      }}
                      disabled={isSubmitting || !subjects}
                    >
                      {subjects &&
                        subjects.map((subject) => (
                          <MenuItem key={subject._id} value={subject._id}>
                            <Checkbox
                              checked={
                                values.subjects.indexOf(subject._id) > -1
                              }
                            />
                            <ListItemText primary={subject.name} />
                          </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText>
                      {touched.subjects && errors.subjects
                        ? errors.subjects
                        : "Select subjects that will be taught in this standard"}
                    </FormHelperText>
                  </FormControl>
                </Grid>

                <Grid
                  item
                  xs={12}
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 2,
                    mt: 2,
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => navigate("/app/standards")}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={
                      isSubmitting ? (
                        <CircularProgress size={20} />
                      ) : (
                        <SaveIcon />
                      )
                    }
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Creating..." : "Create Standard"}
                  </Button>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Paper>
    </Box>
  );
};

export default StandardCreate;
