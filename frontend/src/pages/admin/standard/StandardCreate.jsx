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
import { createStandard, checkDuplicateStandard, fetchStandards } from "../../../store/slices/standardSlice";
import { fetchSubjects } from "../../../store/slices/subjectSlice";
import * as Yup from "yup";
import { Formik, Form } from "formik";
import Swal from "sweetalert2";

const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    level: Yup.number()
        .typeError("Level must be a number")
        .required("Level is required")
        .positive("Level must be a positive number")
        .integer("Level must be an integer"),
    description: Yup.string().required("Description is required"),
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
    const [duplicateError, setDuplicateError] = useState(null);

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

    const handleSubmit = async (values, { setSubmitting, setErrors, resetForm }) => {
        setSubmitting(true);
        try {
            setLoading(true);
            setDuplicateError(null);

            // Check for duplicates if we're not already in error state
            if (!duplicateError) {
                const duplicateCheck = await dispatch(checkDuplicateStandard({
                    name: values.name,
                    level: values.level
                })).unwrap();

                if (duplicateCheck.isDuplicate) {
                    let errorMsg = "A standard with this ";
                    if (duplicateCheck.duplicateType.name) {
                        errorMsg += "name ";
                        if (duplicateCheck.duplicateType.level) {
                            errorMsg += "and level ";
                        }
                    } else if (duplicateCheck.duplicateType.level) {
                        errorMsg += "level ";
                    }
                    errorMsg += "already exists.";

                    setDuplicateError(errorMsg);
                    setLoading(false);
                    setSubmitting(false);
                    return;
                }
            }

            // Format the data for the API
            const formattedData = {
                ...values,
                level: Number(values.level),
                // Ensure subjects is always processed as an array of IDs
                subjects: Array.isArray(values.subjects)
                    ? values.subjects.map(subject =>
                        typeof subject === 'object' && subject._id
                            ? subject._id
                            : subject)
                    : []
            };

            await dispatch(createStandard(formattedData)).unwrap();

            // Success notification
            Swal.fire({
                icon: 'success',
                title: 'Standard Created!',
                text: `${values.name} has been successfully created.`,
                confirmButtonColor: theme.palette.primary.main,
            });

            resetForm();
            navigate("/app/standards");
        } catch (error) {
            console.error("Error creating standard:", error);

            // Error notification
            Swal.fire({
                icon: 'error',
                title: 'Creation Failed',
                text: error.message || "Failed to create standard. Please try again.",
                confirmButtonColor: theme.palette.primary.main,
            });

            setSubmitting(false);
        } finally {
            setLoading(false);
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
                    href="/app/standards"
                    sx={{ display: 'flex', alignItems: 'center' }}
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
                    {({ values, errors, touched, handleChange, setFieldValue, isSubmitting }) => (
                        <Form>
                            <Grid container spacing={3}>
                                {duplicateError && (
                                    <Grid item xs={12}>
                                        <Paper
                                            sx={{
                                                p: 2,
                                                mb: 2,
                                                bgcolor: (theme) => alpha(theme.palette.error.light, 0.1),
                                                border: `1px solid ${theme.palette.error.light}`,
                                                borderRadius: 1,
                                            }}
                                        >
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                <ErrorIcon color="error" />
                                                <Typography variant="subtitle1" color="error.main" fontWeight={500}>
                                                    Duplicate Standard Detected
                                                </Typography>
                                            </Box>
                                            <Typography variant="body2" color="error">
                                                {duplicateError}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                )}

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
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <FormControl
                                        fullWidth
                                        error={touched.subjects && Boolean(errors.subjects)}
                                    >
                                        <InputLabel id="subjects-label">Associated Subjects *</InputLabel>
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
                                                            subjects.find((subject) => subject._id === value)?.name ||
                                                            value
                                                    )
                                                    .join(", ");
                                            }}
                                            disabled={isSubmitting || !subjects}
                                        >
                                            {subjects && subjects.map((subject) => (
                                                <MenuItem key={subject._id} value={subject._id}>
                                                    <Checkbox checked={values.subjects.indexOf(subject._id) > -1} />
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

                                <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
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
                                        startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
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