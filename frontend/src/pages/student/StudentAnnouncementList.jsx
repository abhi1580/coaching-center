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
    Stack,
    Tooltip,
    Breadcrumbs,
    Link,
    InputAdornment,
    CircularProgress,
    TablePagination,
    Hidden
} from "@mui/material";
import {
    Visibility as VisibilityIcon,
    Notifications as NotificationsIcon,
    Search as SearchIcon,
    Clear as ClearIcon,
    Home as HomeIcon,
    FilterList as FilterListIcon
} from "@mui/icons-material";
import {
    fetchAnnouncements,
    formatDate,
    getStatusColor
} from "../../store/slices/announcementSlice";
import RefreshButton from "../../components/common/RefreshButton";

const StudentAnnouncementList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const isTablet = useMediaQuery(theme.breakpoints.down("md"));
    const { user } = useSelector((state) => state.auth);

    // Ensure only students can access this page
    useEffect(() => {
        if (!user || user.role !== "student") {
            if (user?.role === "admin") {
                navigate("/app/announcements");
            } else if (user?.role === "teacher") {
                navigate("/app/teacher/announcements");
            } else {
                navigate("/login");
            }
        }
    }, [user, navigate]);

    const { data: announcements, counts, loading } = useSelector((state) => state.announcements);

    // State for filtering and pagination
    const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
    const [titleFilter, setTitleFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10);

    useEffect(() => {
        dispatch(fetchAnnouncements());
    }, [dispatch]);

    useEffect(() => {
        if (!announcements) return;

        let results = [...announcements];

        // Apply title filter
        if (titleFilter.trim() !== "") {
            results = results.filter((announcement) =>
                announcement.title.toLowerCase().includes(titleFilter.toLowerCase())
            );
        }

        // Apply type filter
        if (typeFilter !== "") {
            results = results.filter(
                (announcement) => announcement.type === typeFilter
            );
        }

        // Apply status filter
        if (statusFilter !== "") {
            results = results.filter(
                (announcement) => announcement.status === statusFilter
            );
        }

        setFilteredAnnouncements(results);
        // Reset to first page when filters change
        setPage(0);
    }, [announcements, titleFilter, typeFilter, statusFilter]);

    // Navigate to announcement detail
    const navigateToAnnouncementDetail = (id) => {
        navigate(`/app/student/announcements/${id}`);
    };

    // Refresh data
    const loadAllData = () => {
        dispatch(fetchAnnouncements());
    };

    // Clear all filters
    const clearFilters = () => {
        setTitleFilter("");
        setTypeFilter("");
        setStatusFilter("");
    };

    // Pagination handlers
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Get paginated data
    const getPaginatedData = () => {
        return filteredAnnouncements.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    };

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

    // Render action buttons - student can only view
    const renderActionButtons = (announcement) => {
        return (
            <Tooltip title="View">
                <IconButton
                    size="small"
                    color="primary"
                    onClick={() => navigateToAnnouncementDetail(announcement._id)}
                >
                    <VisibilityIcon fontSize="small" />
                </IconButton>
            </Tooltip>
        );
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
                    onClick={() => navigate("/app/student/dashboard")}
                    sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                >
                    <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
                    Dashboard
                </Link>
                <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                    <NotificationsIcon sx={{ mr: 0.5 }} fontSize="small" />
                    Announcements
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
                        Announcements
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1 }}>
                        <RefreshButton
                            onRefresh={loadAllData}
                            loading={loading}
                            tooltip="Refresh announcements list"
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
                            label="Search by title"
                            value={titleFilter}
                            onChange={(e) => setTitleFilter(e.target.value)}
                            InputProps={{
                                endAdornment: (
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        {titleFilter && (
                                            <IconButton
                                                size="small"
                                                onClick={() => setTitleFilter("")}
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
                    <Grid item xs={6} sm={3} md={2}>
                        <TextField
                            select
                            fullWidth
                            variant="outlined"
                            size="small"
                            label="Type"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            sx={{ bgcolor: "background.paper" }}
                        >
                            <MenuItem value="">All Types</MenuItem>
                            <MenuItem value="General">General</MenuItem>
                            <MenuItem value="Event">Event</MenuItem>
                            <MenuItem value="Holiday">Holiday</MenuItem>
                            <MenuItem value="Exam">Exam</MenuItem>
                            <MenuItem value="Emergency">Emergency</MenuItem>
                            <MenuItem value="Other">Other</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={6} sm={3} md={2}>
                        <TextField
                            select
                            fullWidth
                            variant="outlined"
                            size="small"
                            label="Status"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            sx={{ bgcolor: "background.paper" }}
                        >
                            <MenuItem value="">All Statuses</MenuItem>
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="scheduled">Scheduled</MenuItem>
                            <MenuItem value="expired">Expired</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={12} md={4} sx={{ display: "flex", alignItems: "center" }}>
                        <Button
                            variant="outlined"
                            startIcon={<ClearIcon />}
                            onClick={clearFilters}
                            disabled={!titleFilter && !typeFilter && !statusFilter}
                            size="small"
                            sx={{ ml: 'auto', borderRadius: 2 }}
                        >
                            Clear Filters
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Table for larger screens */}
            <Hidden smDown>
                <Paper sx={{ borderRadius: 2, overflow: 'hidden', mb: 3 }}>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2 }}>
                                    <CircularProgress size={30} />
                                </Box>
                            </TableCell>
                        </TableRow>
                    ) : filteredAnnouncements.length === 0 ? (
                        <Box sx={{ textAlign: "center", py: 4, px: 2 }}>
                            <Typography color="text.secondary" sx={{ mb: 2, fontWeight: 500 }}>
                                No announcements found matching your filters
                            </Typography>
                            <Button
                                variant="outlined"
                                startIcon={<ClearIcon />}
                                onClick={clearFilters}
                                size="small"
                            >
                                Clear Filters
                            </Button>
                        </Box>
                    ) : (
                        <>
                            <TableContainer>
                                <Table sx={{ minWidth: 650 }}>
                                    <TableHead sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Start Date (00:00)</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>End Date (23:59)</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {getPaginatedData().map((announcement) => (
                                            <TableRow key={announcement._id} hover>
                                                <TableCell>
                                                    <Typography
                                                        component="div"
                                                        sx={{
                                                            fontWeight: 500,
                                                            mb: 0.5,
                                                            color: "primary.main",
                                                            cursor: "pointer",
                                                            "&:hover": { textDecoration: "underline" },
                                                        }}
                                                        onClick={() => navigateToAnnouncementDetail(announcement._id)}
                                                    >
                                                        {announcement.title}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={announcement.type}
                                                        color={getTypeColor(announcement.type)}
                                                        size="small"
                                                        sx={{ fontWeight: 500 }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={announcement.status}
                                                        color={getStatusColor(announcement.status)}
                                                        size="small"
                                                        sx={{ fontWeight: 500 }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={announcement.priority}
                                                        color={getPriorityColor(announcement.priority)}
                                                        size="small"
                                                        sx={{ fontWeight: 500 }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {formatDate(announcement.startDate || announcement.startTime)}
                                                </TableCell>
                                                <TableCell>
                                                    {formatDate(announcement.endDate || announcement.endTime)}
                                                </TableCell>
                                                <TableCell>
                                                    {renderActionButtons(announcement)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25]}
                                component="div"
                                count={filteredAnnouncements.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                            />
                        </>
                    )}
                </Paper>
            </Hidden>

            {/* Card layout for mobile */}
            <Hidden smUp>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                        <CircularProgress size={32} />
                    </Box>
                ) : filteredAnnouncements.length === 0 ? (
                    <Paper sx={{ textAlign: "center", py: 4, px: 2, borderRadius: 2, boxShadow: 2 }}>
                        <Typography color="text.secondary" sx={{ mb: 2, fontWeight: 500 }}>
                            No announcements found matching your filters
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
                        {getPaginatedData().map((announcement) => (
                            <Card
                                key={announcement._id}
                                sx={{
                                    borderRadius: 2,
                                    boxShadow: 2,
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        transform: "translateY(-2px)",
                                        boxShadow: 3,
                                    },
                                    overflow: "hidden",
                                    borderLeft: `4px solid ${theme.palette.primary.main}`
                                }}
                            >
                                <Box
                                    sx={{
                                        backgroundColor: alpha(theme.palette.primary.light, 0.1),
                                        py: 1.5,
                                        px: 2,
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                                    }}
                                >
                                    <Typography variant="subtitle1" fontWeight={600} color="primary.main">
                                        {announcement.title.length > 30
                                            ? `${announcement.title.substring(0, 30)}...`
                                            : announcement.title}
                                    </Typography>
                                    <Chip
                                        label={announcement.status}
                                        color={getStatusColor(announcement.status)}
                                        size="small"
                                        sx={{
                                            fontWeight: 500,
                                            height: 24,
                                        }}
                                    />
                                </Box>
                                <CardContent sx={{ py: 1.5 }}>
                                    <Grid container spacing={1}>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">
                                                Type
                                            </Typography>
                                            <Box>
                                                <Chip
                                                    label={announcement.type}
                                                    color={getTypeColor(announcement.type)}
                                                    size="small"
                                                    sx={{ fontWeight: 500, height: 24 }}
                                                />
                                            </Box>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">
                                                Priority
                                            </Typography>
                                            <Box>
                                                <Chip
                                                    label={announcement.priority}
                                                    color={getPriorityColor(announcement.priority)}
                                                    size="small"
                                                    sx={{ fontWeight: 500, height: 24 }}
                                                />
                                            </Box>
                                        </Grid>
                                        <Grid item xs={6} sx={{ mt: 1 }}>
                                            <Typography variant="caption" color="text.secondary">
                                                Start Date (00:00)
                                            </Typography>
                                            <Typography variant="body2">
                                                {formatDate(announcement.startDate || announcement.startTime)}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6} sx={{ mt: 1 }}>
                                            <Typography variant="caption" color="text.secondary">
                                                End Date (23:59)
                                            </Typography>
                                            <Typography variant="body2">
                                                {formatDate(announcement.endDate || announcement.endTime)}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                        px: 1.5,
                                        py: 1,
                                        borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                        backgroundColor: alpha(theme.palette.background.default, 0.4)
                                    }}
                                >
                                    <Stack direction="row" spacing={1}>
                                        {renderActionButtons(announcement)}
                                    </Stack>
                                </Box>
                            </Card>
                        ))}

                        {/* Pagination for mobile */}
                        <TablePagination
                            component={Paper}
                            count={filteredAnnouncements.length}
                            page={page}
                            onPageChange={handleChangePage}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            sx={{ borderRadius: 2, overflow: 'hidden' }}
                        />
                    </Stack>
                )}
            </Hidden>
        </Box>
    );
};

export default StudentAnnouncementList; 