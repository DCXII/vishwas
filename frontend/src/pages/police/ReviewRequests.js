import React, { useState, useEffect } from 'react';
import {
    Box, Card, CardContent, Typography, Button, CircularProgress, Alert, Chip, TextField,
    Dialog, DialogTitle, DialogContent, DialogActions, Paper, Grid, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Divider
} from '@mui/material';
import axios from 'axios';
import config from '../../config';
import PageHeader from '../../components/common/PageHeader';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const ReviewRequests = () => {
    const [workflows, setWorkflows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedWorkflow, setSelectedWorkflow] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [actionType, setActionType] = useState(''); // 'APPROVE' or 'REJECT'
    const [comments, setComments] = useState('');

    useEffect(() => {
        fetchPendingWorkflows();
    }, []);

    const fetchPendingWorkflows = async () => {
        try {
            setLoading(true);
            const url = config?.apiUrl ? `${config.apiUrl}/api/approvals/pending` : '/api/approvals/pending';
            const res = await axios.get(url, {
                headers: { 'x-auth-token': localStorage.token }
            });
            setWorkflows(res.data);
            setError('');
        } catch (err) {
            console.error('Error fetching workflows:', err);
            setError('Failed to fetch pending approvals');
        } finally {
            setLoading(false);
        }
    };

    const handleActionClick = (workflow, type) => {
        setSelectedWorkflow(workflow);
        setActionType(type);
        setComments('');
        setOpenDialog(true);
    };

    const handleConfirmAction = async () => {
        if (!selectedWorkflow) return;

        const endpoint = actionType === 'APPROVE' ? 'approve' : 'reject';

        try {
            const url = config?.apiUrl
                ? `${config.apiUrl}/api/approvals/${selectedWorkflow._id}/${endpoint}`
                : `/api/approvals/${selectedWorkflow._id}/${endpoint}`;

            await axios.post(url, { comments }, {
                headers: { 'x-auth-token': localStorage.token }
            });

            setSuccess(`Workflow successfully ${actionType === 'APPROVE' ? 'approved' : 'rejected'}`);
            setOpenDialog(false);
            setTimeout(() => setSuccess(''), 4000);
            fetchPendingWorkflows();
        } catch (err) {
            console.error('Action error:', err);
            setError(err.response?.data?.error || `Failed to ${endpoint} workflow`);
            setOpenDialog(false);
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;

    return (
        <Box>
            <PageHeader
                title="Review Pending Approvals"
                subtitle="Review and sign-off on escalated complaints and sensitive actions"
            />

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            {workflows.length === 0 ? (
                <Alert severity="info" sx={{ mt: 2 }}>
                    No items currently pending your approval layer.
                </Alert>
            ) : (
                <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                    <Table>
                        <TableHead sx={{ bgcolor: 'action.hover' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700 }}>Workflow ID</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Severity</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Details</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Initiated By</TableCell>
                                <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {workflows.map((wf) => (
                                <TableRow key={wf._id} hover>
                                    <TableCell sx={{ fontWeight: 600 }}>{wf.workflowId}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={wf.entityType.replace(/_/g, ' ')}
                                            size="small"
                                            color={wf.entityType === 'COMPLAINT_AGAINST_AUTHORITY' ? 'error' : 'primary'}
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={wf.metadata?.severity || 'MEDIUM'}
                                            size="small"
                                            color={wf.metadata?.severity === 'CRITICAL' ? 'error' : 'warning'}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {wf.ticketDetails ? (
                                            <Box>
                                                <Typography variant="body2" fontWeight={600}>{wf.ticketDetails.complaintType}</Typography>
                                                <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 200, display: 'block' }}>
                                                    {wf.ticketDetails.description}
                                                </Typography>
                                            </Box>
                                        ) : 'No connected ticket'}
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{wf.initiatedBy.name}</Typography>
                                        <Typography variant="caption" color="text.secondary">{wf.initiatedBy.role}</Typography>
                                    </TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>
                                        <Button
                                            size="small"
                                            variant="contained"
                                            color="success"
                                            startIcon={<CheckCircleIcon />}
                                            onClick={() => handleActionClick(wf, 'APPROVE')}
                                            sx={{ mr: 1 }}
                                        >
                                            Approve
                                        </Button>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            color="error"
                                            startIcon={<CancelIcon />}
                                            onClick={() => handleActionClick(wf, 'REJECT')}
                                        >
                                            Reject
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Action Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{
                    bgcolor: actionType === 'APPROVE' ? 'success.main' : 'error.main',
                    color: 'white'
                }}>
                    {actionType === 'APPROVE' ? 'Sign Approval' : 'Reject Workflow'}
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Typography sx={{ mb: 2 }}>
                        You are about to <strong>{actionType.toLowerCase()}</strong> workflow {selectedWorkflow?.workflowId}.
                    </Typography>

                    {selectedWorkflow?.ticketDetails && (
                        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                            <Typography variant="subtitle2" fontWeight={600}>Complaint Context:</Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>{selectedWorkflow.ticketDetails.description}</Typography>
                        </Box>
                    )}

                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Comments / Digital Signature Hash"
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder={`Provide your official remarks for ${actionType.toLowerCase()}ing this stage...`}
                        variant="outlined"
                        required
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button onClick={() => setOpenDialog(false)} color="inherit">Cancel</Button>
                    <Button
                        onClick={handleConfirmAction}
                        variant="contained"
                        color={actionType === 'APPROVE' ? 'success' : 'error'}
                        disabled={!comments.trim()}
                    >
                        Confirm {actionType.toLowerCase()}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ReviewRequests;
