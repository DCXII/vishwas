import React, { useState, useEffect } from 'react';
import {
    Box, Card, CardContent, Typography, Button, CircularProgress, Alert, Chip,
    Dialog, DialogTitle, DialogContent, DialogActions, Paper, Divider, Grid
} from '@mui/material';
import axios from 'axios';
import config from '../../config';
import PageHeader from '../../components/common/PageHeader';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ClosedCaptionIcon from '@mui/icons-material/ClosedCaption';

const statusColors = {
    'Pending': 'default',
    'Under Review': 'info',
    'Verified': 'warning',
    'Responded': 'success',
    'Closed': 'error',
};

const TrackRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [openDetailDialog, setOpenDetailDialog] = useState(false);
    const [filterStatus, setFilterStatus] = useState('All');

    useEffect(() => {
        fetchMyRequests();
    }, []);

    const fetchMyRequests = async () => {
        try {
            const url = config?.apiUrl ? `${config.apiUrl}/api/tickets/my` : '/api/tickets/my';
            const res = await axios.get(url, {
                headers: { 'x-auth-token': localStorage.token }
            });
            setRequests(res.data);
            setError('');
        } catch (err) {
            console.error('Error fetching requests:', err);
            setError('Failed to fetch your requests');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (request) => {
        setSelectedRequest(request);
        setOpenDetailDialog(true);
    };

    const filteredRequests = filterStatus === 'All'
        ? requests
        : requests.filter(r => r.status === filterStatus);

    const statuses = ['All', 'Pending', 'Under Review', 'Verified', 'Responded', 'Closed'];

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;

    const statusCounts = {
        'All': requests.length,
        'Pending': requests.filter(r => r.status === 'Pending').length,
        'Under Review': requests.filter(r => r.status === 'Under Review').length,
        'Verified': requests.filter(r => r.status === 'Verified').length,
        'Responded': requests.filter(r => r.status === 'Responded').length,
        'Closed': requests.filter(r => r.status === 'Closed').length,
    };

    return (
        <Box>
            <PageHeader
                title="Track Your Requests"
                subtitle="Monitor the status of all your filed complaints"
            />

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {/* Status Filters */}
            <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>Filter by Status</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {statuses.map(status => (
                        <Chip
                            key={status}
                            label={`${status} (${statusCounts[status]})`}
                            onClick={() => setFilterStatus(status)}
                            variant={filterStatus === status ? 'filled' : 'outlined'}
                            color={filterStatus === status ? 'primary' : 'default'}
                        />
                    ))}
                </Box>
            </Paper>

            {/* Requests List */}
            {filteredRequests.length === 0 ? (
                <Alert severity="info">
                    {filterStatus === 'All' ? 'No requests filed yet.' : `No requests with status "${filterStatus}".`}
                </Alert>
            ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 2 }}>
                    {filteredRequests.map(request => (
                        <Card key={request.ticketId} sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                            {request.complaintType}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {request.ticketId}
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label={request.status}
                                        size="small"
                                        color={statusColors[request.status]}
                                        variant="outlined"
                                    />
                                </Box>

                                <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                                    {request.description.substring(0, 80)}...
                                </Typography>

                                {request.location && (
                                    <Typography variant="caption" color="text.secondary">
                                        📍 {request.location}
                                    </Typography>
                                )}

                                {request.policeResponse && (
                                    <Box sx={{ mt: 2, p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                            Police Response:
                                        </Typography>
                                        <Typography variant="body2">
                                            {request.policeResponse.message}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            By: {request.policeResponse.respondedByName}
                                        </Typography>
                                    </Box>
                                )}

                                <Button
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    startIcon={<VisibilityIcon />}
                                    onClick={() => handleViewDetails(request)}
                                    sx={{ mt: 2 }}
                                >
                                    View Details
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            )}

            {/* Detail Dialog */}
            <Dialog open={openDetailDialog} onClose={() => setOpenDetailDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
                    Request Details
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    {selectedRequest && (
                        <Box>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Ticket ID</Typography>
                                    <Typography variant="body2">{selectedRequest.ticketId}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Type</Typography>
                                    <Typography variant="body2">{selectedRequest.complaintType}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Status</Typography>
                                    <Chip label={selectedRequest.status} size="small" color={statusColors[selectedRequest.status]} sx={{ mt: 0.5 }} />
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Description</Typography>
                                    <Typography variant="body2">{selectedRequest.description}</Typography>
                                </Grid>
                                {selectedRequest.suspectDescription && (
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Suspect Description</Typography>
                                        <Typography variant="body2">{selectedRequest.suspectDescription}</Typography>
                                    </Grid>
                                )}
                                {selectedRequest.location && (
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Location</Typography>
                                        <Typography variant="body2">{selectedRequest.location}</Typography>
                                    </Grid>
                                )}
                                {selectedRequest.policeResponse && (
                                    <>
                                        <Grid item xs={12}>
                                            <Divider />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'success.main' }}>
                                                Police Response
                                            </Typography>
                                            <Typography variant="body2" sx={{ mt: 1 }}>
                                                {selectedRequest.policeResponse.message}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                From: {selectedRequest.policeResponse.respondedByName}
                                            </Typography>
                                        </Grid>
                                    </>
                                )}
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDetailDialog(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TrackRequests;
