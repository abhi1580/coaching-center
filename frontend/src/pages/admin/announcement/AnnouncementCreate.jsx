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
    CircularProgress,
    FormHelperText,
} from "@mui/material";
import {
    Notifications as NotificationsIcon,
    Home as HomeIcon,
    Save as SaveIcon,
} from "@mui/icons-material";
import { createAnnouncement, formatDateForInput } from "../../../store/slices/announcementSlice";
import * as Yup from "yup";
import { Formik, Form } from "formik";
import Swal from "sweetalert2";

const validationSchema = Yup.object({
    title: Yup.string().required("Title is required"),
    content: Yup.string().required("Content is required"),
    type: Yup.string()
        .oneOf(
            ["General", "Event", "Holiday", "Exam", "Emergency", "Other"],
            "Invalid type"
        )
        .required("Type is required"),
    priority: Yup.string()
        .oneOf(["High", "Medium", "Low"], "Invalid priority")
        .required("Priority is required"),
    targetAudience: Yup.string()
        .oneOf(
            ["All", "Students", "Teachers", "Parents"],
            "Invalid target audience"
        )
        .required("Target audience is required"),
    startDate: Yup.date()
        .required("Start date is required")
        .test(
            'is-today-or-future',
            'Start date must be today or later (announcement starts at 00:00)',
            function (value) {
                if (!value) return false;
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return value >= today;
            }
        ),
    endDate: Yup.date()
        .required("End date is required")
        .test(
            'is-after-start',
            'End date must be on or after the start date (announcement ends at 23:59)',
            function (value) {
                const { startDate } = this.parent;
                if (!value || !startDate) return false;
                return value >= startDate;
            }
        ),
});

