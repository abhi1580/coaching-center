import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Breadcrumbs,
    Link,
    CircularProgress,
    Chip,
    Stack,
    useTheme,
    alpha
} from '@mui/material';
import {
    Home as HomeIcon,
    VideoLibrary as VideoIcon,
    ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { validateYouTubeUrl, extractVideoId, fetchVideoDetails } from '../../../../utils/youtubeUtils';
import api from '../../../../services/common/apiClient';
import Swal from 'sweetalert2';

const VideoCreate = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const [youtubeLink, setYoutubeLink] = useState('');
    const [subject, setSubject] = useState('');
    const [loading, setLoading] = useState(false);
    const [videoDetails, setVideoDetails] = useState(null);
    const [error, setError] = useState('');

    const handleYoutubeLinkChange = async (e) => {
        const url = e.target.value;
        setYoutubeLink(url);
        setError('');
        setVideoDetails(null);

        if (url && validateYouTubeUrl(url)) {
            try {
                setLoading(true);
                const videoId = extractVideoId(url);
                const details = await fetchVideoDetails(videoId);
                setVideoDetails(details);
            } catch (error) {
                console.error('Error fetching video details:', error);
                setError('Failed to fetch video details. Please check the URL and try again.');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!videoDetails) {
            setError('Please enter a valid YouTube URL and wait for the video details to load.');
            return;
        }
        if (!subject) {
            setError('Please select a subject.');
            return;
        }

        try {
            setLoading(true);
            await api.post('/videos', {
                ...videoDetails,
                youtubeLink,
                subject: subject.toLowerCase()
            });

            Swal.fire({
                title: 'Success!',
                text: 'Video has been added successfully.',
                icon: 'success',
                confirmButtonColor: 'var(--accent-yellow)'
            }).then(() => {
                navigate('/app/free-resources/videos');
            });
        } catch (error) {
            console.error('Error creating video:', error);
            setError(error.response?.data?.message || 'Failed to add video. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
            {/* Breadcrumbs */}
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2, mt: 1 }} separator="›">
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
                    href="/app/free-resources/videos"
                    sx={{ display: 'flex', alignItems: 'center' }}
                >
                    <VideoIcon sx={{ mr: 0.5 }} fontSize="small" />
                    Video Resources
                </Link>
                <Typography color="text.primary">Add New Video</Typography>
            </Breadcrumbs>

            {/* Back button */}
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/app/free-resources/videos')}
                sx={{ mb: 3 }}
            >
                Back to Videos
            </Button>

            <Paper
                elevation={0}
                sx={{
                    p: { xs: 2, sm: 3 },
                    backgroundColor: (theme) => alpha(theme.palette.primary.light, 0.05),
                    borderRadius: 2,
                }}
            >
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#343a40' }}>
                    Add New Video
                </Typography>

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="YouTube URL"
                                value={youtubeLink}
                                onChange={handleYoutubeLinkChange}
                                error={!!error}
                                helperText={error}
                                disabled={loading}
                                placeholder="Enter YouTube video URL"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Subject</InputLabel>
                                <Select
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    label="Subject"
                                    disabled={loading || !videoDetails}
                                >
                                    <MenuItem value="physics">Physics</MenuItem>
                                    <MenuItem value="chemistry">Chemistry</MenuItem>
                                    <MenuItem value="mathematics">Mathematics</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {loading && (
                            <Grid item xs={12} sx={{ textAlign: 'center' }}>
                                <CircularProgress />
                            </Grid>
                        )}

                        {videoDetails && (
                            <Grid item xs={12}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 2,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 2,
                                    }}
                                >
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={4}>
                                            <img
                                                src={videoDetails.thumbnail}
                                                alt={videoDetails.title}
                                                style={{
                                                    width: '100%',
                                                    borderRadius: '8px',
                                                    aspectRatio: '16/9',
                                                    objectFit: 'cover',
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={8}>
                                            <Typography variant="h6" gutterBottom>
                                                {videoDetails.title}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" paragraph>
                                                {videoDetails.description}
                                            </Typography>
                                            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                                                <Chip
                                                    label={`${videoDetails.viewCount} views`}
                                                    size="small"
                                                    sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}
                                                />
                                                <Chip
                                                    label={`${videoDetails.likeCount} likes`}
                                                    size="small"
                                                    sx={{ bgcolor: alpha(theme.palette.success.main, 0.1) }}
                                                />
                                                <Chip
                                                    label={videoDetails.duration}
                                                    size="small"
                                                    sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1) }}
                                                />
                                            </Stack>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Grid>
                        )}

                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={loading || !videoDetails || !subject}
                                sx={{
                                    bgcolor: 'var(--accent-yellow)',
                                    color: '#fff',
                                    '&:hover': {
                                        bgcolor: 'var(--dark-yellow)',
                                    },
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    px: 4,
                                }}
                            >
                                Add Video
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Box>
    );
};

export default VideoCreate; 