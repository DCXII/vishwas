import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Chip, CircularProgress, Alert, TextField, InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FolderIcon from '@mui/icons-material/Folder';
import axios from 'axios';
import config from '../../config';
import PageHeader from '../../components/common/PageHeader';

const severityColor = { Critical: 'error', High: 'warning', Medium: 'info', Low: 'success' };
const statusColor = { Open: 'warning', 'Under Investigation': 'info', Closed: 'success', Resolved: 'success' };

const MyCases = () => {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchCases = async () => {
            try {
                const userRes = await axios.get(
                    config?.apiUrl ? `${config.apiUrl}/api/users/me` : '/api/users/me',
                    { headers: { 'x-auth-token': localStorage.token } }
                );
                const citizenId = userRes.data.citizenId;
                if (!citizenId) { setCases([]); setLoading(false); return; }

                const url = config?.apiUrl ? `${config.apiUrl}/api/crime/citizen/${citizenId}` : `/api/crime/citizen/${citizenId}`;
                const res = await axios.get(url, { headers: { 'x-auth-token': localStorage.token } });
                setCases(res.data.records || []);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch cases.');
            } finally {
                setLoading(false);
            }
        };
        fetchCases();
    }, []);

    const filtered = cases.filter(c =>
        (c.ID || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.CrimeType || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.VictimName || '').toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;

    return (
        <Box>
            <PageHeader title="My Cases" subtitle="View all crime records associated with your account" />

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <TextField
                        size="small" placeholder="Search by Case ID, Type, or Victim..." value={search}
                        onChange={(e) => setSearch(e.target.value)} sx={{ minWidth: 300 }}
                        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
                    />
                </Box>

                {filtered.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                        <FolderIcon sx={{ fontSize: 48, mb: 2, opacity: 0.4 }} />
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
                                {filtered.map((c) => (
                                    <TableRow key={c.ID} hover sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
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
                )}
            </Paper>
        </Box>
    );
};

export default MyCases;
