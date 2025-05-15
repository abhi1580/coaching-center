import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingFallback = () => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                width: '100%',
            }}
        >
            <CircularProgress size={60} thickness={4} sx={{ mb: 2 }} />
            <Typography variant="subtitle1" color="text.secondary">
                Loading...
            </Typography>
        </Box>
    );
};

export default LoadingFallback; 