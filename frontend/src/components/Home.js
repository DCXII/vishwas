import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Container, Typography, Button, Grid, AppBar, Toolbar, Divider,
  Card, CardContent, Stack, Chip, keyframes
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import GavelIcon from '@mui/icons-material/Gavel';
import PersonIcon from '@mui/icons-material/Person';
import LinkIcon from '@mui/icons-material/Link';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LoginIcon from '@mui/icons-material/Login';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import PublicIcon from '@mui/icons-material/Public';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import HierarchyIcon from '@mui/icons-material/Difference';
import ShieldIcon from '@mui/icons-material/Shield';
import TimelineIcon from '@mui/icons-material/Timeline';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.4); }
  70% { box-shadow: 0 0 0 15px rgba(212, 175, 55, 0); }
  100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0); }
`;

const floatingAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const keyFeatures = [
  {
    icon: <HierarchyIcon sx={{ fontSize: 48 }} />,
    title: 'Hierarchical RBAC',
    desc: 'Multi-level approval framework with jurisdiction-based access control from citizen to state level.',
  },
  {
    icon: <ShieldIcon sx={{ fontSize: 48 }} />,
    title: 'Multi-Layer Auth',
    desc: 'Secure approval workflows requiring authorization from multiple authorities for sensitive operations.',
  },
  {
    icon: <GavelIcon sx={{ fontSize: 48 }} />,
    title: 'Case Management',
    desc: 'Comprehensive crime case filing, tracking, and investigation tools for law enforcement.',
  },
  {
    icon: <PersonIcon sx={{ fontSize: 48 }} />,
    title: 'Criminal Records',
    desc: 'Searchable criminal database with person enquiry and background verification capabilities.',
  },
  {
    icon: <LinkIcon sx={{ fontSize: 48 }} />,
    title: 'Blockchain Audits',
    desc: 'Immutable transaction ledger ensuring absolute transparency and accountability of all operations.',
  },
  {
    icon: <VerifiedUserIcon sx={{ fontSize: 48 }} />,
    title: 'Face Recognition',
    desc: 'Advanced facial AI system for suspect matching, live camera detection, and real-time authentication.',
  },
];

const hierarchyLevels = [
  {
    level: 'Citizen',
    description: 'File complaints, track cases, search criminal records securely.',
    icon: <PersonIcon sx={{ fontSize: 32 }} />,
  },
  {
    level: 'Police Station',
    description: 'Manage jurisdiction, approve complaints, file criminal cases.',
    icon: <GavelIcon sx={{ fontSize: 32 }} />,
  },
  {
    level: 'District Court',
    description: 'Oversee multiple stations, process appeals and major crimes.',
    icon: <AdminPanelSettingsIcon sx={{ fontSize: 32 }} />,
  },
  {
    level: 'State/High Court',
    description: 'Judicial oversight, policy enforcement, supreme authority.',
    icon: <PublicIcon sx={{ fontSize: 32 }} />,
  },
];

const useCases = [
  {
    title: 'Authority Complaint',
    description: 'Complaint against a commanding officer. Requires Station, District, and State level approvals.',
    steps: 3,
    requirement: 'Maximum Security'
  },
  {
    title: 'Standard FIR',
    description: 'Filing a standard crime record. Requires Station Incharge approval.',
    steps: 1,
    requirement: 'High Security'
  },
  {
    title: 'Person Enquiry',
    description: 'Deep background check on suspects across all connected jurisdictions.',
    steps: 1,
    requirement: 'Confidential'
  },
  {
    title: 'Live Camera Scan',
    description: 'Real-time AI detection mapping live feeds against our criminal database.',
    steps: 1,
    requirement: 'Real-Time'
  },
];

const glassBoxStyle = {
  background: 'rgba(15, 23, 42, 0.65)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
  borderRadius: 4,
};

const goldGradientText = {
  background: 'linear-gradient(135deg, #d4af37 0%, #ffdf73 50%, #d4af37 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

const Home = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#0a0f1c', // Very dark navy
      color: '#e2e8f0',
      overflowX: 'hidden'
    }}>
      {/* Dynamic Background Elements */}
      <Box sx={{
        position: 'fixed',
        top: '-20%',
        left: '-10%',
        width: '60vw',
        height: '60vw',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(212,175,55,0.03) 0%, rgba(10,15,28,0) 70%)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />
      <Box sx={{
        position: 'fixed',
        bottom: '-20%',
        right: '-10%',
        width: '70vw',
        height: '70vw',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(30,58,138,0.05) 0%, rgba(10,15,28,0) 70%)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      {/* Navigation */}
      <AppBar
        position="fixed"
        elevation={scrolled ? 4 : 0}
        sx={{
          background: scrolled ? 'rgba(10, 15, 28, 0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : '1px solid transparent',
          transition: 'all 0.3s ease-in-out',
          zIndex: 1100
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: 'space-between', py: 1.5, px: { xs: 0, sm: 2 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                border: '1px solid rgba(212,175,55,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
              }}>
                <SecurityIcon sx={{ fontSize: 26, color: '#d4af37' }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: 2, ...goldGradientText }}>
                  VISHWAS
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8', letterSpacing: 1, fontWeight: 600 }}>
                  SECURE PORTAL
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button
                component={Link}
                to="/about"
                sx={{
                  color: '#cbd5e1',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  display: { xs: 'none', sm: 'block' },
                  '&:hover': { color: '#ffffff', backgroundColor: 'transparent' }
                }}
              >
                Architecture
              </Button>
              <Button
                variant="outlined"
                component={Link}
                to="/login"
                startIcon={<LoginIcon />}
                sx={{
                  color: '#d4af37',
                  borderColor: 'rgba(212,175,55,0.5)',
                  fontWeight: 600,
                  textTransform: 'none',
                  px: 3,
                  py: 1,
                  borderRadius: '8px',
                  '&:hover': {
                    borderColor: '#d4af37',
                    backgroundColor: 'rgba(212,175,55,0.08)',
                  }
                }}
              >
                Sign In
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Hero Section */}
      <Box sx={{
        position: 'relative',
        zIndex: 1,
        pt: { xs: 20, md: 28 },
        pb: { xs: 12, md: 16 },
        px: 2
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={7} sx={{ animation: `${fadeIn} 0.8s ease-out forwards` }}>
              <Chip
                label="GOVERNMENT INITIATIVE 2026"
                sx={{
                  backgroundColor: 'rgba(212,175,55,0.1)',
                  color: '#d4af37',
                  border: '1px solid rgba(212,175,55,0.3)',
                  fontWeight: 700,
                  letterSpacing: 1,
                  mb: 3,
                  px: 1
                }}
              />
              <Typography variant="h1" sx={{
                fontWeight: 900,
                fontSize: { xs: '3rem', sm: '4rem', md: '4.5rem' },
                lineHeight: 1.1,
                mb: 3,
                color: '#ffffff',
                textShadow: '0 4px 20px rgba(0,0,0,0.5)'
              }}>
                Justice <span style={{ ...goldGradientText }}>Secured.</span><br />
                Truth <span style={{ ...goldGradientText }}>Verified.</span>
              </Typography>
              <Typography variant="h6" sx={{
                color: '#94a3b8',
                fontWeight: 400,
                mb: 5,
                maxWidth: '600px',
                lineHeight: 1.6,
                fontSize: '1.15rem'
              }}>
                A state-of-the-art criminal management portal integrating hierarchical Role-Based Access Control, multi-layer approvals, advanced face recognition, and immutable blockchain auditing.
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                <Button
                  variant="contained"
                  component={Link}
                  to="/login"
                  sx={{
                    background: 'linear-gradient(135deg, #d4af37 0%, #aa8529 100%)',
                    color: '#0a0f1c',
                    fontWeight: 800,
                    px: 5,
                    py: 2,
                    fontSize: '1.1rem',
                    textTransform: 'none',
                    borderRadius: '8px',
                    animation: `${pulse} 2s infinite`,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #ffdf73 0%, #d4af37 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(212,175,55,0.4)'
                    }
                  }}
                >
                  Access Secure Portal <ArrowForwardIosIcon sx={{ ml: 1, fontSize: '1rem' }} />
                </Button>
                <Button
                  variant="outlined"
                  component={Link}
                  to="/register"
                  sx={{
                    color: '#ffffff',
                    borderColor: 'rgba(255,255,255,0.2)',
                    fontWeight: 600,
                    px: 5,
                    py: 2,
                    fontSize: '1.1rem',
                    textTransform: 'none',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    '&:hover': {
                      borderColor: '#ffffff',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    }
                  }}
                >
                  Citizen Registration
                </Button>
              </Stack>
            </Grid>

            <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' }, animation: `${floatingAnimation} 6s ease-in-out infinite` }}>
              <Box sx={{ ...glassBoxStyle, p: 4, position: 'relative' }}>
                <Box sx={{
                  position: 'absolute',
                  top: -20, left: -20,
                  width: 100, height: 100,
                  background: 'radial-gradient(circle, rgba(212,175,55,0.2) 0%, rgba(0,0,0,0) 70%)',
                  filter: 'blur(10px)'
                }} />

                <Typography variant="overline" sx={{ color: '#94a3b8', letterSpacing: 2, display: 'block', mb: 2 }}>System Status</Typography>

                <Stack spacing={3}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: '#cbd5e1' }}>Blockchain Network</Typography>
                      <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 600 }}>Active - 100%</Typography>
                    </Box>
                    <Box sx={{ width: '100%', height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3 }}>
                      <Box sx={{ width: '100%', height: '100%', backgroundColor: '#10b981', borderRadius: 3, boxShadow: '0 0 10px #10b981' }} />
                    </Box>
                  </Box>

                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: '#cbd5e1' }}>Face AI Engine</Typography>
                      <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 600 }}>Online</Typography>
                    </Box>
                    <Box sx={{ width: '100%', height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3 }}>
                      <Box sx={{ width: '100%', height: '100%', backgroundColor: '#10b981', borderRadius: 3, boxShadow: '0 0 10px #10b981' }} />
                    </Box>
                  </Box>

                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <ShieldIcon sx={{ color: '#d4af37', fontSize: 32 }} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: '#ffffff' }}>End-to-End Encrypted</Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>Military-grade security protocols</Typography>
                    </Box>
                  </Box>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Hierarchy Section */}
      <Box sx={{ position: 'relative', zIndex: 1, py: 12, backgroundColor: 'rgba(15, 23, 42, 0.4)' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h3" sx={{ fontWeight: 800, color: '#ffffff', mb: 3 }}>
              Strict <span style={{ color: '#d4af37' }}>Hierarchical</span> Jurisdiction
            </Typography>
            <Typography variant="h6" sx={{ color: '#94a3b8', maxWidth: 700, mx: 'auto', fontWeight: 400 }}>
              The platform implements a rigid chain of command. Complaints and actions escalate through multiple approval layers depending on sensitivity.
            </Typography>
          </Box>

          <Grid container spacing={3} justifyContent="center" alignItems="stretch">
            {hierarchyLevels.map((h, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <Box sx={{
                  ...glassBoxStyle,
                  height: '100%',
                  p: 4,
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-10px)',
                    borderColor: 'rgba(212,175,55,0.3)',
                    boxShadow: '0 15px 35px rgba(0,0,0,0.5), inset 0 0 20px rgba(212,175,55,0.05)'
                  }
                }}>
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '4px',
                    background: `linear-gradient(90deg, transparent, ${idx === 3 ? '#d4af37' : 'rgba(255,255,255,0.2)'}, transparent)`
                  }} />
                  <Box sx={{
                    color: '#d4af37',
                    mb: 3,
                    display: 'flex',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(212,175,55,0.1)',
                    width: 70, height: 70, borderRadius: '50%', mx: 'auto', alignItems: 'center'
                  }}>
                    {h.icon}
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#ffffff', mb: 2 }}>
                    {h.level}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#94a3b8', lineHeight: 1.6 }}>
                    {h.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Premium Features Grid */}
      <Box sx={{ position: 'relative', zIndex: 1, py: 12 }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 3 }}>
            <Box>
              <Typography variant="overline" sx={{ color: '#d4af37', letterSpacing: 2, display: 'block', mb: 1 }}>
                CORE CAPABILITIES
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#ffffff' }}>
                Engineered for <br />Law Enforcement
              </Typography>
            </Box>
            <Button
              endIcon={<ArrowRightIcon />}
              sx={{ color: '#d4af37', '&:hover': { background: 'rgba(212,175,55,0.1)' } }}
            >
              View Documentation
            </Button>
          </Box>

          <Grid container spacing={4}>
            {keyFeatures.map((f, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Box sx={{
                  ...glassBoxStyle,
                  p: 4,
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(30, 41, 59, 0.7)',
                    borderColor: 'rgba(255,255,255,0.15)',
                  }
                }}>
                  <Box sx={{ color: '#d4af37', mb: 3 }}>
                    {f.icon}
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#ffffff', mb: 2 }}>
                    {f.title}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#64748b', lineHeight: 1.7 }}>
                    {f.desc}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Advanced Workflows */}
      <Box sx={{ position: 'relative', zIndex: 1, py: 12, backgroundColor: 'rgba(15, 23, 42, 0.4)' }}>
        <Container maxWidth="lg">
          <Typography variant="h3" align="center" sx={{ fontWeight: 800, color: '#ffffff', mb: 8 }}>
            Complex <span style={{ color: '#d4af37' }}>Workflows</span> Simplified
          </Typography>

          <Grid container spacing={4}>
            {useCases.map((uc, idx) => (
              <Grid item xs={12} md={6} key={idx}>
                <Box sx={{
                  ...glassBoxStyle,
                  p: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <Box sx={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', backgroundColor: '#d4af37' }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#ffffff' }}>
                      {uc.title}
                    </Typography>
                    <Chip
                      label={uc.requirement}
                      sx={{
                        backgroundColor: 'rgba(212,175,55,0.1)',
                        color: '#d4af37',
                        border: '1px solid rgba(212,175,55,0.3)',
                        fontWeight: 600,
                        fontSize: '0.75rem'
                      }}
                    />
                  </Box>

                  <Typography variant="body1" sx={{ color: '#94a3b8', lineHeight: 1.6 }}>
                    {uc.description}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 'auto' }}>
                    <Typography variant="caption" sx={{ color: '#64748b', mr: 1, fontWeight: 600 }}>APPROVAL CHAIN:</Typography>
                    {[...Array(uc.steps)].map((_, i) => (
                      <React.Fragment key={i}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#d4af37', boxShadow: '0 0 8px rgba(212,175,55,0.5)' }} />
                        {i < uc.steps - 1 && <Box sx={{ width: 20, height: 2, backgroundColor: 'rgba(212,175,55,0.3)' }} />}
                      </React.Fragment>
                    ))}
                    {uc.steps === 1 && <Typography variant="caption" sx={{ color: '#d4af37', ml: 1, fontStyle: 'italic' }}>Direct Access</Typography>}
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ position: 'relative', zIndex: 1, py: 14 }}>
        <Container maxWidth="md">
          <Box sx={{
            ...glassBoxStyle,
            p: { xs: 4, md: 8 },
            textAlign: 'center',
            borderColor: 'rgba(212,175,55,0.2)',
            background: 'linear-gradient(180deg, rgba(15,23,42,0.8) 0%, rgba(10,15,28,0.95) 100%)',
          }}>
            <SecurityIcon sx={{ fontSize: 60, color: '#d4af37', mb: 3 }} />
            <Typography variant="h3" sx={{ fontWeight: 800, color: '#ffffff', mb: 3 }}>
              Enter the Network
            </Typography>
            <Typography variant="h6" sx={{ color: '#94a3b8', mb: 6, fontWeight: 400, maxWidth: '80%', mx: 'auto' }}>
              Authentication is strictly monitored. Ensure your credentials and face signature are valid before proceeding.
            </Typography>
            <Button
              variant="contained"
              size="large"
              component={Link}
              to="/login"
              sx={{
                background: 'linear-gradient(135deg, #d4af37 0%, #aa8529 100%)',
                color: '#0a0f1c',
                fontWeight: 800,
                px: 6,
                py: 2.5,
                fontSize: '1.2rem',
                textTransform: 'none',
                borderRadius: '8px',
                '&:hover': {
                  background: 'linear-gradient(135deg, #ffdf73 0%, #d4af37 100%)',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 10px 30px rgba(212,175,55,0.3)'
                }
              }}
            >
              Initialize Secure Login
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{
        backgroundColor: '#050810',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        py: 6,
        mt: 'auto',
        position: 'relative',
        zIndex: 1
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <SecurityIcon sx={{ fontSize: 24, color: '#d4af37' }} />
                <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 1, ...goldGradientText }}>
                  VISHWAS
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#64748b', pr: 4 }}>
                A highly secure, hierarchical criminal justice portal backed by blockchain immutability and AI verification.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 3, color: '#ffffff', letterSpacing: 1 }}>SYSTEM PROTOCOLS</Typography>
              <Stack spacing={1.5}>
                <Typography variant="body2" sx={{ color: '#64748b', '&:hover': { color: '#d4af37', cursor: 'pointer' } }}>Security Clearance Levels</Typography>
                <Typography variant="body2" sx={{ color: '#64748b', '&:hover': { color: '#d4af37', cursor: 'pointer' } }}>Blockchain Audit Trail</Typography>
                <Typography variant="body2" sx={{ color: '#64748b', '&:hover': { color: '#d4af37', cursor: 'pointer' } }}>Facial Recognition API</Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 3, color: '#ffffff', letterSpacing: 1 }}>JURISDICTION SUPPORT</Typography>
              <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>Dispatch: <strong>1-800-VISHWAS-SECURE</strong></Typography>
              <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>Node: <strong>HQ-SERVER-09X</strong></Typography>
              <Chip label="System Online" size="small" sx={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }} />
            </Grid>
          </Grid>
          <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.05)' }} />
          <Typography variant="caption" align="center" sx={{ display: 'block', color: '#475569', letterSpacing: 1 }}>
            &copy; 2026 VISHWAS SECURE NETWORK. ALL ENQUIRIES MONITORED.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;