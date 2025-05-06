import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    Box,
    Button,
    Paper,
    Typography,
    Grid,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    useTheme,
    alpha,
    CircularProgress,
    Breadcrumbs,
    Link,
    Alert,
    Card,
    CardContent,
    CardActions,
    Divider,
} from "@mui/material";
import {
    Save as SaveIcon,
    Cancel as CancelIcon,
    Person as PersonIcon,
    Home as HomeIcon,
    ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { fetchStudents, updateStudent } from "../../../store/slices/studentSlice";
import { useFormik } from "formik";
import * as Yup from "yup";

const validationSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phone: Yup.string()
        .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
        .required("Phone number is required"),
    address: Yup.string().required("Address is required"),
    password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .nullable(),
});

const StudentEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const theme = useTheme();

    const { students, loading, error } = useSelector((state) => state.students);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // Load data initially
    useEffect(() => {
        dispatch(fetchStudents());
    }, [dispatch]);

    // Set selected student when data is loaded
    useEffect(() => {
        if (students && id) {
            const student = students.find((s) => s._id === id);
            if (student) {
                setSelectedStudent(student);
            }
        }
    }, [students, id]);

    const formik = useFormik({
        initialValues: {
            name: "",
            email: "",
            phone: "",
            address: "",
            password: "",
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            setSubmitLoading(true);
            setSubmitError(null);
            setSubmitSuccess(false);

            try {
                // Only include password if not empty
                const updatedValues = { ...values };
                if (!updatedValues.password) {
                    delete updatedValues.password;
                }

                await dispatch(
                    updateStudent({
                        id: id,
                        studentData: updatedValues,
                    })
                ).unwrap();

                setSubmitSuccess(true);
                // Navigate back after successful update
                setTimeout(() => {
                    navigate(`/app/students/${id}`);
                }, 1500);
            } catch (error) {
                console.error("Error updating student:", error);
                setSubmitError(
                    error.message || "Failed to update student. Please try again."
                );
            } finally {
                setSubmitLoading(false);
            }
        },
    });

    // Set form values when student data is loaded
    useEffect(() => {
        if (selectedStudent) {
            formik.setValues({
                name: selectedStudent.name || "",
                email: selectedStudent.email || "",
                phone: selectedStudent.phone || "",
                address: selectedStudent.address || "",
                password: "", // Empty for editing
            });
        }
    }, [selectedStudent]);

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ m: 2 }}>
                Error loading student data: {error}
            </Alert>
        );
    }

    if (!selectedStudent) {
        return (
            <Alert severity="info" sx={{ m: 2 }}>
                Student not found. The student may have been deleted or the ID is invalid.
            </Alert>
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
                    href="/app/students"
                    sx={{ display: 'flex', alignItems: 'center' }}
                >
                    <PersonIcon sx={{ mr: 0.5 }} fontSize="small" />
                    Students
                </Link>
                <Link
                    underline="hover"
                    color="inherit"
                    href={`/app/students/${id}`}
                    sx={{ display: 'flex', alignItems: 'center' }}
                >
                    {selectedStudent.name}
                </Link>
                <Typography color="text.primary">
                    Edit
                </Typography>
            </Breadcrumbs>

            {/* Header */}
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
                        Edit Student: {selectedStudent.name}
                    </Typography>
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate(`/app/students/${id}`)}
                    >
                        Back to Details
                    </Button>
                </Box>
            </Paper>

            {/* Form */}
            <form onSubmit={formik.handleSubmit}>
                <Card sx={{ borderRadius: 2, mb: 3 }}>
                    <CardContent>
                        <Typography
                            variant="h6"
                            sx={{
                                mb: 2,
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                fontWeight: 600,
                                color: "primary.main",
                            }}
                        >
                            <PersonIcon fontSize="small" />
                            Personal Information
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    name="name"
                                    label="Name"
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.name && Boolean(formik.errors.name)}
                                    helperText={formik.touched.name && formik.errors.name}
                                    required
                                    margin="normal"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    name="email"
                                    label="Email"
                                    value={formik.values.email}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.email && Boolean(formik.errors.email)}
                                    helperText={formik.touched.email && formik.errors.email}
                                    required
                                    margin="normal"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    name="phone"
                                    label="Phone"
                                    value={formik.values.phone}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.phone && Boolean(formik.errors.phone)}
                                    helperText={formik.touched.phone && formik.errors.phone}
                                    required
                                    margin="normal"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    name="address"
                                    label="Address"
                                    value={formik.values.address}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.address && Boolean(formik.errors.address)}
                                    helperText={formik.touched.address && formik.errors.address}
                                    required
                                    margin="normal"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    name="password"
                                    label="Password (Optional)"
                                    type="password"
                                    value={formik.values.password}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.password && Boolean(formik.errors.password)}
                                    helperText={formik.touched.password && formik.errors.password || "Leave blank to keep current password"}
                                    margin="normal"
                                />
                            </Grid>
                        </Grid>

                        {/* Display success or error message */}
                        {submitSuccess && (
                            <Alert severity="success" sx={{ mt: 2 }}>
                                Student updated successfully!
                            </Alert>
                        )}
                        {submitError && (
                            <Alert severity="error" sx={{ mt: 2 }}>
                                {submitError}
                            </Alert>
                        )}
                    </CardContent>
                    <CardActions sx={{ p: 2, justifyContent: "flex-end" }}>
                        <Button
                            variant="outlined"
                            color="inherit"
                            startIcon={<CancelIcon />}
                            onClick={() => navigate(`/app/students/${id}`)}
                            disabled={submitLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            startIcon={<SaveIcon />}
                            disabled={submitLoading || !formik.isValid || !formik.dirty}
                            sx={{ ml: 1 }}
                        >
                            {submitLoading ? (
                                <>
                                    <CircularProgress size={20} sx={{ mr: 1 }} />
                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </CardActions>
                </Card>
            </form>

            {/* Additional information about read-only fields */}
            <Alert severity="info" sx={{ mt: 2, mb: 3, borderRadius: 2 }}>
                <Typography variant="body2">
                    Only personal details can be edited here. Other information such as Standard, Batches,
                    Parent Information and Academic details can be modified through the Batch management system.
                </Typography>
            </Alert>
        </Box>
    );
};

export default StudentEdit; 