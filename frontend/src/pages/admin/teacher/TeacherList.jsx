import React, { useState, useEffect, useCallback } from "react";
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
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from "@mui/material";
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
    Person as PersonIcon,
    Search as SearchIcon,
    Clear as ClearIcon,
    Home as HomeIcon,
    ExpandMore as ExpandMoreIcon,
    FilterList as FilterIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
} from "@mui/icons-material";
import { fetchTeachers, deleteTeacher } from "../../../store/slices/teacherSlice";
import { fetchSubjects } from "../../../store/slices/subjectSlice";
import RefreshButton from "../../../components/common/RefreshButton";
import DeleteConfirmationDialog from "../../../components/common/DeleteConfirmationDialog";

const TeacherList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const isTablet = useMediaQuery(theme.breakpoints.down("md"));

    const { teachers, loading } = useSelector((state) => state.teachers);
    const { subjects } = useSelector((state) => state.subjects);

    const [filteredTeachers, setFilteredTeachers] = useState([]);
    const [nameFilter, setNameFilter] = useState("");
    const [subjectFilter, setSubjectFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [filterExpanded, setFilterExpanded] = useState(false);

    // Delete confirmation state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [teacherToDelete, setTeacherToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Clear filters
    const clearFilters = () => {
        setNameFilter("");
        setSubjectFilter("");
        setStatusFilter("");
    };

    // Load data
    const loadAllData = useCallback(() => {
        dispatch(fetchTeachers());
        dispatch(fetchSubjects());
    }, [dispatch]);

    useEffect(() => {
        loadAllData();
    }, [loadAllData]);

    // Filter teachers
    useEffect(() => {
        if (!teachers || !Array.isArray(teachers)) {
            setFilteredTeachers([]);
            return;
        }

        let results = [...teachers];

        // Filter by name or email
        if (nameFilter) {
            const searchTerm = nameFilter.toLowerCase();
            results = results.filter(
                (teacher) =>
                    teacher.name?.toLowerCase().includes(searchTerm) ||
                    teacher.email?.toLowerCase().includes(searchTerm) ||
                    teacher.phone?.includes(searchTerm)
            );
        }

        // Filter by subject
        if (subjectFilter) {
            results = results.filter((teacher) => {
                if (!teacher.subjects) return false;
                return teacher.subjects.some(
                    (subject) =>
                        (typeof subject === 'object' && subject._id === subjectFilter) ||
                        subject === subjectFilter
                );
            });
        }

        // Filter by status
        if (statusFilter) {
            results = results.filter(
                (teacher) => teacher.status === statusFilter
            );
        }

        setFilteredTeachers(results);
    }, [teachers, nameFilter, subjectFilter, statusFilter]);

    // Delete handler
    const handleDeleteClick = (teacher) => {
        setTeacherToDelete(teacher);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!teacherToDelete) return;

        setDeleteLoading(true);
        try {
            await dispatch(deleteTeacher(teacherToDelete._id)).unwrap();
            setDeleteDialogOpen(false);
            setTeacherToDelete(null);
        } catch (error) {
            console.error("Error deleting teacher:", error);
        } finally {
            setDeleteLoading(false);
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
                <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon sx={{ mr: 0.5 }} fontSize="small" />
                    Teachers
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
                        Teachers
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => navigate("/app/teachers/create")}
                            sx={{
                                borderRadius: 2,
                                boxShadow: 2,
                                "&:hover": {
                                    boxShadow: 4,
                                },
                            }}
                        >
                            Add Teacher
                        </Button>
                        <RefreshButton
                            onRefresh={loadAllData}
                            loading={loading}
                            tooltip="Refresh teachers list"
                        />
                    </Box>
                </Box>

                {/* Filter section */}
                <Accordion
                    expanded={filterExpanded}
                    onChange={() => setFilterExpanded(!filterExpanded)}
                    disableGutters
                    elevation={0}
                    sx={{
                        bgcolor: 'transparent',
                        '&:before': { display: 'none' },
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        borderRadius: 2,
                        mb: 2
                    }}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{
                            minHeight: 50,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.primary.main, 0.03),
                            '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.05)
                            }
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <FilterIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="subtitle1" fontWeight={500}>
                                Filters
                            </Typography>
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container spacing={2} sx={{ mt: 1, mb: 1 }}>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    label="Search by name or email"
                                    value={nameFilter}
                                    onChange={(e) => setNameFilter(e.target.value)}
                                    InputProps={{
                                        startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: "action.active" }} />,
                                        endAdornment: nameFilter && (
                                            <IconButton
                                                size="small"
                                                onClick={() => setNameFilter("")}
                                                edge="end"
                                                sx={{ mr: -0.5 }}
                                            >
                                                <ClearIcon fontSize="small" />
                                            </IconButton>
                                        ),
                                    }}
                                    sx={{ bgcolor: "background.paper" }}
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <TextField
                                    fullWidth
                                    select
                                    variant="outlined"
                                    size="small"
                                    label="Filter by subject"
                                    value={subjectFilter}
                                    onChange={(e) => setSubjectFilter(e.target.value)}
                                    sx={{ bgcolor: "background.paper" }}
                                >
                                    <MenuItem value="">All Subjects</MenuItem>
                                    {subjects && subjects.map((subject) => (
                                        <MenuItem key={subject._id} value={subject._id}>
                                            {subject.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <TextField
                                    fullWidth
                                    select
                                    variant="outlined"
                                    size="small"
                                    label="Filter by status"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    sx={{ bgcolor: "background.paper" }}
                                >
                                    <MenuItem value="">All Statuses</MenuItem>
                                    <MenuItem value="active">Active</MenuItem>
                                    <MenuItem value="inactive">Inactive</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={12} md={2} sx={{ display: 'flex' }}>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={clearFilters}
                                    fullWidth
                                    startIcon={<ClearIcon />}
                                    disabled={!nameFilter && !subjectFilter && !statusFilter}
                                >
                                    Clear Filters
                                </Button>
                            </Grid>
                        </Grid>
                    </AccordionDetails>
                </Accordion>

                {/* Refresh button */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>

                </Box>
            </Paper>

            {/* Teachers List */}
            {isMobile ? (
                // Mobile card view
                <Box>
                    {loading ? (
                        <Typography sx={{ textAlign: "center", py: 4 }}>
                            Loading...
                        </Typography>
                    ) : filteredTeachers.length === 0 ? (
                        <Typography sx={{ textAlign: "center", py: 4 }}>
                            No teachers found.
                        </Typography>
                    ) : (
                        <Stack spacing={2}>
                            {filteredTeachers.map((teacher) => (
                                <Card key={teacher._id} sx={{ borderRadius: 2, boxShadow: 2 }}>
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
                                                {teacher.name}
                                            </Typography>
                                            <Chip
                                                label={teacher.status || "Active"}
                                                color={teacher.status === "inactive" ? "default" : "success"}
                                                size="small"
                                                sx={{ fontWeight: 500 }}
                                            />
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
                                            <EmailIcon
                                                fontSize="small"
                                                sx={{ mr: 0.5, opacity: 0.7 }}
                                            />
                                            {teacher.email}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                mb: 1,
                                                display: "flex",
                                                alignItems: "center",
                                            }}
                                        >
                                            <PhoneIcon
                                                fontSize="small"
                                                sx={{ mr: 0.5, opacity: 0.7 }}
                                            />
                                            {teacher.phone || "No phone number"}
                                        </Typography>
                                        {teacher.subjects && teacher.subjects.length > 0 && (
                                            <Box sx={{ mt: 1 }}>
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                    Subjects:
                                                </Typography>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                    {teacher.subjects.map((subject, index) => (
                                                        <Chip
                                                            key={index}
                                                            label={typeof subject === 'object' ? subject.name : subject}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{ fontSize: '0.7rem' }}
                                                        />
                                                    ))}
                                                </Box>
                                            </Box>
                                        )}
                                    </CardContent>
                                    <CardActions sx={{ justifyContent: "flex-end", px: 2, pb: 2 }}>
                                        <Tooltip title="View Details">
                                            <IconButton
                                                size="small"
                                                onClick={() => navigate(`/app/teachers/${teacher._id}`)}
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
                                                onClick={() => navigate(`/app/teachers/${teacher._id}/edit`)}
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
                                                onClick={() => handleDeleteClick(teacher)}
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
                                    Contact Info
                                </TableCell>
                                <TableCell sx={{ color: "common.white" }}>
                                    Qualification
                                </TableCell>
                                <TableCell sx={{ color: "common.white" }}>
                                    Subjects
                                </TableCell>
                                <TableCell sx={{ color: "common.white" }}>
                                    Status
                                </TableCell>
                                <TableCell sx={{ color: "common.white" }}>
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : filteredTeachers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                        <Typography color="text.secondary">
                                            No teachers found.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredTeachers.map((teacher) => (
                                    <TableRow
                                        key={teacher._id}
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
                                                whiteSpace: "normal",
                                                wordBreak: "break-word",
                                            }}
                                        >
                                            {teacher.name}
                                            {teacher.gender && (
                                                <Typography variant="caption" display="block" color="text.secondary">
                                                    {teacher.gender.charAt(0).toUpperCase() + teacher.gender.slice(1)}
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell sx={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                                <EmailIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.7, fontSize: '1rem', flexShrink: 0 }} />
                                                <span>{teacher.email}</span>
                                            </Typography>
                                            {teacher.phone && (
                                                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <PhoneIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.7, fontSize: '1rem', flexShrink: 0 }} />
                                                    <span>{teacher.phone}</span>
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell sx={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                                            {teacher.qualification || "N/A"}
                                            {teacher.experience && (
                                                <Typography variant="caption" display="block" color="text.secondary">
                                                    {teacher.experience} {Number(teacher.experience) === 1 ? "year" : "years"} experience
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: '100%' }}>
                                                {teacher.subjects && teacher.subjects.length > 0 ? (
                                                    teacher.subjects.map((subject, index) => (
                                                        <Chip
                                                            key={index}
                                                            label={typeof subject === 'object' ? subject.name : subject}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{ fontSize: '0.7rem', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                                        />
                                                    ))
                                                ) : (
                                                    <Typography variant="body2" color="text.secondary">
                                                        None assigned
                                                    </Typography>
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={teacher.status || "Active"}
                                                color={teacher.status === "inactive" ? "default" : "success"}
                                                size="small"
                                                sx={{ fontWeight: 500 }}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Box
                                                sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}
                                            >
                                                <Tooltip title="View Details">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => navigate(`/app/teachers/${teacher._id}`)}
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
                                                        onClick={() => navigate(`/app/teachers/${teacher._id}/edit`)}
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
                                                        onClick={() => handleDeleteClick(teacher)}
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

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmationDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleDeleteConfirm}
                loading={deleteLoading}
                itemName={teacherToDelete?.name || "this teacher"}
                itemType="teacher"
            />
        </Box>
    );
};

export default TeacherList; 