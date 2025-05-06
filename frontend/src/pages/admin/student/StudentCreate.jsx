import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Paper,
    Typography,
    Button,
    Alert,
    AlertTitle,
    Breadcrumbs,
    Link,
    useTheme,
    alpha,
} from "@mui/material";
import {
    Home as HomeIcon,
    Person as PersonIcon,
    Class as ClassIcon,
    ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";

const StudentCreate = () => {
    const navigate = useNavigate();
    const theme = useTheme();

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
                <Typography color="text.primary">
                    Create
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
                        Create New Student
                    </Typography>
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate("/app/students")}
                    >
                        Back to Students
                    </Button>
                </Box>
            </Paper>

            {/* Information Message */}
            <Alert
                severity="info"
                sx={{
                    mb: 3,
                    borderRadius: 2,
                    boxShadow: theme.shadows[1],
                }}
            >
                <AlertTitle>Student Creation Process</AlertTitle>
                <Typography variant="body1" paragraph>
                    New students are created through the batch enrollment process in the Coaching Center.
                    This ensures that students are properly assigned to classes and subjects.
                </Typography>
                <Typography variant="body1" paragraph>
                    To create a new student, please go to the Batches section and add a student to a specific batch.
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<ClassIcon />}
                        onClick={() => navigate("/app/batches")}
                    >
                        Go to Batches
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate("/app/students")}
                    >
                        Back to Students
                    </Button>
                </Box>
            </Alert>
        </Box>
    );
};

export default StudentCreate; 