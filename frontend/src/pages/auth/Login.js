import React, { useState } from 'react';
import {
    TextField, Button, Box, Typography, Link as MuiLink,
    InputAdornment, Alert, CircularProgress, Divider, Chip, Paper
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import LoginIcon from '@mui/icons-material/Login';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import axios from 'axios';
import AuthLayout from '../../layouts/AuthLayout';
import config from '../../config';

const DEMO_ACCOUNTS = [
    {
        label: 'Admin',
        email: 'admin@vishwas.gov.in',
        password: 'Vishwas@123',
        icon: <AdminPanelSettingsIcon />,
        color: '#dc2626'
    },
    {
        label: 'Police',
        email: 'advait.trivedi@police.vishwas.gov.in',
        password: 'Vishwas@123',
        icon: <LocalPoliceIcon />,
        color: '#2563eb'
    },
    {
        label: 'Authority',
        email: 'shaurya.menon@authority.vishwas.gov.in',
        password: 'Vishwas@123',
        icon: <AccountBalanceIcon />,
        color: '#7c3aed'
    },
    {
        label: 'Citizen',
        email: 'harsh.yadav@gmail.com',
        password: 'Vishwas@123',
        icon: <PersonIcon />,
        color: '#059669'
    },
];

const Login = ({ setAuth }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { email, password } = formData;
    const navigate = useNavigate();

    const onChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const url = config?.apiUrl ? `${config.apiUrl}/api/users/login` : '/api/users/login';
            const response = await axios.post(url, formData, {
                headers: { 'Content-Type': 'application/json' }
            });

            const token = response.data.token;

            if (token) {
                localStorage.setItem('token', token);
                setAuth(true);
                navigate('/dashboard');
            } else {
                setError('Login failed: No token received');
            }
        } catch (err) {
            console.error('Login error:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = (account) => {
        setFormData({ email: account.email, password: account.password });
    };

    return (
        <AuthLayout
            title="Welcome Back"
            subtitle="Sign in to access your dashboard"
        >
            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {error}
                </Alert>
            )}

            <Box component="form" onSubmit={onSubmit} noValidate>
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={onChange}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <EmailIcon color="action" />
                            </InputAdornment>
                        ),
                    }}
                    disabled={loading}
                />
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={onChange}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <LockIcon color="action" />
                            </InputAdornment>
                        ),
                    }}
                    disabled={loading}
                />

                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1rem' }}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
                    disabled={loading}
                >
                    {loading ? 'Signing In...' : 'Sign In'}
                </Button>

                {/* Demo Accounts Section */}
                <Divider sx={{ my: 3 }}>
                    <Chip label="Quick Demo Login" size="small" variant="outlined" />
                </Divider>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                    {DEMO_ACCOUNTS.map((account) => (
                        <Paper
                            key={account.label}
                            variant="outlined"
                            onClick={() => handleDemoLogin(account)}
                            sx={{
                                p: 1.5,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                borderRadius: 2,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    borderColor: account.color,
                                    backgroundColor: `${account.color}08`,
                                    transform: 'translateY(-1px)',
                                    boxShadow: `0 2px 8px ${account.color}20`,
                                },
                            }}
                        >
                            <Box sx={{ color: account.color, display: 'flex', alignItems: 'center' }}>
                                {account.icon}
                            </Box>
                            <Box>
                                <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                                    {account.label}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                                    {account.email}
                                </Typography>
                            </Box>
                        </Paper>
                    ))}
                </Box>


            </Box>
        </AuthLayout>
    );
};

export default Login;
