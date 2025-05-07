import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    TextField,
    Select,
    MenuItem,
    Typography,
    Paper,
    CircularProgress,
    Alert,
    Snackbar,
    useMediaQuery,
    useTheme,
    Grid,
    Chip,
    FormHelperText,
    InputLabel,
    OutlinedInput
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import api from '../../services/common/apiClient';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

const UploadNote = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [title, setTitle] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedBatches, setSelectedBatches] = useState([]);
    const [availableBatches, setAvailableBatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [fileError, setFileError] = useState('');
    const [titleError, setTitleError] = useState('');
    const [batchError, setBatchError] = useState('');
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'error'
    });

    useEffect(() => {
        const fetchBatches = async () => {
            try {
                const response = await api.get('/batches');
                setAvailableBatches(response.data.data || response.data || []);
            } catch (error) {
                console.error('Error fetching batches:', error);
                setSnackbar({
                    open: true,
                    message: 'Failed to fetch batches',
                    severity: 'error'
                });
            }
        };

        fetchBatches();
    }, []);

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setFileError('');
        
        if (!file) {
            setSelectedFile(null);
            return;
        }
        
        // Check if file is a PDF
        if (file.type !== 'application/pdf') {
            setFileError('Only PDF files are allowed');
            setSelectedFile(null);
            return;
        }
        
        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setFileError('File size should not exceed 10MB');
            setSelectedFile(null);
            return;
        }
        
        setSelectedFile(file);
    };

    const handleBatchChange = (event) => {
        const {
            target: { value },
        } = event;
        
        // Handle array of batch IDs
        setSelectedBatches(typeof value === 'string' ? value.split(',') : value);
        setBatchError('');
    };

    const validateForm = () => {
        let isValid = true;
        
        if (!title.trim()) {
            setTitleError('Title is required');
            isValid = false;
        } else {
            setTitleError('');
        }
        
        if (!selectedFile) {
            setFileError('Please select a PDF file');
            isValid = false;
        } else {
            setFileError('');
        }
        
        if (selectedBatches.length === 0) {
            setBatchError('Please select at least one batch');
            isValid = false;
        } else {
            setBatchError('');
        }
        
        return isValid;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setLoading(true);
        setUploadProgress(0);
        
        const formData = new FormData();
        formData.append('title', title);
        formData.append('file', selectedFile);
        formData.append('batches', JSON.stringify(selectedBatches));
        
        try {
            const response = await api.post('/notes/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(progress);
                }
            });
            
            setSnackbar({
                open: true,
                message: 'Study material uploaded successfully',
                severity: 'success'
            });
            
            // Reset form
            setTitle('');
            setSelectedFile(null);
            setSelectedBatches([]);
            
            // Reset file input
            const fileInput = document.getElementById('file-input');
            if (fileInput) {
                fileInput.value = '';
            }
            
        } catch (error) {
            console.error('Error uploading note:', error);
            setSnackbar({
                open: true,
                message: error.response?.data?.message || 'Failed to upload study material',
                severity: 'error'
            });
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    return (
        <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
                Upload Study Material
            </Typography>
            
            <Box component="form" onSubmit={handleSubmit} noValidate>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Title"
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                                setTitleError('');
                            }}
                            error={!!titleError}
                            helperText={titleError}
                            disabled={loading}
                            placeholder="Enter a descriptive title for the material"
                        />
                    </Grid>
                    
                    <Grid item xs={12}>
                        <FormControl fullWidth error={!!batchError}>
                            <InputLabel id="batch-select-label">Select Batches</InputLabel>
                            <Select
                                labelId="batch-select-label"
                                multiple
                                value={selectedBatches}
                                onChange={handleBatchChange}
                                input={<OutlinedInput label="Select Batches" />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((batchId) => {
                                            const batch = availableBatches.find(b => b._id === batchId);
                                            return (
                                                <Chip 
                                                    key={batchId} 
                                                    label={batch ? batch.name : batchId} 
                                                    size="small"
                                                />
                                            );
                                        })}
                                    </Box>
                                )}
                                MenuProps={MenuProps}
                                disabled={loading}
                            >
                                {availableBatches.map((batch) => (
                                    <MenuItem key={batch._id} value={batch._id}>
                                        {batch.name}
                                    </MenuItem>
                                ))}
                            </Select>
                            {batchError && <FormHelperText>{batchError}</FormHelperText>}
                        </FormControl>
                    </Grid>
                    
                    <Grid item xs={12}>
                        <Box 
                            sx={{ 
                                border: `1px solid ${fileError ? theme.palette.error.main : theme.palette.divider}`,
                                borderRadius: 1,
                                p: 2,
                                textAlign: 'center',
                                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                                cursor: 'pointer',
                                '&:hover': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                }
                            }}
                            onClick={() => document.getElementById('file-input').click()}
                        >
                            <input
                                type="file"
                                id="file-input"
                                accept=".pdf"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                                disabled={loading}
                            />
                            
                            {selectedFile ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                    <PictureAsPdfIcon color="primary" />
                                    <Typography variant="body1" component="span">
                                        {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                                    </Typography>
                                </Box>
                            ) : (
                                <Box>
                                    <CloudUploadIcon fontSize="large" color="action" sx={{ mb: 1 }} />
                                    <Typography variant="body1">
                                        Click to select a PDF file
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Max size: 10MB
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                        {fileError && (
                            <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                                {fileError}
                            </Typography>
                        )}
                    </Grid>
                    
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                size="large"
                                disabled={loading}
                                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
                                fullWidth={isMobile}
                                sx={{ minWidth: isMobile ? '100%' : '200px' }}
                            >
                                {loading ? `Uploading ${uploadProgress}%` : 'Upload Material'}
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
            
            <Snackbar
                open={snackbar.open}
                autoHideDuration={5000}
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
        </Paper>
    );
};

export default UploadNote; 