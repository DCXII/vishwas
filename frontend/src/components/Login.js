import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import config from '../config';
import {
  Box, Container, TextField, Button, Paper, Alert, CircularProgress, Typography,
  InputAdornment, Card, Divider, Chip
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import '../styles/govt-theme.css';

const Login = ({ setAuth }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isBiometricVerified, setIsBiometricVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [biometricLoading, setBiometricLoading] = useState(false);
  const navigate = useNavigate();

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const onBiometricScan = async () => {
    setBiometricLoading(true);
    try {
      // Simulate biometric scan delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsBiometricVerified(true);
    } catch (err) {
      setError('Biometric verification failed. Please try again.');
    } finally {
      setBiometricLoading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!isBiometricVerified) {
      setError('Please complete biometric verification first.');
      setLoading(false);
      return;
    }

    if (!email || !password) {
      setError('Email and password are required.');
      setLoading(false);
      return;
    }

    const user = { email, password };

    try {
      const axiosConfig = {
        headers: { 'Content-Type': 'application/json' },
      };
      const body = JSON.stringify(user);
      const res = await axios.post(`${config.apiUrl}/api/users/login`, body, axiosConfig);
      localStorage.setItem('token', res.data.token);
      setAuth(true);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      console.error('Login error:', err);
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
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Button variant="text">Home</Button>
          </Link>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="sm" sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', py: 4 }}>
        <Card sx={{ p: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.15)', borderRadius: 3 }}>
          {/* Title */}
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
              <LockIcon sx={{ fontSize: 40, color: '#667eea' }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>Welcome Back</Typography>
            <Typography variant="body2" color="text.secondary">
              Secure portal access for authorized personnel
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={onSubmit}>
            {/* Email Field */}
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={email}
              onChange={onChange}
              placeholder="your.email@example.com"
              disabled={loading}
              sx={{ mb: 2.5 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: 'primary.main' }} />
                  </InputAdornment>
                ),
              }}
              variant="outlined"
              required
            />

            {/* Password Field */}
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={password}
              onChange={onChange}
              placeholder="••••••••"
              disabled={loading}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: 'primary.main' }} />
                  </InputAdornment>
                ),
              }}
              variant="outlined"
              required
            />

            {/* Biometric Section */}
            <Paper elevation={0} sx={{ p: 2.5, mb: 3, bgcolor: '#f5f7fa', borderRadius: 2, border: '2px solid', borderColor: isBiometricVerified ? '#4caf50' : '#e0e0e0' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FingerprintIcon sx={{ fontSize: 24, color: isBiometricVerified ? '#4caf50' : '#667eea' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Biometric Verification
                  </Typography>
                </Box>
                {isBiometricVerified && (
                  <Chip
                    icon={<VerifiedUserIcon />}
                    label="Verified"
                    color="success"
                    size="small"
                  />
                )}
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                Complete fingerprint or facial recognition verification
              </Typography>
              <Button
                fullWidth
                variant={isBiometricVerified ? 'outlined' : 'contained'}
                onClick={onBiometricScan}
                disabled={biometricLoading || loading}
                startIcon={biometricLoading ? <CircularProgress size={20} /> : <FingerprintIcon />}
                sx={{
                  textTransform: 'none',
                  borderColor: isBiometricVerified ? '#4caf50' : undefined,
                  color: isBiometricVerified ? '#4caf50' : undefined,
                }}
              >
                {biometricLoading ? 'Scanning...' : (isBiometricVerified ? 'Verified Successfully' : 'Start Biometric Scan')}
              </Button>
            </Paper>

            {/* Login Button */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={onSubmit}
              disabled={!isBiometricVerified || loading}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                py: 1.5,
                mb: 2,
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Login to Portal'}
            </Button>

            {/* Forgot Password Link */}
            <Box sx={{ textAlign: 'center' }}>
              <Link to="/" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" sx={{ color: '#667eea', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                  Forgot Password?
                </Typography>
              </Link>
            </Box>
          </form>

          {/* Divider */}
          <Divider sx={{ my: 3 }} />

          {/* Info Box */}
          <Paper elevation={0} sx={{ p: 2, bgcolor: '#f8f9ff', borderRadius: 2, border: '1px solid #e0e0e0' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>🔒 Security Notice</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.6 }}>
              • Keep your credentials confidential<br />
              • Use a secure device and network<br />
              • All actions are recorded on blockchain ledger<br />
              • Report suspicious activity immediately
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

export default Login;
