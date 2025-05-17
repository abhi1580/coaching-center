import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    Box,
    Button,
    Paper,
    Typography,
    Grid,
    Breadcrumbs,
    Link,
    Divider,
    Chip,
    Card,
    CardContent,
    Avatar,
    List,
    ListItem,
    ListItemText,
    useTheme,
    alpha,
} from "@mui/material";
import {
    Person as PersonIcon,
    Home as HomeIcon,
    Edit as EditIcon,
    School as SchoolIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    CalendarMonth as CalendarIcon,
    LocationOn as LocationIcon,
    WorkHistory as WorkIcon,
    Star as StarIcon,
    AttachMoney as AttachMoneyIcon,
} from "@mui/icons-material";
import {
    fetchTeacherById
} from "../../../store/slices/teacherSlice";
import Loader from "../../../components/common/Loader";
import { format } from "date-fns";

const TeacherView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const theme = useTheme();

    const { currentTeacher, loading, error } = useSelector((state) => state.teachers);

    useEffect(() => {
        if (id) {
            dispatch(fetchTeacherById(id));
        }
    }, [dispatch, id]);

    if (loading) return <Loader />;

    if (error) {
        return (
            <Box sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="h6" color="error">
                    Error: {error}
                </Typography>
                <Button
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={() => navigate("/app/teachers")}
                >
                    Back to Teachers
                </Button>
            </Box>
        );
    }

    if (!currentTeacher) {
        return (
            <Box sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="h6">
                    Teacher not found
                </Typography>
                <Button
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={() => navigate("/app/teachers")}
                >
                    Back to Teachers
                </Button>
            </Box>
        );
    }

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            return format(new Date(dateString), "PPP");
        } catch (error) {
            return dateString;
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
                    href="/app/teachers"
                    sx={{ display: 'flex', alignItems: 'center' }}
                >
                    <PersonIcon sx={{ mr: 0.5 }} fontSize="small" />
                    Teachers
                </Link>
                <Typography color="text.primary">
                    {currentTeacher.name || "Teacher Details"}
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
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 2,
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar
                        sx={{
                            width: { xs: 60, sm: 80 },
                            height: { xs: 60, sm: 80 },
                            bgcolor: "primary.main",
                            fontSize: { xs: 32, sm: 40 },
                        }}
                    >
                        {currentTeacher.name ? currentTeacher.name.charAt(0).toUpperCase() : "T"}
                    </Avatar>
                    <Box>
                        <Typography
                            variant="h4"
                            component="h1"
                            sx={{
                                fontSize: { xs: "1.5rem", sm: "2rem" },
                                fontWeight: 600,
                                color: "primary.main",
                            }}
                        >
                            {currentTeacher.name}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                            <Chip
                                label={currentTeacher.status === "active" ? "Active" : "Inactive"}
                                color={currentTeacher.status === "active" ? "success" : "error"}
                                size="small"
                                sx={{ mr: 1 }}
                            />
                            <Typography variant="body2" color="text.secondary">
                                <WorkIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: "middle" }} />
                                {currentTeacher.experience} {Number(currentTeacher.experience) === 1 ? "year" : "years"} of experience
                            </Typography>
                        </Box>
                    </Box>
                </Box>
                <Box>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<EditIcon />}
                        onClick={() => navigate(`/app/teachers/${id}/edit`)}
                    >
                        Edit
                    </Button>
                </Box>
            </Paper>

            {/* All Teacher Information in a single section */}
            <Grid container spacing={3}>
                {/* Personal Information */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: "100%", borderRadius: 2 }}>
                        <CardContent>
                            <Typography variant="h6" color="primary" gutterBottom>
                                Personal Information
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <List disablePadding>
                                <ListItem sx={{ py: 1, px: 0 }}>
                                    <PersonIcon sx={{ mr: 2, color: "primary.main" }} />
                                    <ListItemText
                                        primary="Full Name"
                                        secondary={currentTeacher.name || "N/A"}
                                    />
                                </ListItem>
                                <ListItem sx={{ py: 1, px: 0 }}>
                                    <PersonIcon sx={{ mr: 2, color: "primary.main" }} />
                                    <ListItemText
                                        primary="Gender"
                                        secondary={
                                            currentTeacher.gender
                                                ? currentTeacher.gender.charAt(0).toUpperCase() + currentTeacher.gender.slice(1)
                                                : "N/A"
                                        }
                                    />
                                </ListItem>
                                <ListItem sx={{ py: 1, px: 0 }}>
                                    <EmailIcon sx={{ mr: 2, color: "primary.main" }} />
                                    <ListItemText
                                        primary="Email"
                                        secondary={currentTeacher.email || "N/A"}
                                    />
                                </ListItem>
                                <ListItem sx={{ py: 1, px: 0 }}>
                                    <PhoneIcon sx={{ mr: 2, color: "primary.main" }} />
                                    <ListItemText
                                        primary="Phone Number"
                                        secondary={currentTeacher.phone || "N/A"}
                                    />
                                </ListItem>
                                <ListItem sx={{ py: 1, px: 0 }}>
                                    <LocationIcon sx={{ mr: 2, color: "primary.main" }} />
                                    <ListItemText
                                        primary="Address"
                                        secondary={currentTeacher.address || "N/A"}
                                    />
                                </ListItem>
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Professional Information */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: "100%", borderRadius: 2 }}>
                        <CardContent>
                            <Typography variant="h6" color="primary" gutterBottom>
                                Professional Information
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <List disablePadding>
                                <ListItem sx={{ py: 1, px: 0 }}>
                                    <SchoolIcon sx={{ mr: 2, color: "primary.main" }} />
                                    <ListItemText
                                        primary="Qualification"
                                        secondary={currentTeacher.qualification || "N/A"}
                                    />
                                </ListItem>
                                <ListItem sx={{ py: 1, px: 0 }}>
                                    <StarIcon sx={{ mr: 2, color: "primary.main" }} />
                                    <ListItemText
                                        primary="Specialization"
                                        secondary={currentTeacher.specialization || "N/A"}
                                    />
                                </ListItem>
                                <ListItem sx={{ py: 1, px: 0 }}>
                                    <WorkIcon sx={{ mr: 2, color: "primary.main" }} />
                                    <ListItemText
                                        primary="Experience"
                                        secondary={`${currentTeacher.experience || "0"} ${Number(currentTeacher.experience) === 1 ? "year" : "years"}`}
                                    />
                                </ListItem>
                                <ListItem sx={{ py: 1, px: 0 }}>
                                    <CalendarIcon sx={{ mr: 2, color: "primary.main" }} />
                                    <ListItemText
                                        primary="Joining Date"
                                        secondary={formatDate(currentTeacher.joiningDate)}
                                    />
                                </ListItem>
                                <ListItem sx={{ py: 1, px: 0 }}>
                                    <AttachMoneyIcon sx={{ mr: 2, color: "primary.main" }} />
                                    <ListItemText
                                        primary="Salary"
                                        secondary={currentTeacher.salary ? `$${currentTeacher.salary}` : "N/A"}
                                    />
                                </ListItem>
                                <ListItem sx={{ py: 1, px: 0 }}>
                                    <PersonIcon sx={{ mr: 2, color: "primary.main" }} />
                                    <ListItemText
                                        primary="Status"
                                        secondary={
                                            <Chip
                                                label={currentTeacher.status === "active" ? "Active" : "Inactive"}
                                                color={currentTeacher.status === "active" ? "success" : "error"}
                                                size="small"
                                            />
                                        }
                                    />
                                </ListItem>
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Assigned Subjects */}
                <Grid item xs={12}>
                    <Card sx={{ borderRadius: 2 }}>
                        <CardContent>
                            <Typography variant="h6" color="primary" gutterBottom>
                                Assigned Subjects
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            {Array.isArray(currentTeacher.subjects) && currentTeacher.subjects.length > 0 ? (
                                <Grid container spacing={2}>
                                    {currentTeacher.subjects.map((subject) => (
                                        <Grid item xs={12} sm={6} md={4} lg={3} key={subject._id || subject}>
                                            <Card
                                                sx={{
                                                    p: 2,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 2,
                                                    transition: 'all 0.3s',
                                                    '&:hover': {
                                                        boxShadow: 3,
                                                    }
                                                }}
                                            >
                                                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                                                    <SchoolIcon />
                                                </Avatar>
                                                <Box sx={{ flexGrow: 1 }}>
                                                    <Typography variant="subtitle2" component="div">
                                                        {typeof subject === 'object' ? subject.name : `Subject ID: ${subject}`}
                                                    </Typography>
                                                    {subject.course && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            {subject.course.name}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            ) : (
                                <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
                                    No subjects assigned to this teacher.
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default TeacherView; 