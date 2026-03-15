import React, { useState } from 'react';
import { Grid, Typography, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Paper } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import ReceiptIcon from '@mui/icons-material/Receipt';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import StatCard from '../../components/common/StatCard';
import PageHeader from '../../components/common/PageHeader';
import axios from 'axios';
import config from '../../config';

const CitizenDashboard = ({ user, crimeRecords, myRequests }) => {
    const [zkpModalOpen, setZkpModalOpen] = useState(false);
    const [zkpProof, setZkpProof] = useState(null);
    const [loadingZkp, setLoadingZkp] = useState(false);

    const generateZKP = async () => {
        setLoadingZkp(true);
        try {
            const url = config?.apiUrl ? `${config.apiUrl}/api/users/zkp-report` : '/api/users/zkp-report';
            const res = await axios.get(url, {
                headers: { 'x-auth-token': localStorage.token }
            });
            setZkpProof(res.data.proof);
            setZkpModalOpen(true);
        } catch (err) {
            console.error('ZKP Error:', err);
            alert('Failed to generate ZKP Report');
        } finally {
            setLoadingZkp(false);
        }
    };

    return (
        <Box>
            <PageHeader
                title={`Welcome, ${user?.name}`}
                subtitle="Citizen Dashboard Overview"
                action={
                    <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<VerifiedUserIcon />}
                        onClick={generateZKP}
                        disabled={loadingZkp}
                    >
                        {loadingZkp ? 'Generating...' : 'Generate ZKP Report'}
                    </Button>
                }
            />

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard
                        title="My Cases"
                        value={crimeRecords?.length || 0}
                        icon={<FolderIcon fontSize="large" />}
                        color="primary"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <StatCard
                        title="My Requests"
                        value={myRequests?.length || 0}
                        icon={<ReceiptIcon fontSize="large" />}
                        color="secondary"
                    />
                </Grid>
            </Grid>

            {/* Placeholder for Data Tables - keeping simple for now */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ color: 'primary.main' }}>Recent Activity</Typography>
                <Typography variant="body1" color="text.secondary">
                    Select "My Cases" or "My Requests" from the sidebar to view details.
                </Typography>
            </Box>

            {/* ZKP Proof Modal */}
            <Dialog open={zkpModalOpen} onClose={() => setZkpModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ bgcolor: 'secondary.main', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VerifiedUserIcon /> Zero Knowledge Proof Identity Report
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    {zkpProof && (
                        <Box>
                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                                Verified Attributes (Zero Knowledge):
                            </Typography>
                            <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8fdf8', mb: 2 }}>
                                <Typography><strong>Is Adult (18+):</strong> {zkpProof.data?.claims?.isAdult ? 'Yes (Verified)' : 'No'}</Typography>
                                <Typography><strong>Valid Resident:</strong> {zkpProof.data?.claims?.isValidResident ? 'Yes (Verified)' : 'No'}</Typography>
                                <Typography><strong>Clean Record:</strong> {zkpProof.data?.claims?.hasCleanRecord ? 'Yes (Verified)' : 'No'}</Typography>
                            </Paper>

                            <Typography variant="caption" display="block" color="text.secondary" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                <strong>Proof Signature:</strong> {zkpProof.signature}
                            </Typography>
                            <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                                This report cryptographically proves your eligibility without revealing your date of birth or address.
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setZkpModalOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CitizenDashboard;
