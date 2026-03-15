import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../config';
import {
    Box, Container, Typography, TextField, Button, Grid, Paper, Card, CardContent, CardHeader,
    Alert, CircularProgress, Chip, MenuItem, Divider, Avatar, Tabs, Tab, InputAdornment, Dialog,
    DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import HomeIcon from '@mui/icons-material/Home';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BadgeIcon from '@mui/icons-material/Badge';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import VerifiedIcon from '@mui/icons-material/Verified';
import WomanIcon from '@mui/icons-material/Woman';
import ManIcon from '@mui/icons-material/Man';
import MainLayout from '../layouts/MainLayout';

const Profile = ({ setAuth }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', address: '', dateOfBirth: '', gender: '', idProof: ''
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get(`${config.apiUrl}/api/users/me`, {
                    headers: { 'Content-Type': 'application/json', 'x-auth-token': localStorage.token }
                });
                const userData = res.data;
                const dateOfBirth = userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : '';
                setUser(userData);
                setFormData({
                    name: userData.name || '', email: userData.email || '', phone: userData.phone || '',
                    address: userData.address || '', dateOfBirth, gender: userData.gender || '', idProof: userData.idProof || ''
                });
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Error fetching user data.');
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); 
        setSuccess('');
        try {
            const updatedData = { ...formData, dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null };
            const res = await axios.put(`${config.apiUrl}/api/users/update`, updatedData, {
                headers: { 'Content-Type': 'application/json', 'x-auth-token': localStorage.token }
            });
            if (res.data) {
                setUser(res.data);
                setSuccess('✓ Profile updated successfully');
                setEditMode(false);
                setTabValue(0);
                const dateOfBirth = res.data.dateOfBirth ? new Date(res.data.dateOfBirth).toISOString().split('T')[0] : '';
                setFormData({
                    name: res.data.name || '', email: res.data.email || '', phone: res.data.phone || '',
                    address: res.data.address || '', dateOfBirth, gender: res.data.gender || '', idProof: res.data.idProof || ''
                });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error updating profile.');
        }
    };

    if (loading) {
        return (
            <MainLayout user={user} setAuth={setAuth}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                    <CircularProgress />
                </Box>
            </MainLayout>
        );
    }

    const getGenderIcon = () => {
        if (user?.gender === 'female') return <WomanIcon sx={{ fontSize: 40 }} />;
        if (user?.gender === 'male') return <ManIcon sx={{ fontSize: 40 }} />;
        return <PersonIcon sx={{ fontSize: 40 }} />;
    };

    const InfoField = ({ icon, label, value }) => (
        <Grid item xs={12} sm={6}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f7fa', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Box sx={{ color: '#667eea', mt: 0.3 }}>{icon}</Box>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
                            {label}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                            {value || 'Not provided'}
                        </Typography>
                    </Box>
                </Box>
            </Paper>
        </Grid>
    );

    return (
        <MainLayout user={user} setAuth={setAuth}>
            <Box sx={{ maxWidth: 900, mx: 'auto', pb: 4 }}>
                {/* Header Card */}
                <Card sx={{ 
                    borderRadius: 3, 
                    mb: 3, 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    overflow: 'visible'
                }}>
                    <CardContent sx={{ p: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Avatar
                            sx={{
                                width: 80,
                                height: 80,
                                bgcolor: 'rgba(255,255,255,0.2)',
                                fontSize: '2rem',
                                marginTop: -2,
                                boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                            }}
                        >
                            {getGenderIcon()}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                                {user?.name}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                                <Chip
                                    label={user?.role}
                                    size="small"
                                    sx={{
                                        backgroundColor: user?.role === 'Admin' ? '#ff6b6b' : user?.role === 'Police' ? '#4ecdc4' : user?.role === 'Authority' ? '#ffe66d' : '#95e1d3',
                                        color: user?.role === 'Admin' ? 'white' : 'black',
                                        fontWeight: 600
                                    }}
                                />
                                <Chip 
                                    icon={<VerifiedIcon sx={{ color: '#4ade80 !important' }} />} 
                                    label="Verified" 
                                    size="small" 
                                    sx={{
                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                        color: 'white',
                                        border: '1px solid rgba(255,255,255,0.3)'
                                    }}
                                />
                            </Box>
                        </Box>
                        {!editMode && (
                            <Button 
                                variant="contained"
                                startIcon={<EditIcon />}
                                onClick={() => { setEditMode(true); setTabValue(1); }}
                                sx={{ 
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                    color: 'white',
                                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' }
                                }}
                            >
                                Edit Profile
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

                {editMode ? (
                    /* Edit Dialog */
                    <Dialog 
                        open={editMode} 
                        onClose={() => setEditMode(false)}
                        maxWidth="sm"
                        fullWidth
                    >
                        <DialogTitle sx={{ fontWeight: 600, bgcolor: '#667eea', color: 'white' }}>
                            Edit Your Profile
                        </DialogTitle>
                        <DialogContent sx={{ pt: 3 }}>
                            <Grid container spacing={2.5}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Full Name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><PersonIcon color="action" /></InputAdornment>
                                        }}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Email Address"
                                        name="email"
                                        value={formData.email}
                                        disabled
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><EmailIcon color="action" /></InputAdornment>
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Phone Number"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><PhoneIcon color="action" /></InputAdornment>
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Date of Birth"
                                        name="dateOfBirth"
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={handleInputChange}
                                        InputLabelProps={{ shrink: true }}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><CalendarTodayIcon color="action" /></InputAdornment>
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        select
                                        label="Gender"
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                    >
                                        <MenuItem value="">Select Gender</MenuItem>
                                        <MenuItem value="male">Male</MenuItem>
                                        <MenuItem value="female">Female</MenuItem>
                                        <MenuItem value="other">Other</MenuItem>
                                    </TextField>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="ID Proof Number"
                                        name="idProof"
                                        value={formData.idProof}
                                        onChange={handleInputChange}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><BadgeIcon color="action" /></InputAdornment>
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        multiline
                                        rows={3}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><HomeIcon color="action" /></InputAdornment>
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions sx={{ p: 2, gap: 1 }}>
                            <Button 
                                onClick={() => setEditMode(false)}
                                startIcon={<CancelIcon />}
                            >
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleSubmit}
                                variant="contained"
                                startIcon={<SaveIcon />}
                            >
                                Save Changes
                            </Button>
                        </DialogActions>
                    </Dialog>
                ) : (
                    /* View Profile */
                    <>
                        {/* Personal Information */}
                        <Card sx={{ borderRadius: 3, mb: 3 }}>
                            <CardHeader
                                title="Personal Information"
                                titleTypographyProps={{ variant: 'subtitle1', sx: { fontWeight: 600 } }}
                                avatar={<PersonIcon sx={{ color: '#667eea' }} />}
                            />
                            <Divider />
                            <CardContent>
                                <Grid container spacing={2}>
                                    <InfoField icon={<PersonIcon />} label="Full Name" value={user?.name} />
                                    <InfoField icon={<EmailIcon />} label="Email Address" value={user?.email} />
                                    <InfoField icon={<PhoneIcon />} label="Phone Number" value={user?.phone} />
                                    <InfoField 
                                        icon={<CalendarTodayIcon />} 
                                        label="Date of Birth" 
                                        value={user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : null} 
                                    />
                                    <InfoField 
                                        icon={user?.gender === 'female' ? <WomanIcon /> : <ManIcon />} 
                                        label="Gender" 
                                        value={user?.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : null} 
                                    />
                                    {user?.citizenId && (
                                        <InfoField icon={<BadgeIcon />} label="Citizen ID" value={user.citizenId} />
                                    )}
                                </Grid>
                            </CardContent>
                        </Card>

                        {/* Contact Details */}
                        <Card sx={{ borderRadius: 3, mb: 3 }}>
                            <CardHeader
                                title="Contact Details"
                                titleTypographyProps={{ variant: 'subtitle1', sx: { fontWeight: 600 } }}
                                avatar={<HomeIcon sx={{ color: '#667eea' }} />}
                            />
                            <Divider />
                            <CardContent>
                                <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f7fa', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                                        <Box sx={{ color: '#667eea', mt: 0.3 }}>
                                            <HomeIcon />
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
                                                Address
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                                                {user?.address || 'Not provided'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            </CardContent>
                        </Card>

                        {/* Identity Verification */}
                        <Card sx={{ borderRadius: 3 }}>
                            <CardHeader
                                title="Identity Verification"
                                titleTypographyProps={{ variant: 'subtitle1', sx: { fontWeight: 600 } }}
                                avatar={<BadgeIcon sx={{ color: '#667eea' }} />}
                            />
                            <Divider />
                            <CardContent>
                                <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f7fa', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                                        <Box sx={{ color: '#667eea', mt: 0.3 }}>
                                            <BadgeIcon />
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
                                                ID Proof Number
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                                                {user?.idProof || 'Not provided'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            </CardContent>
                        </Card>
                    </>
                )}
            </Box>
        </MainLayout>
    );
};

export default Profile;