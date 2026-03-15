import React, { useState } from 'react';
import {
    Box, Typography, TextField, Button, Paper, Grid, MenuItem, Alert, CircularProgress, InputAdornment,
    Card, Divider, FormControl, InputLabel, Select, Stepper, Step, StepLabel
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DescriptionIcon from '@mui/icons-material/Description';
import PlaceIcon from '@mui/icons-material/Place';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InfoIcon from '@mui/icons-material/Info';
import axios from 'axios';
import config from '../../config';
import PageHeader from '../../components/common/PageHeader';

const CreateRequest = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState({
        complaintType: '',
        description: '',
        location: '',
        suspectDescription: '',
        accusedCitizenId: '',
        incidentDate: '',
    });
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const complaintTypes = [
        'Theft', 'Assault', 'Fraud', 'Harassment', 'Cybercrime', 'Other'
    ];

    const steps = ['Basic Info', 'Details', 'Upload Photo', 'Review'];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setError('');
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => setPhotoPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const validateStep = () => {
        if (activeStep === 0) {
            if (!formData.complaintType) {
                setError('Please select a complaint type');
                return false;
            }
        } else if (activeStep === 1) {
            if (!formData.description.trim()) {
                setError('Description is required');
                return false;
            }
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep()) {
            setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
            setError('');
        }
    };

    const handleBack = () => {
        setActiveStep((prev) => Math.max(prev - 1, 0));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.complaintType || !formData.description) {
            setError('Complaint type and description are required.');
            return;
        }
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const data = new FormData();
            data.append('complaintType', formData.complaintType);
            data.append('description', formData.description);
            data.append('location', formData.location);
            data.append('suspectDescription', formData.suspectDescription);
            if (formData.accusedCitizenId) data.append('accusedCitizenId', formData.accusedCitizenId);
            if (formData.incidentDate) data.append('incidentDate', formData.incidentDate);
            if (photo) data.append('suspectPhoto', photo);

            const url = config?.apiUrl ? `${config.apiUrl}/api/tickets` : '/api/tickets';
            await axios.post(url, data, {
                headers: { 'x-auth-token': localStorage.token, 'Content-Type': 'multipart/form-data' }
            });
            setSuccess('✓ Request filed successfully! You will be notified of updates.');
            setFormData({ complaintType: '', description: '', location: '', suspectDescription: '', accusedCitizenId: '', incidentDate: '' });
            setPhoto(null);
            setPhotoPreview(null);
            setActiveStep(0);
            setTimeout(() => setSuccess(''), 5000);
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to submit request.';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (activeStep) {
            case 0: // Basic Info
                return (
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Select Complaint Type</Typography>
                        <FormControl fullWidth>
                            <InputLabel>Complaint Type</InputLabel>
                            <Select
                                name="complaintType"
                                value={formData.complaintType}
                                onChange={handleChange}
                                label="Complaint Type"
                                startAdornment={
                                    <InputAdornment position="start">
                                        <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />
                                    </InputAdornment>
                                }
                            >
                                {complaintTypes.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <Paper elevation={0} sx={{ p: 2, mt: 2, bgcolor: '#f5f7fa', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <InfoIcon sx={{ color: '#667eea', flexShrink: 0 }} />
                                <Typography variant="caption" color="text.secondary">
                                    Select the type of complaint that best matches your situation. You can provide more details in the next step.
                                </Typography>
                            </Box>
                        </Paper>
                    </Box>
                );
            case 1: // Details
                return (
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Provide Details</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    label="Description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Provide as much detail as possible about the incident..."
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Incident Date"
                                    name="incidentDate"
                                    type="date"
                                    value={formData.incidentDate}
                                    onChange={handleChange}
                                    InputLabelProps={{ shrink: true }}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start"><EventIcon color="action" /></InputAdornment>
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="Where did this happen?"
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start"><PlaceIcon color="action" /></InputAdornment>
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                );
            case 2: // Upload Photo
                return (
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Suspect Information (Optional)</Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Suspect Description"
                            name="suspectDescription"
                            value={formData.suspectDescription}
                            onChange={handleChange}
                            placeholder="Physical description, clothing, distinguishing features..."
                            sx={{ mb: 2.5 }}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><PersonIcon color="action" /></InputAdornment>
                            }}
                        />

                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, mt: 2 }}>Is this against an Authority?</Typography>
                        <TextField
                            fullWidth
                            label="Accused Citizen ID (Optional)"
                            name="accusedCitizenId"
                            value={formData.accusedCitizenId}
                            onChange={handleChange}
                            placeholder="Enter the official Citizen ID of the accused officer/authority"
                            sx={{ mb: 3 }}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><PersonIcon color="action" /></InputAdornment>
                            }}
                        />

                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                border: '2px dashed #667eea',
                                borderRadius: 2,
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                bgcolor: '#f5f7fa',
                                '&:hover': { bgcolor: '#e8ebf7', borderColor: '#764ba2' }
                            }}
                            onClick={() => document.getElementById('photo-upload').click()}
                        >
                            {photoPreview ? (
                                <Box>
                                    <Box
                                        component="img"
                                        src={photoPreview}
                                        sx={{ maxHeight: 250, maxWidth: '100%', borderRadius: 2, mb: 1 }}
                                    />
                                    <Typography variant="body2" color="success.main">✓ Image selected</Typography>
                                </Box>
                            ) : (
                                <Box>
                                    <CloudUploadIcon sx={{ fontSize: 48, color: '#667eea', mb: 1 }} />
                                    <Typography variant="subtitle2">Click to upload suspect photo</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        JPG, PNG, WebP up to 10MB
                                    </Typography>
                                </Box>
                            )}
                            <input
                                id="photo-upload"
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                                style={{ display: 'none' }}
                            />
                        </Paper>
                    </Box>
                );
            case 3: // Review
                return (
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Review Your Report</Typography>
                        <Card variant="outlined" sx={{ p: 2.5 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary">Type</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{formData.complaintType}</Typography>
                                </Grid>
                                {formData.incidentDate && (
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="caption" color="text.secondary">Date</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{new Date(formData.incidentDate).toLocaleDateString()}</Typography>
                                    </Grid>
                                )}
                                {formData.location && (
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="caption" color="text.secondary">Location</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{formData.location}</Typography>
                                    </Grid>
                                )}
                                <Grid item xs={12}>
                                    <Divider sx={{ my: 1 }} />
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="caption" color="text.secondary">Description</Typography>
                                    <Typography variant="body2">{formData.description}</Typography>
                                </Grid>
                                {formData.suspectDescription && (
                                    <Grid item xs={12}>
                                        <Divider sx={{ my: 1 }} />
                                    </Grid>
                                )}
                                {formData.suspectDescription && (
                                    <Grid item xs={12}>
                                        <Typography variant="caption" color="text.secondary">Suspect Description</Typography>
                                        <Typography variant="body2">{formData.suspectDescription}</Typography>
                                    </Grid>
                                )}
                                {formData.accusedCitizenId && (
                                    <Grid item xs={12}>
                                        <Typography variant="caption" color="error.main" fontWeight={700}>Accused Authority Citizen ID</Typography>
                                        <Typography variant="body2">{formData.accusedCitizenId}</Typography>
                                    </Grid>
                                )}
                                {photoPreview && (
                                    <>
                                        <Grid item xs={12}>
                                            <Divider sx={{ my: 1 }} />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="caption" color="text.secondary">Photo</Typography>
                                            <Box
                                                component="img"
                                                src={photoPreview}
                                                sx={{ maxHeight: 200, maxWidth: '100%', borderRadius: 2, mt: 1 }}
                                            />
                                        </Grid>
                                    </>
                                )}
                            </Grid>
                        </Card>
                    </Box>
                );
            default:
                return null;
        }
    };

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            <PageHeader
                title="File a Complaint"
                subtitle="Submit a detailed report to the police department"
            />

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            <Card sx={{ p: 4, borderRadius: 3 }}>
                {/* Stepper */}
                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {/* Step Content */}
                <Box sx={{ mb: 4, minHeight: 300 }}>
                    {renderStepContent()}
                </Box>

                {/* Navigation Buttons */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
                    <Button
                        onClick={handleBack}
                        disabled={activeStep === 0 || loading}
                    >
                        Back
                    </Button>
                    {activeStep === steps.length - 1 ? (
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                        >
                            {loading ? 'Submitting...' : 'Submit Report'}
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            onClick={handleNext}
                            disabled={loading}
                        >
                            Next
                        </Button>
                    )}
                </Box>
            </Card>
        </Box>
    );
};

export default CreateRequest;
