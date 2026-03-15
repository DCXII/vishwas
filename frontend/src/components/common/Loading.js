import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const Loading = ({ message = 'Loading...' }) => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                minHeight: '200px',
                width: '100%',
            }}
        >
            <CircularProgress size={40} thickness={4} sx={{ color: 'primary.main', mb: 2 }} />
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
                {message}
            </Typography>
        </Box>
    );
};

export default Loading;
