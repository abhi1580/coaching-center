import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * A reusable loading component that displays a centered circular progress spinner
 * @param {Object} props - Component props
 * @param {string} props.message - Optional loading message to display
 * @param {Object} props.sx - Additional styles to apply to the container
 */
const Loader = ({ message = 'Loading...', sx = {} }) => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 3,
                minHeight: '200px',
                ...sx,
            }}
        >
            <CircularProgress size={40} thickness={4} />
            {message && (
                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mt: 2, fontWeight: 500 }}
                >
                    {message}
                </Typography>
            )}
        </Box>
    );
};

export default Loader; 