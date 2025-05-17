import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    Box,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Chip,
    IconButton,
    TextField,
    MenuItem,
    Grid,
    useTheme,
    useMediaQuery,
    alpha,
    Card,
    CardContent,
    CardActions,
    Stack,
    Tooltip,
    Breadcrumbs,
    Link,
    InputAdornment
} from "@mui/material";
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
    School as SchoolIcon,
    Search as SearchIcon,
    Clear as ClearIcon,
    Home as HomeIcon,
} from "@mui/icons-material";
import { fetchStandards, deleteStandard } from "../../../store/slices/standardSlice";
import RefreshButton from "../../../components/common/RefreshButton";
import Swal from "sweetalert2";

const StandardList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const isTablet = useMediaQuery(theme.breakpoints.down("md"));

    const { standards, loading } = useSelector((state) => state.standards);

    const [filteredStandards, setFilteredStandards] = useState([]);
    const [nameFilter, setNameFilter] = useState("");

    useEffect(() => {
        dispatch(fetchStandards());
    }, [dispatch]);

    useEffect(() => {
        if (!standards) return;

        let results = [...standards];

        if (nameFilter.trim() !== "") {
            results = results.filter((standard) =>
                standard.name.toLowerCase().includes(nameFilter.toLowerCase())
            );
        }

        setFilteredStandards(results);
    }, [standards, nameFilter]);

    const handleDeleteClick = (standard) => {
        Swal.fire({
            title: 'Delete Standard?',
            text: `Are you sure you want to delete ${standard.name}? This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: theme.palette.error.main,
            cancelButtonColor: theme.palette.grey[500],
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await dispatch(deleteStandard(standard._id)).unwrap();

                    Swal.fire({
                        title: 'Deleted!',
                        text: `${standard.name} has been successfully deleted.`,
                        icon: 'success',
                        confirmButtonColor: theme.palette.primary.main,
                    });
                } catch (error) {
                    console.error("Error deleting standard:", error);

                    Swal.fire({
                        title: 'Deletion Failed',
                        text: error.message || 'An error occurred while deleting the standard.',
                        icon: 'error',
                        confirmButtonColor: theme.palette.primary.main,
                    });
                }
            }
        });
    };

    // Add loadAllData function for refresh button
    const loadAllData = () => {
        dispatch(fetchStandards());
    };

    const clearFilters = () => {
        setNameFilter("");
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
                <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                    <SchoolIcon sx={{ mr: 0.5 }} fontSize="small" />
                    Standards
                </Typography>
            </Breadcrumbs>

            {/* Header section with enhanced styling */}
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
                        mb: 3,
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
                        Standards
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => navigate("/app/standards/create")}
                            sx={{
                                borderRadius: 2,
                                boxShadow: 2,
                                "&:hover": {
                                    boxShadow: 4,
                                },
                            }}
                        >
                            Add Standard
                        </Button>
                        <RefreshButton
                            onRefresh={loadAllData}
                            loading={loading}
                            tooltip="Refresh standards list"
                        />
                    </Box>
                </Box>

                {/* Filter Controls */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            size="small"
                            label="Search by name"
                            value={nameFilter}
                            onChange={(e) => setNameFilter(e.target.value)}
                            InputProps={{
                                endAdornment: (
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        {nameFilter && (
                                            <IconButton
                                                size="small"
                                                onClick={() => setNameFilter("")}
                                                edge="end"
                                            >
                                                <ClearIcon fontSize="small" />
                                            </IconButton>
                                        )}
                                        <SearchIcon fontSize="small" sx={{ ml: 0.5, color: "action.active" }} />
                                    </Box>
                                ),
                            }}
                            sx={{ bgcolor: "background.paper" }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} sx={{ display: "flex", alignItems: "center" }}>
                        <Button
                            variant="outlined"
                            startIcon={<ClearIcon />}
                            onClick={clearFilters}
                            disabled={!nameFilter}
                            size="medium"
                            sx={{ borderRadius: 1.5, height: "100%" }}
                        >
                            Clear Filters
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Standards List */}
            {isMobile ? (
                // Mobile card view
                <Box>
                    {loading ? (
                        <Typography sx={{ textAlign: "center", py: 4 }}>
                            Loading...
                        </Typography>
                    ) : filteredStandards.length === 0 ? (
                        <Typography sx={{ textAlign: "center", py: 4 }}>
                            No standards found.
                        </Typography>
                    ) : (
                        <Stack spacing={2}>
                            {filteredStandards.map((standard) => (
                                <Card key={standard._id} sx={{ borderRadius: 2, boxShadow: 2 }}>
                                    <CardContent>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                mb: 1,
                                            }}
                                        >
                                            <Typography
                                                variant="h6"
                                                gutterBottom
                                                sx={{
                                                    fontWeight: 600,
                                                    fontSize: "1.1rem",
                                                    color: "primary.main",
                                                }}
                                            >
                                                {standard.name}
                                            </Typography>
                                        </Box>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                mb: 1,
                                                display: "flex",
                                                alignItems: "center",
                                            }}
                                        >
                                            <SchoolIcon
                                                fontSize="small"
                                                sx={{ mr: 0.5, opacity: 0.7 }}
                                            />
                                            Level: {standard.level || "Not specified"}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                display: "-webkit-box",
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: "vertical",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                mb: 1
                                            }}
                                        >
                                            {standard.description || "No description"}
                                        </Typography>

                                        {/* Subjects section */}
                                        <Box sx={{ mt: 1 }}>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{ fontWeight: 500, mb: 0.5 }}
                                            >
                                                Subjects:
                                            </Typography>

                                            {standard.subjects && Array.isArray(standard.subjects) && standard.subjects.length > 0 ? (
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                    {standard.subjects.map((subject, index) => (
                                                        <Chip
                                                            key={subject?._id || index}
                                                            label={subject?.name || "Unnamed Subject"}
                                                            size="small"
                                                            color="primary"
                                                            variant="outlined"
                                                            sx={{ mb: 0.5 }}
                                                        />
                                                    ))}
                                                </Box>
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    No subjects assigned
                                                </Typography>
                                            )}
                                        </Box>
                                    </CardContent>
                                    <CardActions sx={{ justifyContent: "flex-end", px: 2, pb: 2 }}>
                                        <Tooltip title="View Details">
                                            <IconButton
                                                size="small"
                                                onClick={() => navigate(`/app/standards/${standard._id}`)}
                                                sx={{
                                                    color: "primary.main",
                                                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                                                    "&:hover": {
                                                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.2),
                                                    },
                                                    mr: 1,
                                                }}
                                            >
                                                <VisibilityIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Edit">
                                            <IconButton
                                                size="small"
                                                onClick={() => navigate(`/app/standards/${standard._id}/edit`)}
                                                sx={{
                                                    color: "primary.main",
                                                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                                                    "&:hover": {
                                                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.2),
                                                    },
                                                    mr: 1,
                                                }}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDeleteClick(standard)}
                                                sx={{
                                                    color: "error.main",
                                                    bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
                                                    "&:hover": {
                                                        bgcolor: (theme) => alpha(theme.palette.error.main, 0.2),
                                                    },
                                                }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </CardActions>
                                </Card>
                            ))}
                        </Stack>
                    )}
                </Box>
            ) : (
                // Desktop table view
                <TableContainer
                    component={Paper}
                    sx={{ borderRadius: 2, overflow: "hidden" }}
                >
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: "primary.main" }}>
                                <TableCell sx={{ color: "common.white", py: 2 }}>
                                    Name
                                </TableCell>
                                <TableCell sx={{ color: "common.white" }}>
                                    Level
                                </TableCell>
                                <TableCell sx={{ color: "common.white" }}>
                                    Subjects
                                </TableCell>
                                <TableCell sx={{ color: "common.white" }}>
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : filteredStandards.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                        <Typography color="text.secondary">
                                            No standards found.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredStandards.map((standard) => (
                                    <TableRow
                                        key={standard._id}
                                        sx={{
                                            "&:hover": {
                                                backgroundColor: (theme) =>
                                                    alpha(theme.palette.primary.main, 0.04),
                                            },
                                        }}
                                    >
                                        <TableCell
                                            component="th"
                                            scope="row"
                                            sx={{
                                                color: "primary.main",
                                                fontWeight: 500,
                                            }}
                                        >
                                            {standard.name}
                                        </TableCell>
                                        <TableCell>{standard.level || "Not specified"}</TableCell>
                                        <TableCell>
                                            {standard.subjects && Array.isArray(standard.subjects) && standard.subjects.length > 0 ? (
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                    {standard.subjects.slice(0, 3).map((subject, index) => (
                                                        <Chip
                                                            key={subject?._id || index}
                                                            label={subject?.name || "Unnamed Subject"}
                                                            size="small"
                                                            color="primary"
                                                            variant="outlined"
                                                        />
                                                    ))}
                                                    {standard.subjects.length > 3 && (
                                                        <Chip
                                                            label={`+${standard.subjects.length - 3} more`}
                                                            size="small"
                                                            color="default"
                                                            variant="outlined"
                                                        />
                                                    )}
                                                </Box>
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    No subjects
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Box
                                                sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}
                                            >
                                                <Tooltip title="View Details">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => navigate(`/app/standards/${standard._id}`)}
                                                        sx={{
                                                            color: "primary.main",
                                                            "&:hover": {
                                                                backgroundColor: (theme) =>
                                                                    alpha(theme.palette.primary.main, 0.1),
                                                            },
                                                        }}
                                                    >
                                                        <VisibilityIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Edit">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => navigate(`/app/standards/${standard._id}/edit`)}
                                                        sx={{
                                                            color: "primary.main",
                                                            "&:hover": {
                                                                backgroundColor: (theme) =>
                                                                    alpha(theme.palette.primary.main, 0.1),
                                                            },
                                                        }}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleDeleteClick(standard)}
                                                        sx={{
                                                            color: "error.main",
                                                            "&:hover": {
                                                                backgroundColor: (theme) =>
                                                                    alpha(theme.palette.error.main, 0.1),
                                                            },
                                                        }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

export default StandardList; 