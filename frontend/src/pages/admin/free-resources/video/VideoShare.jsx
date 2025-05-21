import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Chip,
    IconButton,
    Stack,
    Breadcrumbs,
    Link,
    CircularProgress,
    useTheme,
    useMediaQuery,
    alpha
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Home as HomeIcon,
    VideoLibrary as VideoIcon,
    Visibility as VisibilityIcon,
    ThumbUp as ThumbUpIcon,
    AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import api from '../../../../services/common/apiClient';
import Swal from 'sweetalert2';

const VideoShare = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            setLoading(true);
            const response = await api.get('/videos');
            setVideos(response.data);
        } catch (error) {
            console.error('Error fetching videos:', error);
            Swal.fire({
                title: 'Error',
                text: 'Failed to fetch videos. Please try again.',
                icon: 'error',
                confirmButtonColor: 'var(--accent-yellow)'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: 'var(--accent-yellow)',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
            });

            if (result.isConfirmed) {
                await api.delete(`/videos/${id}`);
                Swal.fire({
                    title: 'Deleted!',
                    text: 'Video has been deleted.',
                    icon: 'success',
                    confirmButtonColor: 'var(--accent-yellow)'
                });
                fetchVideos();
            }
        } catch (error) {
            console.error('Error deleting video:', error);
            Swal.fire({
                title: 'Error',
                text: 'Failed to delete video. Please try again.',
                icon: 'error',
                confirmButtonColor: 'var(--accent-yellow)'
            });
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: 2,
                    background: theme => alpha(theme.palette.primary.main, 0.1)
                }}
            >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography variant="h4" gutterBottom>
                            Video Management
                        </Typography>
                        <Breadcrumbs>
                            <Link
                                component="button"
                                variant="body2"
                                onClick={() => navigate('/app')}
                                sx={{ display: 'flex', alignItems: 'center' }}
                            >
                                <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
                                Home
                            </Link>
                            <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                                <VideoIcon sx={{ mr: 0.5 }} fontSize="small" />
                                Videos
                            </Typography>
                        </Breadcrumbs>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/app/free-resources/videos/create')}
                        sx={{
                            backgroundColor: 'var(--accent-yellow)',
                            '&:hover': {
                                backgroundColor: 'var(--accent-yellow-dark)'
                            }
                        }}
                    >
                        Add Video
                    </Button>
                </Stack>
            </Paper>

            {/* Video Grid */}
            <Grid container spacing={3}>
                {videos.map((video) => (
                    <Grid item xs={12} sm={6} md={4} key={video._id}>
                        <Card
                            sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'transform 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-4px)'
                                }
                            }}
                        >
                            <CardMedia
                                component="img"
                                height="200"
                                image={video.thumbnail}
                                alt={video.title}
                                sx={{ objectFit: 'cover' }}
                            />
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Stack spacing={2}>
                                    <Box>
                                        <Chip
                                            label={video.subject}
                                            size="small"
                                            sx={{
                                                mb: 1,
                                                backgroundColor: theme => alpha(theme.palette.primary.main, 0.1),
                                                color: 'primary.main'
                                            }}
                                        />
                                        <Typography variant="h6" gutterBottom noWrap>
                                            {video.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {video.description?.substring(0, 100)}...
                                        </Typography>
                                    </Box>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <AccessTimeIcon fontSize="small" color="action" />
                                        <Typography variant="body2" color="text.secondary">
                                            {video.duration}
                                        </Typography>
                                        <Box sx={{ flexGrow: 1 }} />
                                        <VisibilityIcon fontSize="small" color="action" />
                                        <Typography variant="body2" color="text.secondary">
                                            {video.viewCount}
                                        </Typography>
                                        <ThumbUpIcon fontSize="small" color="action" />
                                        <Typography variant="body2" color="text.secondary">
                                            {video.likeCount}
                                        </Typography>
                                    </Stack>
                                    <Stack direction="row" spacing={1}>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            fullWidth
                                            onClick={() => window.open(video.youtubeLink, '_blank')}
                                        >
                                            Watch
                                        </Button>
                                        <IconButton
                                            size="small"
                                            onClick={() => navigate(`/app/free-resources/videos/${video._id}/edit`)}
                                            sx={{ color: 'primary.main' }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDelete(video._id)}
                                            sx={{ color: 'error.main' }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Stack>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default VideoShare; 