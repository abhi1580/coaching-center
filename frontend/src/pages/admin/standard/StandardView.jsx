import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
    Box,
    Button,
    Paper,
    Typography,
    Grid,
    Chip,
    CircularProgress,
    Divider,
    Breadcrumbs,
    Link,
    useTheme,
    alpha,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Tooltip,
} from "@mui/material";
import {
    Edit as EditIcon,
    School as SchoolIcon,
    Home as HomeIcon,
    Book as BookIcon,
    Description as DescriptionIcon,
} from "@mui/icons-material";
import { standardService } from "../../../services/api";

const StandardView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const theme = useTheme();

    const [standard, setStandard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
    }, [id]);

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
                <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                    {standard.name}
                </Typography>
            </Breadcrumbs>

            {/* Enhanced Header */}
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
                        flex: 1,
                    }}
                >
                    {standard.name}
                </Typography>
                <Chip
                    label={standard.isActive ? "Active" : "Inactive"}
                    color={standard.isActive ? "success" : "default"}
                    sx={{ fontWeight: 500 }}
                />
            </Paper>

            {/* Standard Details */}
            <Grid container spacing={3}>
                {/* Main Details Section */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                        <Typography
                            variant="h6"
                            color="primary"
                            sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                            <SchoolIcon fontSize="small" />
                            Standard Details
                        </Typography>
                        <Divider sx={{ mb: 3 }} />

                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                                        Level
                                    </Typography>
                                    <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <SchoolIcon fontSize="small" color="action" />
                                        {standard.level || "Not specified"}
                                    </Typography>
                                </Box>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                                        Status
                                    </Typography>
                                    <Chip
                                        label={standard.isActive ? "Active" : "Inactive"}
                                        color={standard.isActive ? "success" : "default"}
                                        size="small"
                                        sx={{ fontWeight: 500 }}
                                    />
                                </Box>
                            </Grid>

                            <Grid item xs={12}>
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                                        Description
                                    </Typography>
                                    <Typography variant="body1" sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                        <DescriptionIcon fontSize="small" color="action" sx={{ mt: 0.5 }} />
                                        {standard.description || "No description available"}
                                    </Typography>
                                </Box>
                            </Grid>

                            {standard.subjects && standard.subjects.length > 0 && (
                                <Grid item xs={12}>
                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                                            Associated Subjects
                                        </Typography>
                                        <List>
                                            {standard.subjects.map((subject) => (
                                                <ListItem
                                                    key={subject._id || subject}
                                                    sx={{
                                                        py: 0.5,
                                                        px: 0,
                                                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                                                    }}
                                                >
                                                    <ListItemIcon sx={{ minWidth: 40 }}>
                                                        <BookIcon fontSize="small" color="primary" />
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={typeof subject === 'object' ? subject.name : subject}
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Box>
                                </Grid>
                            )}
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>

            {/* Action Buttons */}
            <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={() => navigate(`/app/standards/${id}/edit`)}
                    sx={{ borderRadius: 2 }}
                >
                    Edit Standard
                </Button>
            </Box>
        </Box>
    );
};

export default StandardView; 