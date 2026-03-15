import React from 'react';
import { Grid, Typography, Box } from '@mui/material';
import RateReviewIcon from '@mui/icons-material/RateReview';
import AssignmentIcon from '@mui/icons-material/Assignment';
import StatCard from '../../components/common/StatCard';
import PageHeader from '../../components/common/PageHeader';

const AuthorityDashboard = ({ user }) => {
    return (
        <Box>
            <PageHeader
                title="Authority Oversight"
                subtitle={`Welcome, ${user?.name}`}
            />

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard
                        title="Cases for Review"
                        value="8"
                        icon={<RateReviewIcon fontSize="large" />}
                        color="secondary"
                        subtext="Pending approval"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard
                        title="Audit Reports"
                        value="12"
                        icon={<AssignmentIcon fontSize="large" />}
                        color="primary"
                        subtext="Generated this month"
                    />
                </Grid>
            </Grid>

            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ color: 'primary.main' }}>Oversight Panel</Typography>
                <Typography variant="body1" color="text.secondary">
                    Review police actions and audit blockchain records from the sidebar.
                </Typography>
            </Box>
        </Box>
    );
};

export default AuthorityDashboard;
