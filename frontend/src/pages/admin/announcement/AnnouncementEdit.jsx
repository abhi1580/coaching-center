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
    useTheme,
    alpha,
    CircularProgress,
    FormHelperText,
} from "@mui/material";
import {
    Notifications as NotificationsIcon,
    Home as HomeIcon,
    Save as SaveIcon,
    ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import {
    fetchAnnouncement,
    updateAnnouncement,
    formatDateForInput,
    formatDate
} from "../../../store/slices/announcementSlice";
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

const AnnouncementEdit = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const theme = useTheme();

    const { currentAnnouncement, loading } = useSelector((state) => state.announcements);
    const { user } = useSelector((state) => state.auth);
    const isAdmin = user && user.role === "admin";
    const [formLoading, setFormLoading] = useState(false);

    // Redirect non-admin users to their respective announcement view pages
    useEffect(() => {
        if (user && !isAdmin) {
            if (user.role === "teacher") {
                navigate(`/app/teacher/announcements/${id}`);
            } else if (user.role === "student") {
                navigate(`/app/student/announcements/${id}`);
            }
        }
    }, [user, isAdmin, navigate, id]);

    useEffect(() => {
        dispatch(fetchAnnouncement(id));
    }, [dispatch, id]);

    // Prepare form values when announcement data is loaded
    const getInitialValues = () => {
        // Function to get the actual announcement data, accounting for potential nesting
        const getAnnouncementData = () => {
            if (!currentAnnouncement) return null;

            // Handle case where response has a nested data structure
            if (currentAnnouncement.data) {
                return currentAnnouncement.data;
            }

            // Handle case where response is the announcement directly
            return currentAnnouncement;
        };

        const announcementData = getAnnouncementData();

        if (!announcementData) {
            return {
                title: "",
                content: "",
                type: "General",
                priority: "Medium",
                targetAudience: "All",
                startDate: formatDateForInput(new Date()),
                endDate: formatDateForInput(new Date()),
                status: "scheduled"
            };
        }

        // Extract date from the announcement's datetime fields
        const startDate = announcementData.startDate || announcementData.startTime;
        const endDate = announcementData.endDate || announcementData.endTime;

        // Format dates for the input fields (just the date part)
        const startDateStr = formatDateForInput(new Date(startDate));
        const endDateStr = formatDateForInput(new Date(endDate));

        // Make sure we set all available values from the announcement data
        return {
            title: announcementData.title || "",
            content: announcementData.content || "",
            type: announcementData.type || "General",
            priority: announcementData.priority || "Medium",
            targetAudience: announcementData.targetAudience || "All",
            startDate: startDateStr,
            endDate: endDateStr,
            // Make sure to include any additional fields that might be in the announcement
            status: announcementData.status || "active", // Preserving status even if not directly editable
            createdBy: announcementData.createdBy || null, // Preserving creator info for reference
            createdAt: announcementData.createdAt || null // Preserving creation date for reference
        };
    };

    const handleSubmit = async (values, { setSubmitting }) => {
        setSubmitting(true);
        setFormLoading(true);

        try {
            await dispatch(updateAnnouncement({ id, data: values })).unwrap();

            // Success notification
            Swal.fire({
                icon: 'success',
                title: 'Announcement Updated!',
                text: 'The announcement has been successfully updated.',
                confirmButtonColor: theme.palette.primary.main,
            });

            navigate(`/app/announcements/${id}`);
        } catch (error) {
            console.error("Error updating announcement:", error);

            // Error notification
            Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text: error.message || "Failed to update announcement. Please try again.",
                confirmButtonColor: theme.palette.primary.main,
            });
        } finally {
            setFormLoading(false);
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
                <Typography color="text.primary">
                    Edit {currentAnnouncement?.title || "Announcement"}
                </Typography>
            </Breadcrumbs>

            {/* Action buttons */}
            <Box sx={{ display: 'flex', mb: 3 }}>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(`/app/announcements/${id}`)}
                    sx={{ borderRadius: 2 }}
                >
                    Back to Announcement
                </Button>
            </Box>

            {/* Loading state */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : !currentAnnouncement ? (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6" color="error">
                        Announcement not found
                    </Typography>
                </Paper>
            ) : (
                <>
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
                        <Typography
                            variant="h4"
                            component="h1"
                            sx={{
                                fontSize: { xs: "1.5rem", sm: "2rem" },
                                fontWeight: 600,
                                color: "primary.main",
                            }}
                        >
                            Edit Announcement
                        </Typography>
                    </Paper>

                    {/* Edit Form */}
                    <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
                        <Formik
                            initialValues={getInitialValues()}
                            validationSchema={validationSchema}
                            onSubmit={handleSubmit}
                            enableReinitialize
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
                                                variant="outlined"
                                                value={values.status || "unknown"}
                                                disabled={true}
                                                InputProps={{
                                                    readOnly: true,
                                                }}
                                                helperText="Status is determined automatically based on dates"
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

                                        {/* Metadata section */}
                                        {currentAnnouncement && (
                                            <Grid item xs={12}>
                                                <Paper
                                                    elevation={0}
                                                    sx={{
                                                        p: 2,
                                                        backgroundColor: alpha(theme.palette.background.default, 0.5),
                                                        borderRadius: 1,
                                                        mt: 2,
                                                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                                                    }}
                                                >
                                                    <Typography variant="subtitle2" color="primary" gutterBottom>
                                                        Announcement Metadata
                                                    </Typography>
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={12} md={6}>
                                                            <Typography variant="caption" color="text.secondary" display="block">
                                                                Created By
                                                            </Typography>
                                                            <Typography variant="body2">
                                                                {(() => {
                                                                    // Access data safely
                                                                    const data = currentAnnouncement.data || currentAnnouncement;
                                                                    return data.createdBy?.name || "Unknown";
                                                                })()}
                                                            </Typography>
                                                        </Grid>
                                                        <Grid item xs={12} md={6}>
                                                            <Typography variant="caption" color="text.secondary" display="block">
                                                                Created At
                                                            </Typography>
                                                            <Typography variant="body2">
                                                                {(() => {
                                                                    // Access data safely
                                                                    const data = currentAnnouncement.data || currentAnnouncement;
                                                                    return formatDate(data.createdAt);
                                                                })()}
                                                            </Typography>
                                                        </Grid>
                                                    </Grid>
                                                </Paper>
                                            </Grid>
                                        )}

                                        <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
                                            <Button
                                                variant="outlined"
                                                onClick={() => navigate(`/app/announcements/${id}`)}
                                                disabled={isSubmitting}
                                                sx={{ borderRadius: 2 }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                startIcon={
                                                    formLoading ? (
                                                        <CircularProgress size={20} color="inherit" />
                                                    ) : (
                                                        <SaveIcon />
                                                    )
                                                }
                                                disabled={isSubmitting}
                                                sx={{ borderRadius: 2 }}
                                            >
                                                {formLoading ? "Saving..." : "Save Changes"}
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Form>
                            )}
                        </Formik>
                    </Paper>
                </>
            )}
        </Box>
    );
};

export default AnnouncementEdit; 