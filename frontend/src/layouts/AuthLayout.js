import React from 'react';
import { Box, Paper, Grid, Typography, Container, useTheme } from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';

const AuthLayout = ({ children, title, subtitle }) => {
    const theme = useTheme();

    return (
        <Box
            sx={{
                backgroundColor: 'background.default',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2,
                backgroundImage: `radial-gradient(circle at 10% 20%, ${theme.palette.primary.light}15 0%, transparent 20%), radial-gradient(circle at 90% 80%, ${theme.palette.secondary.light}15 0%, transparent 20%)`,
            }}
        >
            <Container maxWidth="lg">
                <Grid container spacing={0} sx={{ minHeight: '600px', borderRadius: 4, overflow: 'hidden', boxShadow: theme.shadows[10] }}>

                    {/* Left Side - Branding */}
                    <Grid
                        item
                        xs={12}
                        md={6}
                        sx={{
                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                            color: 'white',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            p: 6,
                            position: 'relative',
                            textAlign: 'center',
                        }}
                    >
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")',
                                opacity: 0.1,
                            }}
                        />

                        <SecurityIcon sx={{ fontSize: 80, mb: 3, color: 'secondary.main' }} />

                        <Typography variant="h2" sx={{ color: 'white', mb: 1, letterSpacing: '0.1em' }}>
                            VISHWAS
                        </Typography>

                        <Box sx={{ width: 60, height: 4, bgcolor: 'secondary.main', mb: 3, borderRadius: 2 }} />

                        <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 400, maxWidth: 400, lineHeight: 1.6 }}>
                            Advanced Crime Data Management System secured by Blockchain Technology.
                        </Typography>


                    </Grid>

                    {/* Right Side - Form Content */}
                    <Grid item xs={12} md={6} component={Paper} elevation={0} sx={{ display: 'flex', flexDirection: 'column', p: { xs: 3, md: 6 }, justifyContent: 'center' }}>
                        <Box sx={{ width: '100%', maxWidth: 450, mx: 'auto' }}>
                            <Box sx={{ mb: 4, textAlign: 'center' }}>
                                <Typography variant="h4" gutterBottom sx={{ color: 'primary.main' }}>
                                    {title}
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    {subtitle}
                                </Typography>
                            </Box>
                            {children}
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default AuthLayout;
