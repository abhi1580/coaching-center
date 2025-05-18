import React from 'react';
import { Box, CircularProgress } from '@mui/material';

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
            <CircularProgress size={60} thickness={4} />
        </Box>
    );
};

export default LoadingFallback; 