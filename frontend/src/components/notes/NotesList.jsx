import React, { useState, useEffect } from 'react';
import {
    Box,
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
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Grid,
    Card,
    CardContent,
    CardActions,
    Divider,
    useMediaQuery,
    useTheme,
    IconButton,
    Chip
} from '@mui/material';
import { format } from 'date-fns';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import ArticleIcon from '@mui/icons-material/Article';
import FolderIcon from '@mui/icons-material/Folder';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import api from '../../services/common/apiClient';

const NotesList = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [noteToDelete, setNoteToDelete] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'error'
    });

    const fetchNotes = async () => {
        try {
            const response = await api.get('/notes/teacher');
            setNotes(response.data.data || response.data);
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Failed to fetch notes',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotes();
    }, []);

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

    const openDeleteDialog = (note) => {
        setNoteToDelete(note);
        setDeleteDialogOpen(true);
    };

    const closeDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setNoteToDelete(null);
    };

    const handleDeleteNote = async () => {
        if (!noteToDelete) return;

        try {
            await api.delete(`/notes/${noteToDelete._id}`);
            
            // Update the notes list
            setNotes(notes.filter(note => note._id !== noteToDelete._id));
            
            setSnackbar({
                open: true,
                message: 'Note deleted successfully',
                severity: 'success'
            });
        } catch (error) {
            setSnackbar({
                open: true,
                message: error.response?.data?.message || 'Failed to delete note',
                severity: 'error'
            });
        } finally {
            closeDeleteDialog();
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (notes.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" gutterBottom>
                    No Notes Uploaded
                </Typography>
                <Typography color="text.secondary">
                    You haven't uploaded any study materials yet.
                </Typography>
            </Box>
        );
    }

    // Render mobile card view
    const renderMobileView = () => (
        <Grid container spacing={2}>
            {notes.map((note) => (
                <Grid item xs={12} key={note._id}>
                    <Card elevation={2}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <ArticleIcon color="primary" />
                                {note.title}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <FolderIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {note.batches.map((batch) => (
                                            <Chip 
                                                key={batch._id} 
                                                label={batch.name} 
                                                size="small" 
                                                variant="outlined" 
                                                color="primary"
                                            />
                                        ))}
                                    </Box>
                                </Box>
                                
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <CalendarTodayIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                                    <Typography variant="body2" color="text.secondary">
                                        {format(new Date(note.uploadedAt), 'MMM dd, yyyy')}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                        <Divider />
                        <CardActions sx={{ justifyContent: 'space-between' }}>
                            <Button 
                                variant="contained"
                                color="primary"
                                startIcon={<CloudDownloadIcon />}
                                onClick={() => handleDownload(note.fileUrl, note.title)}
                                sx={{ flex: 1, mr: 1 }}
                            >
                                Download
                            </Button>
                            <Button 
                                variant="outlined"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={() => openDeleteDialog(note)}
                                sx={{ flex: 1 }}
                            >
                                Delete
                            </Button>
                        </CardActions>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );

    // Render desktop table view
    const renderDesktopView = () => (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Title</TableCell>
                        <TableCell>Batches</TableCell>
                        <TableCell>Uploaded At</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {notes.map((note) => (
                        <TableRow key={note._id}>
                            <TableCell>{note.title}</TableCell>
                            <TableCell>
                                {note.batches.map((batch) => (
                                    <Typography key={batch._id} variant="body2">
                                        {batch.name}
                                    </Typography>
                                ))}
                            </TableCell>
                            <TableCell>
                                {format(new Date(note.uploadedAt), 'MMM dd, yyyy')}
                            </TableCell>
                            <TableCell>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button 
                                        color="primary"
                                        size="small"
                                        variant="outlined"
                                        startIcon={<CloudDownloadIcon />}
                                        onClick={() => handleDownload(note.fileUrl, note.title)}
                                    >
                                        Download
                                    </Button>
                                    <Button 
                                        color="error"
                                        size="small"
                                        variant="outlined"
                                        startIcon={<DeleteIcon />}
                                        onClick={() => openDeleteDialog(note)}
                                    >
                                        Delete
                                    </Button>
                                </Box>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );

    return (
        <Box>
            {isMobile ? renderMobileView() : renderDesktopView()}

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={closeDeleteDialog}
            >
                <DialogTitle>Delete Study Material</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete "{noteToDelete?.title}"? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDeleteDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteNote} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

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

export default NotesList; 