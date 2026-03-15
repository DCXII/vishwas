import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import config from '../config';
import {
  Box, Container, TextField, Button, Paper, Alert, CircularProgress, Typography,
  InputAdornment, Card, Select, MenuItem, FormControl, InputLabel, Grid
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import BadgeIcon from '@mui/icons-material/Badge';
import '../styles/govt-theme.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Citizen',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const { name, email, password, role } = formData;

  const roleDescriptions = {
    'Citizen': { icon: '👤', desc: 'View and download case files' },
    'Police': { icon: '🛡️', desc: 'Create and manage crime records' },
    'Authority': { icon: '🏛️', desc: 'Review cases and oversee operations' },
    'Admin': { icon: '⚙️', desc: 'Monitor system and manage users' },
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const validateForm = () => {
    if (!name.trim()) return 'Full name is required';
    if (!email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Valid email is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${config.apiUrl}/api/users/register`, formData, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        setSuccess('Registration successful! Redirecting...');
        setTimeout(() => navigate('/dashboard'), 1500);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', backdropFilter: 'blur(10px)' }}>
        <Container maxWidth="lg" sx={{ py: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ fontSize: 32 }}>⚖️</Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#667eea' }}>VISHWAS</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Crime Data Portal</Typography>
            </Box>
          </Box>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <Button variant="contained">Login</Button>
          </Link>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="sm" sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', py: 4 }}>
        <Card sx={{ p: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.15)', borderRadius: 3 }}>
          {/* Title */}
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
              <PersonIcon sx={{ fontSize: 40, color: '#667eea' }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>Create Account</Typography>
            <Typography variant="body2" color="text.secondary">
              Register to access the Crime Data Portal
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Success Alert */}
          {success && (
            <Alert severity="success" sx={{ mb: 2.5, borderRadius: 2 }}>
              {success}
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* Full Name */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={name}
                  onChange={handleChange}
                  placeholder="As per official documents"
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: 'primary.main' }} />
                      </InputAdornment>
                    ),
                  }}
                  required
                />
              </Grid>

              {/* Email */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: 'primary.main' }} />
                      </InputAdornment>
                    ),
                  }}
                  required
                />
              </Grid>

              {/* Password */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  disabled={loading}
                  hint="Password must be at least 6 characters"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: 'primary.main' }} />
                      </InputAdornment>
                    ),
                  }}
                  required
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  💡 Use a strong mix of letters, numbers, and symbols
                </Typography>
              </Grid>

              {/* Role Selection */}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Select Role</InputLabel>
                  <Select
                    name="role"
                    value={role}
                    onChange={handleChange}
                    label="Select Role"
                    disabled={loading}
                    startAdornment={
                      <InputAdornment position="start" sx={{ ml: 1 }}>
                        <BadgeIcon sx={{ color: 'primary.main' }} />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="Citizen">👤 Citizen</MenuItem>
                    <MenuItem value="Police">🛡️ Police Officer</MenuItem>
                    <MenuItem value="Authority">🏛️ Authority</MenuItem>
                    <MenuItem value="Admin">⚙️ Administrator</MenuItem>
                  </Select>
                </FormControl>

                {/* Role Description */}
                <Paper elevation={0} sx={{ p: 2, mt: 2, bgcolor: '#f5f7fa', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <Box sx={{ fontSize: 24 }}>{roleDescriptions[role].icon}</Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{role}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {roleDescriptions[role].desc}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            </Grid>

            {/* Submit Button */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={loading}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                py: 1.5,
                mt: 3,
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Create Account'}
            </Button>

            {/* Login Link */}
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link to="/login" style={{ color: '#667eea', fontWeight: 600, textDecoration: 'none' }}>
                  Login here
                </Link>
              </Typography>
            </Box>
          </form>

          {/* Terms Notice */}
          <Paper elevation={0} sx={{ p: 2, mt: 3, bgcolor: '#fff3cd', borderRadius: 2, border: '1px solid #ffc107' }}>
            <Typography variant="caption" color="text.secondary">
              By registering, you agree to our Terms of Service and Privacy Policy. All data is encrypted and stored securely on blockchain.
            </Typography>
          </Paper>
        </Card>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 4, color: 'white' }}>
          <Typography variant="body2">
            © 2026 VISHWAS - Government of India. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Register;
