import React, { useState } from 'react';
import {
    Box, Typography, Paper, Grid, Card, CardContent, Button, Alert,
    CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Chip, LinearProgress, CardHeader, Divider, Rating, Avatar
} from '@mui/material';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import axios from 'axios';
import config from '../../config';
import PageHeader from '../../components/common/PageHeader';

const FaceSearch = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [dragActive, setDragActive] = useState(false);

    const handleFileSelect = (file) => {
        if (file) {
            if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
                setError('Only image files (JPG, PNG, WebP) are allowed');
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                setError('File size must be less than 10MB');
                return;
            }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setError('');
            setSearchResults(null);
        }
    };

    const handleFileInputChange = (event) => {
        const file = event.target.files[0];
        handleFileSelect(file);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const file = e.dataTransfer.files[0];
        handleFileSelect(file);
    };

    const handlePerformSearch = async () => {
        if (!selectedFile) {
            setError('Please select an image file');
            return;
        }

        setLoading(true);
        setError('');
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append('image', selectedFile);

            const baseUrl = config?.apiUrl || '';
            const response = await axios.post(
                `${baseUrl}/api/face-search/lookup`,
                formData,
                {
                    headers: {
                        'x-auth-token': localStorage.token,
                        'Content-Type': 'multipart/form-data'
                    },
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(percentCompleted);
                    }
                }
            );

            setSearchResults(response.data);
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Face search failed');
            setSearchResults(null);
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    const handleReset = () => {
        setSelectedFile(null);
        setPreviewUrl('');
        setSearchResults(null);
        setError('');
        setUploadProgress(0);
    };

    return (
        <Box>
            <PageHeader 
                title="Face Recognition Search" 
                subtitle="Upload a suspect photo to find related cases and complaints" 
            />

            <Grid container spacing={3}>
                {/* Upload Section */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
                        <Box
                            sx={{
                                p: 4,
                                textAlign: 'center',
                                border: '2px dashed',
                                borderColor: dragActive ? 'primary.main' : '#e0e0e0',
                                bgcolor: dragActive ? '#f5f7fa' : '#fafbfc',
                                transition: 'all 0.3s',
                                cursor: 'pointer',
                                '&:hover': { bgcolor: '#f5f7fa', borderColor: 'primary.main' }
                            }}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            {!previewUrl ? (
                                <Box>
                                    <CloudUploadOutlinedIcon sx={{ fontSize: 56, color: '#667eea', mb: 2 }} />
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                        Upload or Drag Photo
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                        Drop image here or click to browse
                                    </Typography>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileInputChange}
                                        style={{ display: 'none' }}
                                        id="face-search-input"
                                    />
                                    <label htmlFor="face-search-input" style={{ display: 'block' }}>
                                        <Button
                                            variant="contained"
                                            component="span"
                                            startIcon={<CloudUploadOutlinedIcon />}
                                            size="large"
                                        >
                                            Choose Image
                                        </Button>
                                    </label>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                                        JPG, PNG, WebP • Max 10MB
                                    </Typography>
                                </Box>
                            ) : (
                                <Box
                                    component="img"
                                    src={previewUrl}
                                    alt="Preview"
                                    sx={{
                                        maxHeight: 320,
                                        maxWidth: '100%',
                                        borderRadius: 2,
                                        mb: 2
                                    }}
                                />
                            )}
                        </Box>

                        {/* File Info */}
                        {selectedFile && (
                            <Box sx={{ p: 2, bgcolor: '#f5f7fa', borderTop: '1px solid #e0e0e0' }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                                    ✓ {selectedFile.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {(selectedFile.size / 1024).toFixed(2)} KB
                                </Typography>
                            </Box>
                        )}

                        {/* Action Buttons */}
                        <Box sx={{ p: 2, display: 'flex', gap: 2, borderTop: '1px solid #e0e0e0' }}>
                            <Button
                                variant="contained"
                                fullWidth
                                startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
                                onClick={handlePerformSearch}
                                disabled={!selectedFile || loading}
                            >
                                {loading ? 'Searching...' : 'Search Face'}
                            </Button>
                            {selectedFile && (
                                <Button
                                    variant="outlined"
                                    onClick={handleReset}
                                    disabled={loading}
                                    startIcon={<ClearIcon />}
                                >
                                    Clear
                                </Button>
                            )}
                        </Box>

                        {/* Upload Progress */}
                        {uploadProgress > 0 && uploadProgress < 100 && (
                            <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ flex: 1 }}>
                                        <LinearProgress variant="determinate" value={uploadProgress} />
                                    </Box>
                                    <Typography variant="caption" sx={{ minWidth: '45px', textAlign: 'right' }}>
                                        {uploadProgress}%
                                    </Typography>
                                </Box>
                            </Box>
                        )}

                        {/* Error Alert */}
                        {error && (
                            <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
                                <Alert severity="error" onClose={() => setError('')}>
                                    {error}
                                </Alert>
                            </Box>
                        )}
                    </Card>
                </Grid>

                {/* Results Section */}
                <Grid item xs={12} md={6}>
                    {loading ? (
                        <Card sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
                            <CircularProgress sx={{ mb: 2 }} size={48} />
                            <Typography color="text.secondary" variant="body1" sx={{ fontWeight: 500 }}>
                                Analyzing image and searching database...
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                This may take a moment
                            </Typography>
                        </Card>
                    ) : searchResults ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {/* Match Status Card */}
                            <Card sx={{ borderRadius: 3 }}>
                                <CardHeader
                                    avatar={
                                        searchResults.success ? (
                                            <CheckCircleIcon sx={{ color: 'success.main', fontSize: 32 }} />
                                        ) : (
                                            <ErrorIcon sx={{ color: 'warning.main', fontSize: 32 }} />
                                        )
                                    }
                                    title={searchResults.success ? 'Match Found' : 'No Match Found'}
                                    subheader={searchResults.message}
                                />
                                <Divider />
                                {searchResults.success && searchResults.matchedProfile && (
                                    <CardContent>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Avatar sx={{ bgcolor: '#667eea', width: 56, height: 56 }}>
                                                        <VerifiedUserIcon />
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="subtitle2" color="text.secondary">
                                                            Matched Profile
                                                        </Typography>
                                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                            {searchResults.matchedProfile.name}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" color="text.secondary">Age</Typography>
                                                <Typography variant="subtitle2">{searchResults.matchedProfile.age} years</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" color="text.secondary">Match Confidence</Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                        {(searchResults.matchScore * 100).toFixed(0)}%
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={searchResults.matchScore * 100}
                                                    sx={{ height: 8, borderRadius: 1 }}
                                                />
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                )}
                            </Card>

                            {/* Related Tickets */}
                            {searchResults.relatedTickets && searchResults.relatedTickets.length > 0 && (
                                <Card sx={{ borderRadius: 3 }}>
                                    <CardHeader
                                        title={`Related Complaints (${searchResults.relatedTickets.length})`}
                                        titleTypographyProps={{ variant: 'subtitle1' }}
                                    />
                                    <Divider />
                                    <CardContent sx={{ p: 0 }}>
                                        <TableContainer>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow sx={{ bgcolor: '#f5f7fa' }}>
                                                        <TableCell sx={{ fontWeight: 600 }}>Ticket ID</TableCell>
                                                        <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                                                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {searchResults.relatedTickets.map((ticket) => (
                                                        <TableRow key={ticket.ticketId} hover>
                                                            <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                                                {ticket.ticketId.substring(0, 8)}...
                                                            </TableCell>
                                                            <TableCell>{ticket.complaintType}</TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    label={ticket.status}
                                                                    size="small"
                                                                    color={ticket.status === 'Closed' ? 'success' : ticket.status === 'Verified' ? 'info' : 'warning'}
                                                                    variant="outlined"
                                                                />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Related Cases */}
                            {searchResults.relatedCases && searchResults.relatedCases.length > 0 && (
                                <Card sx={{ borderRadius: 3 }}>
                                    <CardHeader
                                        title={`Related Cases (${searchResults.relatedCases.length})`}
                                        titleTypographyProps={{ variant: 'subtitle1' }}
                                    />
                                    <Divider />
                                    <CardContent sx={{ p: 0 }}>
                                        <TableContainer>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow sx={{ bgcolor: '#f5f7fa' }}>
                                                        <TableCell sx={{ fontWeight: 600 }}>Case ID</TableCell>
                                                        <TableCell sx={{ fontWeight: 600 }}>Crime Type</TableCell>
                                                        <TableCell sx={{ fontWeight: 600 }}>Severity</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {searchResults.relatedCases.map((caseItem) => (
                                                        <TableRow key={caseItem.caseId} hover>
                                                            <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                                                {caseItem.caseId.substring(0, 8)}...
                                                            </TableCell>
                                                            <TableCell>{caseItem.crimeType}</TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    label={caseItem.severity}
                                                                    size="small"
                                                                    color={caseItem.severity === 'Critical' ? 'error' : caseItem.severity === 'High' ? 'warning' : 'default'}
                                                                    variant="outlined"
                                                                />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </CardContent>
                                </Card>
                            )}

                            {(!searchResults.relatedTickets || searchResults.relatedTickets.length === 0) &&
                                (!searchResults.relatedCases || searchResults.relatedCases.length === 0) && (
                                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                                        No related cases or complaints found for this person in the system.
                                    </Alert>
                                )}
                        </Box>
                    ) : (
                        <Card sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
                            <PersonSearchIcon sx={{ fontSize: 56, color: '#ccc', mb: 2 }} />
                            <Typography color="text.secondary" variant="body2">
                                Upload an image to search for related cases and complaints
                            </Typography>
                        </Card>
                    )}
                </Grid>
            </Grid>
        </Box>
    );
};

export default FaceSearch;
