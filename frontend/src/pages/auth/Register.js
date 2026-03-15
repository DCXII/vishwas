import React, { useState } from 'react';
import {
    TextField, Button, Box, Typography, Link as MuiLink,
    InputAdornment, Alert, CircularProgress,
    MenuItem, Select, FormControl, InputLabel, FormHelperText
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import BadgeIcon from '@mui/icons-material/Badge';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import axios from 'axios';
import AuthLayout from '../../layouts/AuthLayout';
import config from '../../config';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Citizen',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { name, email, password, role } = formData;
    const navigate = useNavigate();

    const onChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const url = config?.apiUrl ? `${config.apiUrl}/api/users/register` : '/api/users/register';
            const response = await axios.post(url, formData, {
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                console.log('Registration successful');
                navigate('/dashboard');
            }
        } catch (error) {
            console.error('Registration error:', error.response?.data || error.message);
            setError(error.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getRoleIcon = (roleName) => {
        switch (roleName) {
            case 'Police': return <LocalPoliceIcon color="primary" sx={{ mr: 1 }} />;
            case 'Authority': return <AccountBalanceIcon color="primary" sx={{ mr: 1 }} />;
            case 'Admin': return <AdminPanelSettingsIcon color="primary" sx={{ mr: 1 }} />;
            default: return <PersonIcon color="primary" sx={{ mr: 1 }} />;
        }
    };

    const getRoleDescription = (roleName) => {
        switch (roleName) {
            case 'Police': return 'Manage crime records and investigations.';
            case 'Authority': return 'Oversee operations and review cases.';
            case 'Admin': return 'System administration and audit logs.';
            default: return 'View and download your own case files.';
        }
    };

    return (
        <AuthLayout
            title="Create Account"
            subtitle="Join the VISHWAS Secure Portal"
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
                    id="name"
                    label="Full Name"
                    name="name"
                    autoComplete="name"
                    autoFocus
                    value={name}
                    onChange={onChange}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <BadgeIcon color="action" />
                            </InputAdornment>
                        ),
                    }}
                    disabled={loading}
                />

                <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
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
                    autoComplete="new-password"
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

                <FormControl fullWidth margin="normal">
                    <InputLabel id="role-select-label">Account Type</InputLabel>
                    <Select
                        labelId="role-select-label"
                        id="role"
                        name="role"
                        value={role}
                        label="Account Type"
                        onChange={onChange}
                        disabled={loading}
                        startAdornment={
                            <InputAdornment position="start">
                                {getRoleIcon(role)}
                            </InputAdornment>
                        }
                    >
                        <MenuItem value="Citizen">Citizen</MenuItem>
                        <MenuItem value="Police">Police Officer</MenuItem>
                        <MenuItem value="Authority">Authority</MenuItem>
                        <MenuItem value="Admin">System Administrator</MenuItem>
                    </Select>
                    <FormHelperText sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                        {getRoleDescription(role)}
                    </FormHelperText>
                </FormControl>

                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    sx={{ mt: 4, mb: 3, py: 1.5, fontSize: '1rem' }}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PersonAddIcon />}
                    disabled={loading}
                >
                    {loading ? 'Creating Account...' : 'Register Now'}
                </Button>

                <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        Already have an account?{' '}
                        <MuiLink component={Link} to="/login" variant="subtitle2" sx={{ fontWeight: 600, textDecoration: 'none' }}>
                            Login here
                        </MuiLink>
                    </Typography>
                </Box>
            </Box>
        </AuthLayout>
    );
};

export default Register;
