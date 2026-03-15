import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Chip, CircularProgress, Alert, TextField, InputAdornment, Tabs, Tab, Button, Dialog,
    DialogTitle, DialogContent, DialogActions, MenuItem, Grid, IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import GavelIcon from '@mui/icons-material/Gavel';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import config from '../../config';
import PageHeader from '../../components/common/PageHeader';

const severityColor = { Critical: 'error', High: 'warning', Medium: 'info', Low: 'success' };
const statusColor = { Open: 'warning', 'Under Investigation': 'info', Closed: 'success', Resolved: 'success' };

const CaseManagement = () => {
    const [cases, setCases] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [tab, setTab] = useState(0);

    // Create Case Dialog
    const [openDialog, setOpenDialog] = useState(false);
    const [creating, setCreating] = useState(false);
    const [caseForm, setCaseForm] = useState({
        victimName: '', crimeType: '', description: '', location: '', severity: 'Medium', citizenId: '',
    });

    const crimeTypes = ['Theft', 'Assault', 'Fraud', 'Robbery', 'Cybercrime', 'Kidnapping', 'Murder', 'Harassment', 'Vandalism', 'Other'];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const headers = { 'x-auth-token': localStorage.token };
            const baseUrl = config?.apiUrl || '';

            const [casesRes, ticketsRes] = await Promise.all([
                axios.get(`${baseUrl}/api/crime/all`, { headers }),
                axios.get(`${baseUrl}/api/tickets`, { headers }),
            ]);
            setCases(casesRes.data.records || casesRes.data || []);
            setTickets(ticketsRes.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch data.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCase = async () => {
        setCreating(true);
        try {
            const url = config?.apiUrl ? `${config.apiUrl}/api/crime/create` : '/api/crime/create';
            await axios.post(url, caseForm, {
                headers: { 'x-auth-token': localStorage.token, 'Content-Type': 'application/json' }
            });
            setOpenDialog(false);
            setCaseForm({ victimName: '', crimeType: '', description: '', location: '', severity: 'Medium', citizenId: '' });
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create case.');
        } finally {
            setCreating(false);
        }
    };

    const handleRespondTicket = async (ticketId, status) => {
        try {
            const url = config?.apiUrl ? `${config.apiUrl}/api/tickets/${ticketId}/status` : `/api/tickets/${ticketId}/status`;
            await axios.put(url, { status }, {
                headers: { 'x-auth-token': localStorage.token, 'Content-Type': 'application/json' }
            });
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update ticket.');
        }
    };

    // Assignment Logic
    const [assignDialog, setAssignDialog] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [assignOfficerId, setAssignOfficerId] = useState('');
    const [assigning, setAssigning] = useState(false);

    const openAssignDialog = (ticket) => {
        setSelectedTicket(ticket);
        setAssignOfficerId('');
        setAssignDialog(true);
    };

    const handleAssignTicket = async () => {
        setAssigning(true);
        try {
            const url = config?.apiUrl ? `${config.apiUrl}/api/tickets/${selectedTicket.ticketId}/assign` : `/api/tickets/${selectedTicket.ticketId}/assign`;
            await axios.put(url, { assignedToId: assignOfficerId }, {
                headers: { 'x-auth-token': localStorage.token }
            });
            setAssignDialog(false);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to assign ticket.');
            setAssignDialog(false); // Close dialog to show error clearly
        } finally {
            setAssigning(false);
        }
    };

    const filteredCases = cases.filter(c =>
        (c.ID || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.CrimeType || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.VictimName || '').toLowerCase().includes(search.toLowerCase())
    );

    const filteredTickets = tickets.filter(t =>
        (t.complaintType || '').toLowerCase().includes(search.toLowerCase()) ||
        (t.description || '').toLowerCase().includes(search.toLowerCase()) ||
        (t.citizenName || '').toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;

    return (
        <Box>
            <PageHeader title="Case Management" subtitle="Manage crime records and citizen requests"
                action={
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
                        New Case
                    </Button>
                }
            />

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}

            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', px: 2, gap: 2 }}>
                    <Tabs value={tab} onChange={(_, v) => setTab(v)}>
                        <Tab label={`Crime Records (${cases.length})`} />
                        <Tab label={`Citizen Requests (${tickets.length})`} />
                    </Tabs>
                    <Box sx={{ flexGrow: 1 }} />
                    <TextField size="small" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
                        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
                    />
                </Box>

                {tab === 0 && (
                    filteredCases.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                            <GavelIcon sx={{ fontSize: 48, mb: 2, opacity: 0.4 }} />
                            <Typography>No cases found</Typography>
                        </Box>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700 }}>Case ID</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Crime Type</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Victim</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Severity</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredCases.map((c) => (
                                        <TableRow key={c.ID || c._id} hover>
                                            <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{c.ID || 'N/A'}</TableCell>
                                            <TableCell>{c.CrimeType || 'N/A'}</TableCell>
                                            <TableCell>{c.VictimName || 'N/A'}</TableCell>
                                            <TableCell><Chip label={c.Severity || 'N/A'} size="small" color={severityColor[c.Severity] || 'default'} /></TableCell>
                                            <TableCell><Chip label={c.Status || 'Open'} size="small" color={statusColor[c.Status] || 'default'} variant="outlined" /></TableCell>
                                            <TableCell>{c.CreatedAt ? new Date(c.CreatedAt).toLocaleDateString('en-IN') : 'N/A'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )
                )}

                {tab === 1 && (
                    filteredTickets.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                            <Typography>No requests found</Typography>
                        </Box>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700 }}>Ticket ID</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Complaint Type</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Submitted By</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredTickets.map((t) => (
                                        <TableRow key={t._id} hover>
                                            <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{t.ticketId || t._id?.slice(-8)}</TableCell>
                                            <TableCell>{t.complaintType || 'N/A'}</TableCell>
                                            <TableCell>{t.citizenName || 'N/A'}</TableCell>
                                            <TableCell><Chip label={t.status || 'Pending'} size="small" color={t.status === 'Closed' || t.status === 'Responded' ? 'success' : t.status === 'Under Review' || t.status === 'Verified' ? 'info' : 'warning'} variant="outlined" /></TableCell>
                                            <TableCell>{t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-IN') : 'N/A'}</TableCell>
                                            <TableCell>
                                                {t.status !== 'Closed' && (
                                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                        <Button size="small" variant="outlined" color="primary" onClick={() => openAssignDialog(t)}>Assign</Button>
                                                        <Button size="small" variant="outlined" color="info" onClick={() => handleRespondTicket(t.ticketId, 'Under Review')}>Review</Button>
                                                        <Button size="small" variant="outlined" color="success" onClick={() => handleRespondTicket(t.ticketId, 'Closed')}>Close</Button>
                                                    </Box>
                                                )}
                                                {t.status === 'Closed' && (
                                                    <Chip label="File Closed" size="small" color="success" disabled />
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )
                )}
            </Paper>

            {/* Create Case Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, pt: 2, pb: 1 }}>
                    <DialogTitle sx={{ p: 0, fontWeight: 700, color: 'primary.main' }}>Create New Case</DialogTitle>
                    <IconButton onClick={() => setOpenDialog(false)} size="small"><CloseIcon /></IconButton>
                </Box>
                <DialogContent>
                    <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth required label="Victim Name" value={caseForm.victimName} onChange={(e) => setCaseForm({ ...caseForm, victimName: e.target.value })} variant="outlined" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth required select label="Crime Type" value={caseForm.crimeType} onChange={(e) => setCaseForm({ ...caseForm, crimeType: e.target.value })} variant="outlined">
                                {crimeTypes.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth required multiline rows={4} label="Description" value={caseForm.description} onChange={(e) => setCaseForm({ ...caseForm, description: e.target.value })} variant="outlined" placeholder="Enter detailed case description..." />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Location" value={caseForm.location} onChange={(e) => setCaseForm({ ...caseForm, location: e.target.value })} variant="outlined" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth select label="Severity" value={caseForm.severity} onChange={(e) => setCaseForm({ ...caseForm, severity: e.target.value })} variant="outlined">
                                {['Low', 'Medium', 'High', 'Critical'].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Link Citizen ID (optional)" value={caseForm.citizenId} onChange={(e) => setCaseForm({ ...caseForm, citizenId: e.target.value })}
                                helperText="Associate this case with a registered citizen's ID" variant="outlined" />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
                    <Button onClick={() => setOpenDialog(false)} variant="outlined" color="inherit" sx={{ borderRadius: 2 }}>Cancel</Button>
                    <Button variant="contained" onClick={handleCreateCase} disabled={creating} sx={{ borderRadius: 2, px: 4 }}>
                        {creating ? 'Creating...' : 'Create Case'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Assign Ticket Dialog */}
            <Dialog open={assignDialog} onClose={() => setAssignDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
                <DialogTitle sx={{ p: 0, fontWeight: 700, color: 'primary.main', px: 3, pt: 2 }}>Assign Ticket</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Assign Ticket ID: <strong>{selectedTicket?.ticketId}</strong> to an officer.
                    </Typography>
                    <TextField
                        fullWidth
                        label="Officer ID (Leave empty to assign to self)"
                        value={assignOfficerId}
                        onChange={(e) => setAssignOfficerId(e.target.value)}
                        variant="outlined"
                        sx={{ mt: 2 }}
                        helperText="Enter the ID of the officer or leave blank to take the case yourself."
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setAssignDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleAssignTicket} disabled={assigning}>
                        {assigning ? 'Assigning...' : 'Assign'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CaseManagement;
