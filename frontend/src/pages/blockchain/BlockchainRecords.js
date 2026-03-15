import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Grid, CircularProgress, Alert, Chip, Divider
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import StorageIcon from '@mui/icons-material/Storage';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import axios from 'axios';
import config from '../../config';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';

const BlockchainRecords = () => {
    const [status, setStatus] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const headers = { 'x-auth-token': localStorage.token };
                const baseUrl = config?.apiUrl || '';

                const [statusRes, statsRes] = await Promise.allSettled([
                    axios.get(`${baseUrl}/api/blockchain/status`, { headers }),
                    axios.get(`${baseUrl}/api/blockchain/stats`, { headers }),
                ]);

                if (statusRes.status === 'fulfilled') setStatus(statusRes.value.data);
                if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
            } catch (err) {
                setError('Failed to fetch blockchain data.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;

    const isConnected = status?.fabricAvailable || status?.blockchainMode === 'FABRIC';

    return (
        <Box>
            <PageHeader title="Blockchain Records" subtitle="Monitor the Hyperledger Fabric network status and transaction history" />

            {error && <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

            {/* Network Status */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, mb: 3, border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <SecurityIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Network Status</Typography>
                </Box>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Connection"
                            value={isConnected ? 'Connected' : 'Disconnected'}
                            icon={isConnected ? <CheckCircleIcon fontSize="large" /> : <ErrorIcon fontSize="large" />}
                            color={isConnected ? 'success' : 'error'}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard title="Network" value={status?.network || 'Hyperledger Fabric'} icon={<StorageIcon fontSize="large" />} color="primary" />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard title="Channel" value={status?.channel || 'mychannel'} icon={<SecurityIcon fontSize="large" />} color="secondary" />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard title="Total Transactions" value={stats?.totalTransactions || stats?.total || 0} icon={<ReceiptLongIcon fontSize="large" />} color="info" />
                    </Grid>
                </Grid>
            </Paper>

            {/* Info Panel */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main', mb: 2 }}>About Blockchain Integration</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    VISHWAS uses Hyperledger Fabric to maintain an immutable ledger of all case actions. Every create, update, and status change is recorded as a blockchain transaction, ensuring full accountability and tamper resistance.
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                    {[
                        { label: 'Immutable Records', desc: 'Once written, records cannot be altered or deleted' },
                        { label: 'Full Audit Trail', desc: 'Every action is timestamped and attributed to a user' },
                        { label: 'Distributed Consensus', desc: 'Multiple peers validate each transaction' },
                    ].map(item => (
                        <Grid item xs={12} md={4} key={item.label}>
                            <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'action.hover' }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>{item.label}</Typography>
                                <Typography variant="body2" color="text.secondary">{item.desc}</Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Paper>
        </Box>
    );
};

export default BlockchainRecords;
