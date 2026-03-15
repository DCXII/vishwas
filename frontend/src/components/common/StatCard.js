import React from 'react';
import { Card, CardContent, Typography, Box, Avatar } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const StatCard = ({ title, value, icon, color = 'primary', subtext }) => {
    return (
        <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                        <Typography variant="overline" color="text.secondary" fontWeight={600} letterSpacing={1}>
                            {title}
                        </Typography>
                        <Typography variant="h3" fontWeight={700} sx={{ my: 1, color: 'text.primary' }}>
                            {value}
                        </Typography>
                    </Box>
                    <Avatar
                        variant="rounded"
                        sx={{
                            bgcolor: `${color}.light`,
                            color: `${color}.contrastText`,
                            width: 56,
                            height: 56,
                            boxShadow: 2
                        }}
                    >
                        {icon || <TrendingUpIcon />}
                    </Avatar>
                </Box>
                {subtext && (
                    <Typography variant="body2" color="text.secondary">
                        {subtext}
                    </Typography>
                )}
            </CardContent>
            {/* Decorative background element */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: -20,
                    right: -20,
                    opacity: 0.1,
                    transform: 'rotate(-15deg)'
                }}
            >
                {React.cloneElement(icon || <TrendingUpIcon />, { sx: { fontSize: 120 } })}
            </Box>
        </Card>
    );
};

export default StatCard;
