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
    InputAdornment,
    CircularProgress,
    TablePagination
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
    Book as BookIcon,
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
    
    // Update pagination state to be responsive
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10);

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

    // Handle pagination
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Get paginated data
    const getPaginatedData = () => {
        return filteredStandards.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
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

                {/* Add this after the filter controls in the header section: */}
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                        {filteredStandards.length === 0 
                            ? "No standards found" 
                            : `Showing ${filteredStandards.length} standard${filteredStandards.length !== 1 ? 's' : ''}`}
                        {nameFilter && ` matching "${nameFilter}"`}
                    </Typography>
                </Box>
            </Paper>

            {/* Standards List */}
            {isMobile ? (
                // Mobile card view
                <Box>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                            <CircularProgress size={28} sx={{ mr: 2 }} />
                            <Typography variant="body1">Loading standards...</Typography>
                        </Box>
                    ) : filteredStandards.length === 0 ? (
                        <Paper sx={{ textAlign: "center", py: 4, px: 2, borderRadius: 2, boxShadow: 2 }}>
                            <Typography color="text.secondary" sx={{ mb: 2, fontWeight: 500 }}>
                                No standards found matching your filters
                            </Typography>
                            <Button
                                variant="outlined"
                                startIcon={<ClearIcon />}
                                onClick={clearFilters}
                                size="small"
                            >
                                Clear Filters
                            </Button>
                        </Paper>
                    ) : (
                        <Stack spacing={2}>
                            {getPaginatedData().map((standard) => (
                                <Card key={standard._id} sx={{
                                    borderRadius: 2,
                                    boxShadow: 2,
                                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: 3
                                    },
                                    borderLeft: `4px solid ${theme.palette.primary.main}`
                                }}>
                                    <CardContent sx={{ pb: 1 }}>
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
                                                sx={{
                                                    fontWeight: 600,
                                                    fontSize: "1.1rem",
                                                    color: "primary.main",
                                                }}
                                            >
                                                {standard.name}
                                            </Typography>
                                            <Chip
                                                label={`Level ${standard.level || "N/A"}`}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                                sx={{
                                                    fontWeight: 500,
                                                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                                                    borderColor: alpha(theme.palette.primary.main, 0.3)
                                                }}
                                            />
                                        </Box>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                display: "-webkit-box",
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: "vertical",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                mb: 1.5,
                                                fontStyle: 'italic'
                                            }}
                                        >
                                            {standard.description || "No description"}
                                        </Typography>

                                        {/* Subjects section */}
                                        <Box sx={{ mt: 1.5 }}>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    fontWeight: 500,
                                                    mb: 0.5,
                                                    display: 'flex',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <BookIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.7 }} />
                                                Subjects:
                                            </Typography>

                                            {standard.subjects && Array.isArray(standard.subjects) && standard.subjects.length > 0 ? (
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                    {standard.subjects.map((subject, index) => (
                                                        <Chip
                                                            key={subject?._id || index}
                                                            label={subject?.name || "Unnamed Subject"}
                                                            size="small"
                                                            color="secondary"
                                                            variant="outlined"
                                                            sx={{
                                                                mb: 0.5,
                                                                fontWeight: 400,
                                                                backgroundColor: alpha(theme.palette.secondary.main, 0.05)
                                                            }}
                                                        />
                                                    ))}
                                                </Box>
                                            ) : (
                                                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                                    No subjects assigned
                                                </Typography>
                                            )}
                                        </Box>
                                    </CardContent>
                                    <CardActions sx={{
                                        justifyContent: "flex-end",
                                        px: 2,
                                        pb: 2,
                                        pt: 0.5,
                                        borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                                    }}>
                                        <Tooltip title="View Details">
                                            <IconButton
                                                size="small"
                                                onClick={() => navigate(`/app/standards/${standard._id}`)}
                                                sx={{
                                                    color: "primary.main",
                                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                    "&:hover": {
                                                        bgcolor: alpha(theme.palette.primary.main, 0.2),
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
                                                    color: theme.palette.info.main,
                                                    bgcolor: alpha(theme.palette.info.main, 0.1),
                                                    "&:hover": {
                                                        bgcolor: alpha(theme.palette.info.main, 0.2),
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
                                                    bgcolor: alpha(theme.palette.error.main, 0.1),
                                                    "&:hover": {
                                                        bgcolor: alpha(theme.palette.error.main, 0.2),
                                                    },
                                                }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </CardActions>
                                </Card>
                            ))}
                            {isMobile && filteredStandards.length > 0 && (
                                <TablePagination
                                    component={Paper}
                                    count={filteredStandards.length}
                                    page={page}
                                    onPageChange={handleChangePage}
                                    rowsPerPage={rowsPerPage}
                                    onRowsPerPageChange={handleChangeRowsPerPage}
                                    rowsPerPageOptions={[5, 10, 25]}
                                    sx={{
                                        borderTop: 'none',
                                        boxShadow: 2,
                                        borderRadius: 2,
                                        mt: 2,
                                        '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                                            fontWeight: 500,
                                        },
                                        '.MuiTablePagination-toolbar': {
                                            px: 2,
                                        },
                                    }}
                                />
                            )}
                        </Stack>
                    )}
                </Box>
            ) : (
                // Desktop table view
                <TableContainer
                    component={Paper}
                    sx={{
                        borderRadius: 2,
                        overflow: "hidden",
                        boxShadow: 2,
                        "& .MuiTableRow-root:last-child .MuiTableCell-body": {
                            borderBottom: "none"
                        }
                    }}
                >
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: (theme) => alpha(theme.palette.primary.main, 0.9) }}>
                                <TableCell
                                    sx={{
                                        color: "common.white",
                                        py: 2.5,
                                        fontWeight: 600,
                                        fontSize: "0.95rem"
                                    }}
                                >
                                    Name
                                </TableCell>
                                <TableCell
                                    sx={{
                                        color: "common.white",
                                        fontWeight: 600,
                                        fontSize: "0.95rem"
                                    }}
                                >
                                    Level
                                </TableCell>
                                <TableCell
                                    sx={{
                                        color: "common.white",
                                        fontWeight: 600,
                                        fontSize: "0.95rem"
                                    }}
                                >
                                    Subjects
                                </TableCell>
                                <TableCell
                                    align="center"
                                    sx={{
                                        color: "common.white",
                                        fontWeight: 600,
                                        fontSize: "0.95rem"
                                    }}
                                >
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2 }}>
                                            <CircularProgress size={24} sx={{ mr: 1 }} />
                                            <Typography variant="body1">Loading standards...</Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ) : filteredStandards.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                        <Typography color="text.secondary" sx={{ py: 2, fontWeight: 500 }}>
                                            No standards found matching your filters
                                        </Typography>
                                        <Button
                                            variant="outlined"
                                            startIcon={<ClearIcon />}
                                            onClick={clearFilters}
                                            sx={{ mt: 1 }}
                                            size="small"
                                        >
                                            Clear Filters
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                getPaginatedData().map((standard, index) => (
                                    <TableRow
                                        key={standard._id}
                                        sx={{
                                            "&:hover": {
                                                backgroundColor: (theme) =>
                                                    alpha(theme.palette.primary.main, 0.04),
                                            },
                                            backgroundColor: index % 2 === 0 ? 'inherit' : (theme) =>
                                                alpha(theme.palette.background.default, 0.5),
                                            transition: 'background-color 0.2s ease',
                                        }}
                                    >
                                        <TableCell
                                            component="th"
                                            scope="row"
                                            sx={{
                                                color: "primary.main",
                                                fontWeight: 500,
                                                fontSize: "0.95rem",
                                                py: 2.5,
                                                borderLeft: (theme) => `4px solid ${alpha(theme.palette.primary.main, 0.6)}`,
                                                pl: 2
                                            }}
                                        >
                                            {standard.name}
                                        </TableCell>
                                        <TableCell sx={{ fontSize: "0.95rem", py: 2.5 }}>
                                            <Chip
                                                label={`Level ${standard.level || "N/A"}`}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                                sx={{
                                                    fontWeight: 500,
                                                    backgroundColor: theme => alpha(theme.palette.primary.main, 0.08),
                                                    borderColor: theme => alpha(theme.palette.primary.main, 0.3)
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ py: 2.5 }}>
                                            {standard.subjects && Array.isArray(standard.subjects) && standard.subjects.length > 0 ? (
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                    {standard.subjects.slice(0, 3).map((subject, index) => (
                                                        <Chip
                                                            key={subject?._id || index}
                                                            label={subject?.name || "Unnamed Subject"}
                                                            size="small"
                                                            color="secondary"
                                                            variant="outlined"
                                                            sx={{
                                                                fontWeight: 400,
                                                                backgroundColor: theme => alpha(theme.palette.secondary.main, 0.05)
                                                            }}
                                                        />
                                                    ))}
                                                    {standard.subjects.length > 3 && (
                                                        <Tooltip title={standard.subjects.slice(3).map(s => s.name || "Unnamed").join(", ")}>
                                                            <Chip
                                                                label={`+${standard.subjects.length - 3} more`}
                                                                size="small"
                                                                color="default"
                                                                variant="outlined"
                                                                sx={{ cursor: 'pointer' }}
                                                            />
                                                        </Tooltip>
                                                    )}
                                                </Box>
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    No subjects
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell align="center" sx={{ py: 2.5 }}>
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    gap: 1,
                                                    justifyContent: "center",
                                                }}
                                            >
                                                <Tooltip title="View Details">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => navigate(`/app/standards/${standard._id}`)}
                                                        sx={{
                                                            color: "primary.main",
                                                            backgroundColor: theme => alpha(theme.palette.primary.main, 0.1),
                                                            "&:hover": {
                                                                backgroundColor: theme => alpha(theme.palette.primary.main, 0.2),
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
                                                            color: theme => theme.palette.info.main,
                                                            backgroundColor: theme => alpha(theme.palette.info.main, 0.1),
                                                            "&:hover": {
                                                                backgroundColor: theme => alpha(theme.palette.info.main, 0.2),
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
                                                            backgroundColor: theme => alpha(theme.palette.error.main, 0.1),
                                                            "&:hover": {
                                                                backgroundColor: theme => alpha(theme.palette.error.main, 0.2),
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

                    {/* Add this after the TableContainer for desktop view: */}
                    {!isMobile && filteredStandards.length > 0 && (
                        <TablePagination
                            component="div"
                            count={filteredStandards.length}
                            page={page}
                            onPageChange={handleChangePage}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            rowsPerPageOptions={[5, 10, 25]}
                            sx={{
                                borderTop: 'none',
                                '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                                    fontWeight: 500,
                                },
                            }}
                        />
                    )}
                </TableContainer>
            )}
        </Box>
    );
};

export default StandardList; 