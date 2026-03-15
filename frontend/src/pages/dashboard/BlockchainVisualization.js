import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  LinearProgress
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import BlockchainIcon from '@mui/icons-material/Schema';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LinkIcon from '@mui/icons-material/Link';
import StorageIcon from '@mui/icons-material/Storage';
import axios from 'axios';
import config from '../../config';
import StatCard from '../../components/common/StatCard';
import PageHeader from '../../components/common/PageHeader';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
const ACTION_COLORS = {
  CREATE: '#4CAF50',
  UPDATE: '#2196F3',
  DELETE: '#F44336',
  ASSIGN: '#FF9800',
  REASSIGN: '#9C27B0',
  CLOSE: '#607D8B'
};

const BlockchainVisualization = ({ user }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [allTransactions, setAllTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBlockchainData();
    const interval = setInterval(fetchBlockchainData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchBlockchainData = async () => {
    try {
      const headers = { 'x-auth-token': localStorage.token };
      const baseUrl = config?.apiUrl || '';

      const [dashboardRes, transactionsRes] = await Promise.allSettled([
        axios.get(`${baseUrl}/api/blockchain/dashboard`, { headers }),
        axios.get(`${baseUrl}/api/blockchain/all-transactions`, { headers })
      ]);

      if (dashboardRes.status === 'fulfilled') {
        setDashboardData(dashboardRes.value.data);
      }
      if (transactionsRes.status === 'fulfilled') {
        setAllTransactions(transactionsRes.value.data.transactions || []);
      }
    } catch (err) {
      console.error('Error fetching blockchain data:', err);
      setError('Failed to fetch blockchain data. Make sure you have proper permissions.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!dashboardData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">No blockchain data available</Alert>
      </Box>
    );
  }

  const stats = dashboardData.stats || {};
  const hourlyData = Object.entries(dashboardData.hourlyDistribution || {}).map(([hour, count]) => ({
    hour: `${hour}:00`,
    transactions: count
  }));

  const roleData = dashboardData.transactionsByRole || [];
  const pieData = roleData.map((item, idx) => ({
    name: item._id || 'Unknown',
    value: item.count,
    color: COLORS[idx % COLORS.length]
  }));

  const getActionColor = (action) => ACTION_COLORS[action] || '#9E9E9E';

  return (
    <Box>
      <PageHeader
        title="Blockchain Ledger Visualization"
        subtitle="Monitor all case-related transactions recorded on the blockchain"
        icon={<BlockchainIcon />}
      />

      {/* Status Banner */}
      <Card sx={{ mb: 3, bgcolor: dashboardData.mode === 'FABRIC' ? '#E8F5E9' : '#FFF3E0' }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CheckCircleIcon sx={{ color: dashboardData.mode === 'FABRIC' ? '#4CAF50' : '#FF9800', fontSize: 32 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {dashboardData.mode === 'FABRIC' ? 'Hyperledger Fabric Network' : 'Database Ledger Mode'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {dashboardData.mode === 'FABRIC'
                  ? 'Connected to distributed blockchain network'
                  : 'Using centralized database as immutable ledger'}
              </Typography>
            </Box>
          </Box>
          <Chip
            label={dashboardData.mode}
            color={dashboardData.mode === 'FABRIC' ? 'success' : 'warning'}
            variant="outlined"
          />
        </CardContent>
      </Card>

      {/* Key Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Transactions"
            value={stats.totalTransactions || 0}
            icon={<LinkIcon fontSize="large" />}
            color="primary"
            subtext="Blockchain records"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Unique Cases"
            value={stats.uniqueRecords || 0}
            icon={<StorageIcon fontSize="large" />}
            color="info"
            subtext="On-chain records"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Transaction Types"
            value={Object.keys(stats.transactionsByType || {}).length}
            icon={<BlockchainIcon fontSize="large" />}
            color="success"
            subtext="Action categories"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="System Status"
            value="Active"
            icon={<CheckCircleIcon fontSize="large" />}
            color="success"
            subtext="All nodes operational"
          />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Hourly Distribution */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="24-Hour Transaction Distribution" />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="hour"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="transactions"
                    stroke="#8884D8"
                    strokeWidth={2}
                    dot={{ fill: '#8884D8', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Transactions by Role */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Transactions by User Role" />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884D8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Transaction Types Breakdown */}
      <Card sx={{ mb: 4 }}>
        <CardHeader title="Transaction Types Breakdown" />
        <CardContent>
          <Grid container spacing={2}>
            {Object.entries(stats.transactionsByType || {}).map(([action, count]) => (
              <Grid item xs={12} sm={6} md={4} key={action}>
                <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: getActionColor(action),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  >
                    {count}
                  </Box>
                  <Box>
                    <Typography variant="h6">{action}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {((count / stats.totalTransactions) * 100).toFixed(1)}% of total
                    </Typography>
                  </Box>
                  <Box sx={{ ml: 'auto', width: '60px' }}>
                    <LinearProgress
                      variant="determinate"
                      value={(count / stats.totalTransactions) * 100}
                      sx={{ bgcolor: '#e0e0e0' }}
                    />
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Recent Transactions Table */}
      <Card>
        <CardHeader title="Recent Blockchain Transactions" />
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Transaction ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Case ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Performed By</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Timestamp</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allTransactions.slice(0, 20).map((tx) => (
                <TableRow key={tx._id} hover sx={{ '&:hover': { bgcolor: '#fafafa' } }}>
                  <TableCell>
                    <code style={{ fontSize: '0.75rem' }}>
                      {tx.transactionId?.substr(0, 16)}...
                    </code>
                  </TableCell>
                  <TableCell>{tx.caseId || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip
                      label={tx.action}
                      size="small"
                      sx={{ bgcolor: getActionColor(tx.action), color: 'white' }}
                    />
                  </TableCell>
                  <TableCell>{tx.performedByName}</TableCell>
                  <TableCell>
                    <Chip
                      label={tx.performedByRole}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(tx.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {tx.verified ? (
                      <CheckCircleIcon sx={{ color: '#4CAF50', fontSize: 18 }} />
                    ) : (
                      <Chip label="Pending" size="small" variant="outlined" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <CardContent>
          <Typography variant="caption" color="textSecondary">
            Showing latest {Math.min(20, allTransactions.length)} of {allTransactions.length} total transactions
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default BlockchainVisualization;
