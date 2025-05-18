import React from 'react';
import { Box, CircularProgress } from '@mui/material';

/**
 * A reusable loading component that displays a centered circular progress spinner
 * @param {Object} props - Component props
 * @param {Object} props.sx - Additional styles to apply to the container
 */
const Loader = ({ sx = {} }) => {
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
        </Box>
    );
};

export default Loader; 