const AnnouncementCreate = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const theme = useTheme();
    const [loading, setLoading] = useState(false);

    // Get user state to check admin access
    const { user } = useSelector((state) => state.auth);
    const isAdmin = user && user.role === "admin";

    // Redirect non-admin users away from create page
    useEffect(() => {
        if (user && !isAdmin) {
            if (user.role === "teacher") {
                navigate("/app/teacher/dashboard");
            } else if (user.role === "student") {
                navigate("/app/student/dashboard");
            }
        }
    }, [user, isAdmin, navigate]);

    // Get today's date in YYYY-MM-DD format for the date inputs
    const getTodayDateString = () => {
        const today = new Date();
        // Use direct date component extraction for consistent behavior across devices
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const initialValues = {
        title: "",
        content: "",
        type: "General",
        priority: "Medium",
        targetAudience: "All",
        startDate: getTodayDateString(),
        endDate: getTodayDateString(),
    };

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        setSubmitting(true);
        setLoading(true);

        try {
            await dispatch(createAnnouncement(values)).unwrap();

            // Success notification
            Swal.fire({
                icon: 'success',
                title: 'Announcement Created!',
                text: 'The announcement has been successfully created.',
                confirmButtonColor: theme.palette.primary.main,
            });

            resetForm();
            navigate("/app/announcements");
        } catch (error) {
            console.error("Error creating announcement:", error);

            // Error notification
            Swal.fire({
                icon: 'error',
                title: 'Creation Failed',
                text: error.message || "Failed to create announcement. Please try again.",
                confirmButtonColor: theme.palette.primary.main,
            });
        } finally {
            setLoading(false);
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
                    href="/app/announcements"
                    sx={{ display: 'flex', alignItems: 'center' }}
                >
                    <NotificationsIcon sx={{ mr: 0.5 }} fontSize="small" />
                    Announcements
                </Link>
                <Typography color="text.primary">Create Announcement</Typography>
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
                    Create New Announcement
                </Typography>
            </Paper>

            {/* Create Form */}
            <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
                        <Form>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        id="title"
                                        name="title"
                                        label="Title"
                                        variant="outlined"
                                        value={values.title}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.title && Boolean(errors.title)}
                                        helperText={touched.title && errors.title}
                                        disabled={isSubmitting}
                                        placeholder="Enter announcement title"
                                    />
                                </Grid>

                                <Grid item xs={12} md={3}>
                                    <TextField
                                        fullWidth
                                        select
                                        id="type"
                                        name="type"
                                        label="Type"
                                        variant="outlined"
                                        value={values.type}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.type && Boolean(errors.type)}
                                        helperText={touched.type && errors.type}
                                        disabled={isSubmitting}
                                    >
                                        <MenuItem value="General">General</MenuItem>
                                        <MenuItem value="Event">Event</MenuItem>
                                        <MenuItem value="Holiday">Holiday</MenuItem>
                                        <MenuItem value="Exam">Exam</MenuItem>
                                        <MenuItem value="Emergency">Emergency</MenuItem>
                                        <MenuItem value="Other">Other</MenuItem>
                                    </TextField>
                                </Grid>

                                <Grid item xs={12} md={3}>
                                    <TextField
                                        fullWidth
                                        select
                                        id="priority"
                                        name="priority"
                                        label="Priority"
                                        variant="outlined"
                                        value={values.priority}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.priority && Boolean(errors.priority)}
                                        helperText={touched.priority && errors.priority}
                                        disabled={isSubmitting}
                                    >
                                        <MenuItem value="High">High</MenuItem>
                                        <MenuItem value="Medium">Medium</MenuItem>
                                        <MenuItem value="Low">Low</MenuItem>
                                    </TextField>
                                </Grid>

                                <Grid item xs={12} md={3}>
                                    <TextField
                                        fullWidth
                                        select
                                        id="targetAudience"
                                        name="targetAudience"
                                        label="Target Audience"
                                        variant="outlined"
                                        value={values.targetAudience}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.targetAudience && Boolean(errors.targetAudience)}
                                        helperText={touched.targetAudience && errors.targetAudience}
                                        disabled={isSubmitting}
                                    >
                                        <MenuItem value="All">All</MenuItem>
                                        <MenuItem value="Students">Students</MenuItem>
                                        <MenuItem value="Teachers">Teachers</MenuItem>
                                        <MenuItem value="Parents">Parents</MenuItem>
                                    </TextField>
                                </Grid>

                                <Grid item xs={12} md={3}>
                                    <TextField
                                        fullWidth
                                        id="status"
                                        name="status"
                                        label="Status"
                                        variant="filled"
                                        value="Scheduled"
                                        disabled={true}
                                        InputProps={{
                                            readOnly: true,
                                        }}
                                        helperText="New announcements are scheduled by default"
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Box>
                                        <Typography variant="subtitle2" color="primary" gutterBottom>
                                            Start Date
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            id="startDate"
                                            name="startDate"
                                            label="Start Date"
                                            type="date"
                                            variant="outlined"
                                            value={values.startDate}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={touched.startDate && Boolean(errors.startDate)}
                                            helperText={(touched.startDate && errors.startDate) || "Announcement will start at 00:00 on this date"}
                                            disabled={isSubmitting}
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                        />
                                    </Box>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Box>
                                        <Typography variant="subtitle2" color="primary" gutterBottom>
                                            End Date
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            id="endDate"
                                            name="endDate"
                                            label="End Date"
                                            type="date"
                                            variant="outlined"
                                            value={values.endDate}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={touched.endDate && Boolean(errors.endDate)}
                                            helperText={(touched.endDate && errors.endDate) || "Announcement will end at 23:59 on this date"}
                                            disabled={isSubmitting}
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                        />
                                    </Box>
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        id="content"
                                        name="content"
                                        label="Content"
                                        variant="outlined"
                                        multiline
                                        rows={6}
                                        value={values.content}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.content && Boolean(errors.content)}
                                        helperText={touched.content && errors.content}
                                        disabled={isSubmitting}
                                        placeholder="Enter announcement content"
                                    />
                                </Grid>

                                <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => navigate("/app/announcements")}
                                        disabled={isSubmitting}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        startIcon={
                                            loading ? (
                                                <CircularProgress size={20} color="inherit" />
                                            ) : (
                                                <SaveIcon />
                                            )
                                        }
                                        disabled={isSubmitting}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        {loading ? "Creating..." : "Create Announcement"}
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

export default AnnouncementCreate; 