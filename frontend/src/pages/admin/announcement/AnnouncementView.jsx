import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    Box,
    Button,
    Paper,
    Typography,
    Grid,
    Breadcrumbs,
    Link,
    useTheme,
    alpha,
    Chip,
    Divider,
    Stack,
    CircularProgress,
} from "@mui/material";
import {
    Notifications as NotificationsIcon,
    Home as HomeIcon,
    ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import {
    fetchAnnouncement,
    formatDate,
    getStatusColor
} from "../../../store/slices/announcementSlice";

const AnnouncementView = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const theme = useTheme();

    const { currentAnnouncement, loading } = useSelector((state) => state.announcements);
    const { user } = useSelector((state) => state.auth);
    const isAdmin = user && user.role === "admin";

    // Redirect non-admin users to their proper announcement view pages
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

        // Set up a refresh interval to keep status updated
        const refreshInterval = setInterval(() => {
            dispatch(fetchAnnouncement(id));
        }, 5000); // Refresh every 5 seconds

        // Clean up interval on component unmount
        return () => clearInterval(refreshInterval);
    }, [dispatch, id]);

    // Helper to safely access announcement data, regardless of nesting
    const getAnnouncementData = () => {
        if (!currentAnnouncement) return null;

        // Handle case where response has a nested data structure
        if (currentAnnouncement.data) {
            return currentAnnouncement.data;
        }

        // Handle case where response is the announcement directly
        return currentAnnouncement;
    }

    // Access the announcement data safely
    const announcementData = getAnnouncementData();

    // Get priority color
    const getPriorityColor = (priority) => {
        switch (priority) {
            case "High":
                return "error";
            case "Medium":
                return "warning";
            case "Low":
                return "success";
            default:
                return "default";
        }
    };

    // Get type color
    const getTypeColor = (type) => {
        switch (type) {
            case "Event":
                return "secondary";
            case "Holiday":
                return "success";
            case "Exam":
                return "warning";
            case "Emergency":
                return "error";
            case "General":
                return "info";
            default:
                return "default";
        }
    };

    // Get the correct route base path based on user role
    const getBasePath = () => {
        if (user.role === "admin") return "/app";
        if (user.role === "teacher") return "/app/teacher";
        if (user.role === "student") return "/app/student";
        return "/app"; // fallback
    };

    // Navigate back to announcements list with the correct path
    const navigateToAnnouncements = () => {
        const basePath = getBasePath();
        navigate(`${basePath}/announcements`);
    };

    // Navigate to dashboard with the correct path
    const navigateToDashboard = () => {
        const basePath = getBasePath();
        navigate(`${basePath}/dashboard`);
    };

    // Calculate real-time status based on current time and announcement dates
    const calculateCurrentStatus = (announcement) => {
        if (!announcement) return "";

        const now = new Date();
        const startDate = new Date(announcement.startDate);
        const endDate = new Date(announcement.endDate);

        if (endDate < now) {
            return "expired";
        } else if (startDate <= now && endDate >= now) {
            return "active";
        } else {
            return "scheduled";
        }
    };

    // Get the current real-time status
    const currentStatus = announcementData ? calculateCurrentStatus(announcementData) : "";

    // Check if status has changed from what's stored
    const statusChanged = announcementData && currentStatus !== announcementData.status;

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
                    onClick={navigateToDashboard}
                    sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                >
                    <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
                    Dashboard
                </Link>
                <Link
                    underline="hover"
                    color="inherit"
                    onClick={navigateToAnnouncements}
                    sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                >
                    <NotificationsIcon sx={{ mr: 0.5 }} fontSize="small" />
                    Announcements
                </Link>
                <Typography color="text.primary">
                    {loading ? "Loading..." : announcementData ? announcementData.title : "View Announcement"}
                </Typography>
            </Breadcrumbs>

            {/* Loading state */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : !announcementData ? (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6" color="error">
                        Announcement not found
                    </Typography>
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBackIcon />}
                        onClick={navigateToAnnouncements}
                        sx={{ borderRadius: 2, mt: 2 }}
                    >
                        Back to Announcements
                    </Button>
                </Paper>
            ) : (
                <>
                    {/* Announcement header */}
                    <Paper
                        elevation={1}
                        sx={{
                            p: { xs: 3, sm: 4 },
                            mb: 4,
                            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.03),
                            backgroundImage: (theme) => `linear-gradient(to right, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.primary.main, 0.01)})`,
                            borderRadius: 3,
                            borderLeft: (theme) => `5px solid ${theme.palette.primary.main}`,
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        <Box sx={{ position: 'relative', zIndex: 2 }}>
                            <Typography
                                variant="h4"
                                component="h1"
                                sx={{
                                    fontSize: { xs: "1.75rem", sm: "2.25rem" },
                                    fontWeight: 700,
                                    color: "primary.dark",
                                    mb: 2,
                                    lineHeight: 1.3,
                                    maxWidth: '90%'
                                }}
                            >
                                {announcementData.title}
                            </Typography>

                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={1.5}
                                sx={{
                                    mt: 2.5,
                                    flexWrap: 'wrap',
                                    '& .MuiChip-root': { mb: { xs: 0.5, sm: 1 } }
                                }}
                            >
                                <Chip
                                    label={announcementData.type}
                                    color={getTypeColor(announcementData.type)}
                                    size="medium"
                                    sx={{ fontWeight: 500, px: 1 }}
                                />
                                <Chip
                                    label={announcementData.priority}
                                    color={getPriorityColor(announcementData.priority)}
                                    size="medium"
                                    sx={{ fontWeight: 500, px: 1 }}
                                />
                                <Chip
                                    label={currentStatus || announcementData.status}
                                    color={getStatusColor(currentStatus || announcementData.status)}
                                    size="medium"
                                    sx={{
                                        fontWeight: 500,
                                        px: 1,
                                        animation: statusChanged ? 'pulse 1.5s infinite' : 'none',
                                        '@keyframes pulse': {
                                            '0%': { boxShadow: '0 0 0 0 rgba(66, 153, 225, 0.7)' },
                                            '70%': { boxShadow: '0 0 0 6px rgba(66, 153, 225, 0)' },
                                            '100%': { boxShadow: '0 0 0 0 rgba(66, 153, 225, 0)' }
                                        }
                                    }}
                                />
                                <Chip
                                    label={`For: ${announcementData.targetAudience}`}
                                    variant="outlined"
                                    size="medium"
                                    sx={{ fontWeight: 500, px: 1 }}
                                />
                            </Stack>
                        </Box>

                        {/* Decorative element */}
                        <Box
                            sx={{
                                position: 'absolute',
                                top: -20,
                                right: -20,
                                width: 120,
                                height: 120,
                                borderRadius: '50%',
                                backgroundColor: theme => alpha(theme.palette.primary.main, 0.06),
                                zIndex: 1,
                                display: { xs: 'none', md: 'block' }
                            }}
                        />
                    </Paper>

                    {/* Announcement details */}
                    <Paper
                        elevation={1}
                        sx={{
                            p: { xs: 2.5, md: 4 },
                            borderRadius: 3,
                            mb: 4,
                            boxShadow: theme => `0 3px 10px ${alpha(theme.palette.primary.main, 0.08)}`
                        }}
                    >
                        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <NotificationsIcon
                                fontSize="small"
                                color="primary"
                                sx={{
                                    p: 0.8,
                                    backgroundColor: theme => alpha(theme.palette.primary.main, 0.1),
                                    borderRadius: '50%'
                                }}
                            />
                            <Typography
                                variant="h5"
                                color="primary"
                                sx={{ fontWeight: 600 }}
                            >
                                Announcement Details
                            </Typography>
                        </Box>
                        <Divider sx={{ mb: 4 }} />

                        <Grid container spacing={4}>
                            <Grid item xs={12} md={6}>
                                <Box sx={{ mb: 3 }}>
                                    <Typography
                                        variant="subtitle1"
                                        color="text.secondary"
                                        gutterBottom
                                        sx={{ fontSize: '0.95rem', letterSpacing: 0.3 }}
                                    >
                                        START DATE
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            fontWeight: 500,
                                            fontSize: '1.05rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.8
                                        }}
                                    >
                                        {formatDate(announcementData.startDate || announcementData.startTime)}
                                        <Chip
                                            label="00:00"
                                            size="small"
                                            variant="outlined"
                                            sx={{
                                                height: 22,
                                                fontSize: '0.7rem',
                                                fontWeight: 500,
                                                backgroundColor: theme => alpha(theme.palette.info.light, 0.1)
                                            }}
                                        />
                                    </Typography>
                                </Box>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Box sx={{ mb: 3 }}>
                                    <Typography
                                        variant="subtitle1"
                                        color="text.secondary"
                                        gutterBottom
                                        sx={{ fontSize: '0.95rem', letterSpacing: 0.3 }}
                                    >
                                        END DATE
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            fontWeight: 500,
                                            fontSize: '1.05rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.8
                                        }}
                                    >
                                        {formatDate(announcementData.endDate || announcementData.endTime)}
                                        <Chip
                                            label="23:59"
                                            size="small"
                                            variant="outlined"
                                            sx={{
                                                height: 22,
                                                fontSize: '0.7rem',
                                                fontWeight: 500,
                                                backgroundColor: theme => alpha(theme.palette.info.light, 0.1)
                                            }}
                                        />
                                    </Typography>
                                </Box>
                            </Grid>

                            <Grid item xs={12}>
                                <Divider sx={{ mb: 3 }} />
                            </Grid>

                            <Grid item xs={12}>
                                <Box sx={{ mb: 4 }}>
                                    <Typography
                                        variant="subtitle1"
                                        color="text.secondary"
                                        gutterBottom
                                        sx={{ fontSize: '0.95rem', letterSpacing: 0.3, mb: 1.5 }}
                                    >
                                        CONTENT
                                    </Typography>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 3,
                                            minHeight: '180px',
                                            backgroundColor: theme => alpha(theme.palette.background.default, 0.6),
                                            borderRadius: 2,
                                            border: theme => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                whiteSpace: 'pre-wrap',
                                                position: 'relative',
                                                zIndex: 2,
                                                lineHeight: 1.7,
                                                fontSize: '1rem'
                                            }}
                                        >
                                            {announcementData.content}
                                        </Typography>

                                        {/* Decorative quotes */}
                                        <Typography
                                            variant="h2"
                                            sx={{
                                                position: 'absolute',
                                                top: -35,
                                                right: -5,
                                                fontFamily: 'serif',
                                                fontSize: '170px',
                                                color: theme => alpha(theme.palette.primary.main, 0.05),
                                                zIndex: 1,
                                                display: { xs: 'none', md: 'block' }
                                            }}
                                        >
                                            "
                                        </Typography>
                                    </Paper>
                                </Box>
                            </Grid>

                            <Grid item xs={12}>
                                <Divider sx={{ mb: 3 }} />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Box sx={{ mb: 3 }}>
                                    <Typography
                                        variant="subtitle1"
                                        color="text.secondary"
                                        gutterBottom
                                        sx={{ fontSize: '0.95rem', letterSpacing: 0.3 }}
                                    >
                                        CREATED BY
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            fontWeight: 500,
                                            fontSize: '1.05rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 26,
                                                height: 26,
                                                borderRadius: '50%',
                                                backgroundColor: theme => alpha(theme.palette.primary.main, 0.1),
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'primary.main',
                                                fontWeight: 'bold',
                                                fontSize: '0.8rem'
                                            }}
                                        >
                                            {(announcementData.createdBy?.name || "User")[0].toUpperCase()}
                                        </Box>
                                        {announcementData.createdBy?.name || "Unknown"}
                                    </Typography>
                                </Box>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Box sx={{ mb: 3 }}>
                                    <Typography
                                        variant="subtitle1"
                                        color="text.secondary"
                                        gutterBottom
                                        sx={{ fontSize: '0.95rem', letterSpacing: 0.3 }}
                                    >
                                        CREATED AT
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            fontWeight: 500,
                                            fontSize: '1.05rem'
                                        }}
                                    >
                                        {formatDate(announcementData.createdAt)}
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Action buttons */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 3 }}>
                        <Button
                            variant="outlined"
                            startIcon={<ArrowBackIcon />}
                            onClick={navigateToAnnouncements}
                            sx={{ borderRadius: 2 }}
                        >
                            Back to Announcements
                        </Button>
                    </Box>
                </>
            )}
        </Box>
    );
};

export default AnnouncementView; 