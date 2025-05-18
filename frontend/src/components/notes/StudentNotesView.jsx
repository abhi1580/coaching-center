import React, { useState, useEffect } from 'react';
import {
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Button,
    CircularProgress,
    Alert,
    Snackbar,
    Grid,
    Card,
    CardContent,
    CardActions,
    Divider,
    useMediaQuery,
    useTheme,
    IconButton
} from '@mui/material';
import { format } from 'date-fns';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import ArticleIcon from '@mui/icons-material/Article';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import api from '../../services/common/apiClient';

const StudentNotesView = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState('');
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'error'
    });

    useEffect(() => {
        const fetchBatches = async () => {
            try {
                const response = await api.get('/student/batches');
                const batchesData = response.data.data || response.data;
                setBatches(batchesData);
                if (batchesData.length > 0) {
                    setSelectedBatch(batchesData[0]._id);
                }
            } catch (error) {
                setSnackbar({
                    open: true,
                    message: 'Failed to fetch batches',
                    severity: 'error'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchBatches();
    }, []);

    useEffect(() => {
        const fetchNotes = async () => {
            if (!selectedBatch) return;

            try {
                const response = await api.get(`/notes/batch/${selectedBatch}`);
                const notesData = response.data.data || response.data;
                setNotes(notesData);
            } catch (error) {
                setSnackbar({
                    open: true,
                    message: 'Failed to fetch notes',
                    severity: 'error'
                });
            }
        };

        fetchNotes();
    }, [selectedBatch]);

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const handleDownload = async (fileUrl, fileName) => {
        try {
            // Fetch the file
            const response = await fetch(fileUrl);
            const blob = await response.blob();

            // Determine the file type - default to PDF
            const fileType = blob.type || 'application/pdf';

            // Create a blob URL
            const blobUrl = URL.createObjectURL(blob);

            // Create temporary link element
            const link = document.createElement('a');
            link.href = blobUrl;

            // Ensure filename has .pdf extension
            if (!fileName.toLowerCase().endsWith('.pdf')) {
                fileName = `${fileName}.pdf`;
            }

            // Set the download attribute to the filename
            link.download = fileName;

            // Append to body, click and remove
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Release the blob URL
            URL.revokeObjectURL(blobUrl);

            setSnackbar({
                open: true,
                message: 'File downloaded successfully',
                severity: 'success'
            });
        } catch (error) {
            console.error('Download error:', error);
            setSnackbar({
                open: true,
                message: 'Failed to download file',
                severity: 'error'
            });
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (batches.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" gutterBottom>
                    No Enrolled Batches
                </Typography>
                <Typography color="text.secondary">
                    You are not enrolled in any batches yet.
                </Typography>
            </Box>
        );
    }

    // Render mobile card view
    const renderMobileView = () => (
        <Box>
            <FormControl fullWidth sx={{ mb: 4 }}>
                <InputLabel>Select Batch</InputLabel>
                <Select
                    value={selectedBatch}
                    label="Select Batch"
                    onChange={(e) => setSelectedBatch(e.target.value)}
                >
                    {batches.map((batch) => (
                        <MenuItem key={batch._id} value={batch._id}>
                            {batch.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {notes.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        No Notes Available
                    </Typography>
                    <Typography color="text.secondary">
                        No study materials have been uploaded for this batch yet.
                    </Typography>
                </Box>
            ) : (
                <Grid container spacing={2}>
                    {notes.map((note) => (
                        <Grid item xs={12} key={note._id}>
                            <Card elevation={2}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <ArticleIcon color="primary" />
                                        {note.title}
                                    </Typography>

                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <PersonIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                                        <Typography variant="body2" color="text.secondary">
                                            {note.uploadedBy?.name || 'Unknown'}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <CalendarTodayIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                                        <Typography variant="body2" color="text.secondary">
                                            {format(new Date(note.uploadedAt), 'MMM dd, yyyy')}
                                        </Typography>
                                    </Box>
                                </CardContent>
                                <Divider />
                                <CardActions>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        color="primary"
                                        startIcon={<CloudDownloadIcon />}
                                        onClick={() => handleDownload(note.fileUrl, note.title)}
                                    >
                                        Download
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );

    // Render desktop table view
    const renderDesktopView = () => (
        <Box>
            <FormControl fullWidth sx={{ mb: 4 }}>
                <InputLabel>Select Batch</InputLabel>
                <Select
                    value={selectedBatch}
                    label="Select Batch"
                    onChange={(e) => setSelectedBatch(e.target.value)}
                >
                    {batches.map((batch) => (
                        <MenuItem key={batch._id} value={batch._id}>
                            {batch.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {notes.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        No Notes Available
                    </Typography>
                    <Typography color="text.secondary">
                        No study materials have been uploaded for this batch yet.
                    </Typography>
                </Box>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Title</TableCell>
                                <TableCell>Uploaded By</TableCell>
                                <TableCell>Uploaded At</TableCell>
                                <TableCell>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {notes.map((note) => (
                                <TableRow key={note._id}>
                                    <TableCell>{note.title}</TableCell>
                                    <TableCell>{note.uploadedBy?.name || 'Unknown'}</TableCell>
                                    <TableCell>
                                        {format(new Date(note.uploadedAt), 'MMM dd, yyyy')}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            color="primary"
                                            size="small"
                                            variant="outlined"
                                            startIcon={<CloudDownloadIcon />}
                                            onClick={() => handleDownload(note.fileUrl, note.title)}
                                        >
                                            Download
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );

    return (
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
            {isMobile ? renderMobileView() : renderDesktopView()}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default StudentNotesView; 