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
    MenuItem,
    Breadcrumbs,
    Link,
    CircularProgress,
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
} from "@mui/material";
import {
    School as SchoolIcon,
    Home as HomeIcon,
    Save as SaveIcon,
    Error as ErrorIcon,
} from "@mui/icons-material";
import { updateStandard, checkDuplicateStandard, fetchStandards } from "../../../store/slices/standardSlice";
import { fetchSubjects } from "../../../store/slices/subjectSlice";
import { standardService } from "../../../services/api";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";

const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    level: Yup.number()
        .typeError("Level must be a number")
        .required("Level is required")
        .positive("Level must be a positive number")
        .integer("Level must be an integer"),
    description: Yup.string().required("Description is required"),
    isActive: Yup.boolean().required("Status is required"),
    subjects: Yup.array().of(Yup.string()),
});

const StandardEdit = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const theme = useTheme();
    const { subjects } = useSelector((state) => state.subjects);
    const { standards } = useSelector((state) => state.standards);

    const [standard, setStandard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [duplicateError, setDuplicateError] = useState(null);

    useEffect(() => {
        const fetchStandardDetails = async () => {
            try {
                setLoading(true);
                const response = await standardService.getById(id);
                setStandard(response.data.data);
                setError(null);
            } catch (error) {
                console.error("Error fetching standard details:", error);
                setError("Failed to load standard details. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchStandardDetails();
        dispatch(fetchSubjects());
        dispatch(fetchStandards());
    }, [id, dispatch]);

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !standard) {
        return (
            <Box sx={{ p: 3, textAlign: "center" }}>
                <Typography color="error">{error || "Standard not found"}</Typography>
                <Button
                    variant="outlined"
                    onClick={() => navigate("/app/standards")}
                    sx={{ mt: 2 }}
                >
                    Back to Standards
                </Button>
            </Box>
        );
    }

    // Extract subject IDs from standard.subjects (they may be objects or strings)
    const getInitialSubjects = () => {
        if (!standard.subjects) return [];
        if (!Array.isArray(standard.subjects)) return [];

        return standard.subjects.map(subject =>
            typeof subject === 'object' ? subject._id : subject
        );
    };

    const initialValues = {
        name: standard.name || "",
        level: standard.level || "",
        description: standard.description || "",
        isActive: standard.isActive === false ? false : true,
        subjects: getInitialSubjects(),
    };

    const handleSubmit = async (values, { setSubmitting, setErrors }) => {
        try {
            setSubmitting(true);
            setDuplicateError(null);

            // Format the data for duplicate check
            const formattedLevel = Number(values.level);

            // Check for duplicates with other standards (excluding the current one)
            const nameExists = standards.some(
                (s) => s._id !== standard._id &&
                    s.name.toLowerCase() === values.name.toLowerCase()
            );

            const levelExists = standards.some(
                (s) => s._id !== standard._id &&
                    s.level === formattedLevel
            );

            // If duplicates are found, show error and stop submission
            if (nameExists || levelExists) {
                setDuplicateError({
                    name: nameExists ? "A standard with this name already exists" : null,
                    level: levelExists ? "A standard with this level already exists" : null
                });
                return;
            }

            // Format the data as needed for the API
            const formattedData = {
                ...values,
                level: formattedLevel,
            };

            await dispatch(updateStandard({
                id: standard._id,
                data: formattedData
            })).unwrap();

            alert("Standard updated successfully!");
            navigate(`/app/standards/${id}`);
        } catch (error) {
            console.error("Failed to update standard:", error);

            // Handle API validation errors
            if (error.response?.data?.errors) {
                const apiErrors = {};
                error.response.data.errors.forEach((err) => {
                    apiErrors[err.param] = err.msg;
                });
                setErrors(apiErrors);
            } else {
                alert("Failed to update standard: " + (error.message || "Unknown error"));
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
                    href="/app/standards"
                    sx={{ display: 'flex', alignItems: 'center' }}
                >
                    <SchoolIcon sx={{ mr: 0.5 }} fontSize="small" />
                    Standards
                </Link>
                <Link
                    underline="hover"
                    color="inherit"
                    href={`/app/standards/${id}`}
                    sx={{ display: 'flex', alignItems: 'center' }}
                >
                    {standard.name}
                </Link>
                <Typography color="text.primary">Edit</Typography>
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
                    Edit Standard
                </Typography>
            </Paper>

            {/* Edit Form */}
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
                                                backgroundColor: (theme) => alpha(theme.palette.error.main, 0.1),
                                                color: "error.main",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1,
                                                borderRadius: 1
                                            }}
                                        >
                                            <ErrorIcon color="error" />
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight="bold">
                                                    Duplicate Standard Detected
                                                </Typography>
                                                {duplicateError.name && (
                                                    <Typography variant="body2">{duplicateError.name}</Typography>
                                                )}
                                                {duplicateError.level && (
                                                    <Typography variant="body2">{duplicateError.level}</Typography>
                                                )}
                                            </Box>
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
                                    <FormControl fullWidth>
                                        <InputLabel id="subjects-label">Associated Subjects</InputLabel>
                                        <Select
                                            labelId="subjects-label"
                                            id="subjects"
                                            name="subjects"
                                            multiple
                                            value={values.subjects}
                                            onChange={handleChange}
                                            input={<OutlinedInput label="Associated Subjects" />}
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
                                            Select subjects that will be taught in this standard
                                        </FormHelperText>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={values.isActive}
                                                onChange={(e) => setFieldValue("isActive", e.target.checked)}
                                                disabled={isSubmitting}
                                            />
                                        }
                                        label={values.isActive ? "Active" : "Inactive"}
                                        sx={{ mb: 2 }}
                                    />
                                    <FormHelperText>
                                        {values.isActive
                                            ? "Standard is currently active and will be shown in all relevant lists."
                                            : "Standard is currently inactive and will be hidden from relevant lists."}
                                    </FormHelperText>
                                </Grid>

                                <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => navigate(`/app/standards/${id}`)}
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
                                        {isSubmitting ? "Saving..." : "Save Changes"}
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

export default StandardEdit; 