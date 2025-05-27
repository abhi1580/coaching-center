import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
    CircularProgress,
    useTheme,
    alpha,
} from "@mui/material";
import {
    Book as BookIcon,
    Home as HomeIcon,
    Save as SaveIcon,
} from "@mui/icons-material";
import { updateSubject } from "../../../store/slices/subjectSlice";
import { subjectService } from "../../../services/api";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import Swal from 'sweetalert2';

const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    description: Yup.string().required("Description is required"),
    duration: Yup.string().required("Duration is required"),
});

const SubjectEdit = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const theme = useTheme();

    const [subject, setSubject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSubjectDetails = async () => {
            try {
                setLoading(true);
                const response = await subjectService.getById(id);
                setSubject(response.data.data);
                setError(null);
            } catch (error) {
                console.error("Error fetching subject details:", error);
                setError("Failed to load subject details. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchSubjectDetails();
    }, [id]);

    const handleSubmit = async (values, { setSubmitting, setErrors }) => {
        try {
            setSubmitting(true);
            await dispatch(updateSubject({ id, data: values })).unwrap();
            
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Subject updated successfully!',
                showConfirmButton: false,
                timer: 1500
            });
            
            navigate(`/app/subjects/${id}`);
        } catch (error) {
            // Handle duplicate subject error
            if (error.response?.data?.error === "DUPLICATE_SUBJECT" || 
                error.response?.data?.message?.includes("already exists")) {
                setErrors({
                    name: "Subject already exists"
                });
                return;
            }

            // Handle API validation errors
            if (error.response?.data?.errors) {
                const apiErrors = {};
                error.response.data.errors.forEach((err) => {
                    apiErrors[err.param] = err.msg;
                });
                setErrors(apiErrors);
            } else {
                setErrors({
                    name: "Subject already exists"
                });
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !subject) {
        return (
            <Box sx={{ p: 3, textAlign: "center" }}>
                <Typography color="error">{error || "Subject not found"}</Typography>
                <Button
                    variant="outlined"
                    onClick={() => navigate("/app/subjects")}
                    sx={{ mt: 2 }}
                >
                    Back to Subjects
                </Button>
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
                <Link
                    underline="hover"
                    color="inherit"
                    href="/app/subjects"
                    sx={{ display: 'flex', alignItems: 'center' }}
                >
                    <BookIcon sx={{ mr: 0.5 }} fontSize="small" />
                    Subjects
                </Link>
                <Link
                    underline="hover"
                    color="inherit"
                    href={`/app/subjects/${id}`}
                    sx={{ display: 'flex', alignItems: 'center' }}
                >
                    {subject.name}
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
                    Edit Subject: {subject.name}
                </Typography>
            </Paper>

            {/* Form */}
            <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
                <Formik
                    initialValues={{
                        name: subject.name || "",
                        description: subject.description || "",
                        duration: subject.duration || "",
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
                                                    "& .MuiFormHelperText-root": {
                                                        color: errors.name ? "error.main" : "text.secondary"
                                                    }
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
                                            onClick={() => navigate(`/app/subjects/${id}`)}
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
                                            {isSubmitting ? "Saving..." : "Save Changes"}
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

export default SubjectEdit; 