import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Container, Typography, Button, Grid, Paper, AppBar, Toolbar, Divider
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import LoginIcon from '@mui/icons-material/Login';
import HomeIcon from '@mui/icons-material/Home';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LockIcon from '@mui/icons-material/Lock';
import SpeedIcon from '@mui/icons-material/Speed';
import PersonIcon from '@mui/icons-material/Person';
import GavelIcon from '@mui/icons-material/Gavel';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const highlights = [
  { icon: <VisibilityIcon />, title: 'Transparency', desc: 'Every action -- case creation, edit, status change -- is permanently logged on an immutable blockchain ledger. There is no way to tamper with or delete the audit trail.', borderColor: '#1a365d' },
  { icon: <LockIcon />, title: 'Security', desc: 'Role-based access control with secure authentication ensures only authorized personnel can create or modify records. JWT-based authentication protects every API endpoint.', borderColor: '#059669' },
  { icon: <SpeedIcon />, title: 'Convenience', desc: 'A single web interface handles filing, tracking, editing, and retrieving case files. Citizens can access their own records and download them at any time.', borderColor: '#d4af37' },
];

const roles = [
  { icon: <PersonIcon sx={{ fontSize: 44 }} />, title: 'Citizen', desc: 'View and download personal case files. Track case status and history. Full transparency into your own records.', color: '#059669' },
  { icon: <GavelIcon sx={{ fontSize: 44 }} />, title: 'Police', desc: 'Create and manage crime case records. File cases with full details including victim info, evidence, location, and classification.', color: '#2563eb' },
  { icon: <AdminPanelSettingsIcon sx={{ fontSize: 44 }} />, title: 'Admin', desc: 'System-wide oversight. Monitor blockchain health, view transaction audit trails, review statistics, and edit cases for quality assurance.', color: '#dc2626' },
];

const techStack = [
  { label: 'Frontend', value: 'React 19 + Material UI' },
  { label: 'Backend', value: 'Node.js + Express 5' },
  { label: 'Database', value: 'MongoDB + Mongoose' },
  { label: 'Blockchain', value: 'Hyperledger Fabric' },
];

const About = () => {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Bar */}
      <AppBar position="static" sx={{ background: 'linear-gradient(135deg, #1a365d 0%, #2d4a7a 100%)' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <SecurityIcon sx={{ fontSize: 32, color: '#d4af37' }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 1, lineHeight: 1.2 }}>VISHWAS</Typography>
              <Typography variant="caption" sx={{ opacity: 0.8, display: { xs: 'none', sm: 'block' } }}>Crime Data Portal</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button color="inherit" component={Link} to="/" startIcon={<HomeIcon />}>Home</Button>
            <Button variant="outlined" color="inherit" component={Link} to="/login" startIcon={<LoginIcon />}
              sx={{ borderColor: '#d4af37', color: '#d4af37', '&:hover': { borderColor: '#f0d060', backgroundColor: 'rgba(212,175,55,0.1)' } }}
            >Login</Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Header Banner */}
      <Box sx={{ background: 'linear-gradient(135deg, #1a365d, #2d4a7a)', color: 'white', py: 6, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>About VISHWAS</Typography>
          <Typography variant="h6" sx={{ opacity: 0.85, fontWeight: 400 }}>
            VISHWAS (Verifiable Information System with Hyperledger and Secure Authentication) is a blockchain-powered crime data management platform built to bring transparency, security, and efficiency to India's criminal justice ecosystem.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6, flex: 1 }}>
        {/* Why VISHWAS */}
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a365d', mb: 4 }}>Why VISHWAS?</Typography>
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {highlights.map((h) => (
            <Grid item xs={12} md={4} key={h.title}>
              <Paper elevation={0} sx={{
                p: 3, height: '100%', borderRadius: 3, borderLeft: `4px solid ${h.borderColor}`,
                border: '1px solid', borderColor: 'divider',
                borderLeftColor: h.borderColor,
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, color: h.borderColor }}>
                  {h.icon}
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>{h.title}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">{h.desc}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* User Roles */}
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a365d', mb: 4 }}>User Roles</Typography>
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {roles.map((r) => (
            <Grid item xs={12} md={4} key={r.title}>
              <Paper elevation={0} sx={{
                p: 3, height: '100%', borderRadius: 3, textAlign: 'center',
                border: '1px solid', borderColor: 'divider',
                transition: 'all 0.3s', '&:hover': { borderColor: r.color, boxShadow: `0 4px 20px ${r.color}15` }
              }}>
                <Box sx={{ color: r.color, mb: 2 }}>{r.icon}</Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>{r.title}</Typography>
                <Typography variant="body2" color="text.secondary">{r.desc}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Tech Stack */}
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a365d', mb: 4 }}>Technology Stack</Typography>
        <Grid container spacing={2}>
          {techStack.map((t) => (
            <Grid item xs={6} sm={3} key={t.label}>
              <Paper elevation={0} sx={{ p: 2.5, textAlign: 'center', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1a365d' }}>{t.label}</Typography>
                <Typography variant="body2" color="text.secondary">{t.value}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Footer */}
      <Box sx={{ backgroundColor: '#1a365d', color: 'white', py: 4 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Contact Us</Typography>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>Email: support@vishwas.gov.in</Typography>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>Phone: 1800-XXX-XXXX</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Important Links</Typography>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>Terms of Service | Privacy Policy | Help & Support</Typography>
            </Grid>
          </Grid>
          <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.15)' }} />
          <Typography variant="body2" align="center" sx={{ opacity: 0.6 }}>
            2026 VISHWAS Crime Data Portal - Government of India. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default About;