import React, { useEffect, useState } from 'react';
import { Grid, Typography, Box, CircularProgress, Alert, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button, Card, CardContent } from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import StorageIcon from '@mui/icons-material/Storage';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import PeopleIcon from '@mui/icons-material/People';
import GavelIcon from '@mui/icons-material/Gavel';
import ReceiptIcon from '@mui/icons-material/Receipt';
import BlockchainIcon from '@mui/icons-material/Schema';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';
import StatCard from '../../components/common/StatCard';
import PageHeader from '../../components/common/PageHeader';

const roleColor = { Admin: 'error', Police: 'info', Authority: 'secondary', Citizen: 'success' };

const AdminDashboard = ({ user }) => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [cases, setCases] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const headers = { 'x-auth-token': localStorage.token };
                const baseUrl = config?.apiUrl || '';

                const [usersRes, casesRes, ticketsRes] = await Promise.allSettled([
                    axios.get(`${baseUrl}/api/users`, { headers }),
                    axios.get(`${baseUrl}/api/crime/all`, { headers }),
                    axios.get(`${baseUrl}/api/tickets`, { headers }),
                ]);

                if (usersRes.status === 'fulfilled') setUsers(usersRes.value.data || []);
                if (casesRes.status === 'fulfilled') setCases(casesRes.value.data?.records || casesRes.value.data || []);
                if (ticketsRes.status === 'fulfilled') setTickets(ticketsRes.value.data || []);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to fetch dashboard data.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;

    const roleCounts = users.reduce((acc, u) => { acc[u.role] = (acc[u.role] || 0) + 1; return acc; }, {});

    return (
        <Box>
            <PageHeader
                title="System Administration Dashboard"
                subtitle="Monitor system health, users, cases, and tickets"
            />

            {error && <Alert severity="warning" sx={{ mb: 3 }}>{error}</Alert>}

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Users"
                        value={users.length}
                        icon={<PeopleIcon fontSize="large" />}
                        color="primary"
                        subtext={`${roleCounts['Citizen'] || 0} Citizens`}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Cases"
                        value={cases.length}
                        icon={<GavelIcon fontSize="large" />}
                        color="warning"
                        subtext="Crime records"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Tickets"
                        value={tickets.length}
                        icon={<ReceiptIcon fontSize="large" />}
                        color="info"
                        subtext="Filed complaints"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="System Status"
                        value="Operational"
                        icon={<VerifiedUserIcon fontSize="large" />}
                        color="success"
                        subtext="All nodes active"
                    />
                </Grid>
            </Grid>

            {/* Blockchain Visualization Card */}
            <Card sx={{ mb: 3, bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <BlockchainIcon sx={{ fontSize: 40 }} />
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                Blockchain Ledger
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                Monitor all case transactions on the blockchain
                            </Typography>
                        </Box>
                    </Box>
                    <Button
                        variant="contained"
                        sx={{
                            bgcolor: 'white',
                            color: '#667eea',
                            fontWeight: 'bold',
                            '&:hover': { bgcolor: '#f0f0f0' }
                        }}
                        endIcon={<ArrowRightIcon />}
                        onClick={() => navigate('/blockchain-visualization')}
                    >
                        View Dashboard
                    </Button>
                </CardContent>
            </Card>

            {/* User Breakdown */}
            <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden', mb: 3 }}>
                <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>User Directory (First 10)</Typography>
                </Box>
                <TableContainer sx={{ maxHeight: 400 }}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'action.hover' }}>
                                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Phone</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.slice(0, 10).map((u) => (
                                <TableRow key={u._id} hover>
                                    <TableCell>{u.name}</TableCell>
                                    <TableCell>{u.email}</TableCell>
                                    <TableCell><Chip label={u.role} size="small" color={roleColor[u.role] || 'default'} variant="outlined" /></TableCell>
                                    <TableCell>{u.phone || 'N/A'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Recent Cases */}
            {cases.length > 0 && (
                <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden', mb: 3 }}>
                    <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>Recent Cases (First 5)</Typography>
                    </Box>
                    <TableContainer sx={{ maxHeight: 300 }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'action.hover' }}>
                                    <TableCell sx={{ fontWeight: 700 }}>Case ID</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Crime Type</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Location</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {cases.slice(0, 5).map((c) => (
                                    <TableRow key={c._id} hover>
                                        <TableCell>{c.caseId}</TableCell>
                                        <TableCell>{c.crimeType}</TableCell>
                                        <TableCell><Chip label={c.status} size="small" variant="outlined" /></TableCell>
                                        <TableCell>{c.location || 'N/A'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}

            {/* Recent Tickets */}
            {tickets.length > 0 && (
                <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                    <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>Recent Tickets (First 5)</Typography>
                    </Box>
                    <TableContainer sx={{ maxHeight: 300 }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'action.hover' }}>
                                    <TableCell sx={{ fontWeight: 700 }}>Ticket ID</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Citizen</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tickets.slice(0, 5).map((t) => (
                                    <TableRow key={t._id} hover>
                                        <TableCell>{t.ticketId}</TableCell>
                                        <TableCell>{t.complaintType}</TableCell>
                                        <TableCell><Chip label={t.status} size="small" variant="outlined" /></TableCell>
                                        <TableCell>{t.citizenName || 'N/A'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}
        </Box>
    );
};

export default AdminDashboard;
