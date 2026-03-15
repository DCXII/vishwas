import React from 'react';
import { Grid, Typography, Box } from '@mui/material';
import GavelIcon from '@mui/icons-material/Gavel';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import StatCard from '../../components/common/StatCard';
import PageHeader from '../../components/common/PageHeader';

const PoliceDashboard = ({ user }) => {
    return (
        <Box>
            <PageHeader
                title="Police Command Center"
                subtitle={`Officer: ${user?.name} | ${user?.role}`}
            />

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard
                        title="Active Cases"
                        value="12"
                        icon={<FolderOpenIcon fontSize="large" />}
                        color="warning"
                        subtext="3 High Priority"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard
                        title="Pending Verifications"
                        value="5"
                        icon={<PersonSearchIcon fontSize="large" />}
                        color="info"
                        subtext="Suspect identification required"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard
                        title="Total Cases Filed"
                        value="45"
                        icon={<GavelIcon fontSize="large" />}
                        color="primary"
                    />
                </Grid>
            </Grid>

            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ color: 'primary.main' }}>Case Management</Typography>
                <Typography variant="body1" color="text.secondary">
                    Use the sidebar to access "Case Management" or "Blockchain Records".
                </Typography>
            </Box>
        </Box>
    );
};

export default PoliceDashboard;
