import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Grid, CircularProgress, Alert, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Chip, Button, Dialog, DialogTitle,
    DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import GavelIcon from '@mui/icons-material/Gavel';
import ReceiptIcon from '@mui/icons-material/Receipt';
import StorageIcon from '@mui/icons-material/Storage';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';
import config from '../../config';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';

const roleColor = { Admin: 'error', Police: 'info', Authority: 'secondary', Citizen: 'success' };

const SystemAdmin = () => {
    const [users, setUsers] = useState([]);
    const [cases, setCases] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [newRole, setNewRole] = useState('');
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

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
            setError('Failed to fetch admin data.');
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (user) => {
        setSelectedUser(user);
        setNewRole(user.role);
        setOpenEditDialog(true);
    };

    const handleEditSave = async () => {
        if (!selectedUser || !newRole) return;

        try {
            const headers = { 'x-auth-token': localStorage.token };
            const baseUrl = config?.apiUrl || '';

            await axios.put(
                `${baseUrl}/api/users/${selectedUser._id}/role`,
                { role: newRole },
                { headers }
            );

            setSuccess('User role updated successfully');
            setOpenEditDialog(false);
            setSelectedUser(null);
            setTimeout(() => setSuccess(''), 3000);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update user role');
        }
    };

    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setOpenDeleteDialog(true);
    };

    const handleDeleteConfirm = async () => {
        if (!userToDelete) return;

        try {
            const headers = { 'x-auth-token': localStorage.token };
            const baseUrl = config?.apiUrl || '';

            await axios.delete(
                `${baseUrl}/api/users/${userToDelete._id}`,
                { headers }
            );

            setSuccess('User deleted successfully');
            setOpenDeleteDialog(false);
            setUserToDelete(null);
            setTimeout(() => setSuccess(''), 3000);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete user');
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;

    const roleCounts = users.reduce((acc, u) => { acc[u.role] = (acc[u.role] || 0) + 1; return acc; }, {});

    return (
        <Box>
            <PageHeader title="System Administration" subtitle="Manage users, monitor system health, and oversee operations" />

            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            {/* Stats */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Total Users" value={users.length} icon={<PeopleIcon fontSize="large" />} color="primary" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Total Cases" value={cases.length} icon={<GavelIcon fontSize="large" />} color="warning" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Police Officers" value={roleCounts['Police'] || 0} icon={<ReceiptIcon fontSize="large" />} color="info" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Citizens" value={roleCounts['Citizen'] || 0} icon={<StorageIcon fontSize="large" />} color="success" />
                </Grid>
            </Grid>

            {/* User Breakdown */}
            <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden', mb: 3 }}>
                <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>User Management (showing first 50)</Typography>
                </Box>
                <TableContainer sx={{ maxHeight: 600 }}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'action.hover' }}>
                                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Phone</TableCell>
                                <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.slice(0, 50).map((u) => (
                                <TableRow key={u._id} hover>
                                    <TableCell sx={{ fontWeight: 500 }}>{u.name}</TableCell>
                                    <TableCell>{u.email}</TableCell>
                                    <TableCell><Chip label={u.role} size="small" color={roleColor[u.role] || 'default'} variant="outlined" /></TableCell>
                                    <TableCell>{u.phone || 'N/A'}</TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>
                                        <Button
                                            size="small"
                                            startIcon={<EditIcon />}
                                            onClick={() => handleEditClick(u)}
                                            sx={{ mr: 1 }}
                                            variant="outlined"
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            size="small"
                                            startIcon={<DeleteIcon />}
                                            onClick={() => handleDeleteClick(u)}
                                            color="error"
                                            variant="outlined"
                                        >
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Edit Role Dialog */}
            <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Update User Role</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        Changing role for: <strong>{selectedUser?.name}</strong>
                    </Typography>
                    <FormControl fullWidth>
                        <InputLabel>Role</InputLabel>
                        <Select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            label="Role"
                        >
                            <MenuItem value="Citizen">Citizen</MenuItem>
                            <MenuItem value="Police">Police</MenuItem>
                            <MenuItem value="Authority">Authority</MenuItem>
                            <MenuItem value="Admin">Admin</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
                    <Button onClick={handleEditSave} variant="contained" color="primary">
                        Update
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete <strong>{userToDelete?.name}</strong>? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} variant="contained" color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SystemAdmin;
