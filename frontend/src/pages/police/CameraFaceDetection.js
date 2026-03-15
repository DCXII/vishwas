import React, { useRef, useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Card, CardContent, Button, 
    Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress,
    Alert, Alert as MuiAlert, Chip, Grid, Avatar, Table, 
    TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import CameraIcon from '@mui/icons-material/Camera';
import StopIcon from '@mui/icons-material/Stop';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PersonIcon from '@mui/icons-material/Person';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import axios from 'axios';
import config from '../../config';
import PageHeader from '../../components/common/PageHeader';

const CameraFaceDetection = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [stream, setStream] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [searchResults, setSearchResults] = useState(null);
    const [showResultsDialog, setShowResultsDialog] = useState(false);

    // Initialize camera
    const startCamera = async () => {
        try {
            setError('');
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });
            
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                setStream(mediaStream);
                setCameraActive(true);
            }
        } catch (err) {
            const errorMsg = err.name === 'NotAllowedError' 
                ? 'Camera access denied. Please check browser permissions.' 
                : err.name === 'NotFoundError'
                ? 'No camera device found'
                : 'Error accessing camera: ' + err.message;
            setError(errorMsg);
            console.error('Camera error:', err);
        }
    };

    // Stop camera
    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setCameraActive(false);
        setCapturedImage(null);
    };

    // Capture photo from video
    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            const video = videoRef.current;

            // Set canvas dimensions to match video
            canvasRef.current.width = video.videoWidth;
            canvasRef.current.height = video.videoHeight;

            // Draw video frame to canvas
            context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

            // Get image data
            canvasRef.current.toBlob((blob) => {
                if (blob) {
                    setCapturedImage({
                        blob,
                        url: URL.createObjectURL(blob),
                    });
                }
            }, 'image/jpeg', 0.95);
        }
    };

    // Identify person from captured image
    const identifyPerson = async () => {
        if (!capturedImage) {
            setError('Please capture a photo first');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('image', capturedImage.blob, 'capture.jpg');

            const baseUrl = config?.apiUrl || '';
            const response = await axios.post(
                `${baseUrl}/api/face-search/lookup`,
                formData,
                {
                    headers: {
                        'x-auth-token': localStorage.token,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data.success) {
                setSearchResults(response.data);
                setShowResultsDialog(true);
            } else {
                setError(response.data.message || 'No match found');
            }
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Face identification failed');
            console.error('Identification error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    return (
        <Box sv={{ p: 3 }}>
            <PageHeader 
                title="Real-Time Face Detection & Identification"
                description="Use your camera to identify persons and verify their criminal activities"
                icon={<VideocamIcon />}
            />

            <Grid container spacing={3}>
                {/* Camera Section */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                            <CameraIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Live Camera Feed
                        </Typography>

                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                                {error}
                            </Alert>
                        )}

                        <Box
                            sx={{
                                position: 'relative',
                                width: '100%',
                                paddingBottom: '75%',
                                backgroundColor: '#000',
                                borderRadius: 1,
                                overflow: 'hidden',
                                mb: 2
                            }}
                        >
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                }}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    transform: 'scaleX(-1)', // Mirror effect
                                }}
                            />
                            <canvas ref={canvasRef} style={{ display: 'none' }} />
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                            {!cameraActive ? (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<VideocamIcon />}
                                    onClick={startCamera}
                                    sx={{ flex: 1 }}
                                >
                                    Start Camera
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        variant="contained"
                                        color="success"
                                        startIcon={<CameraIcon />}
                                        onClick={capturePhoto}
                                        sx={{ flex: 1 }}
                                    >
                                        Capture Photo
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        startIcon={<StopIcon />}
                                        onClick={stopCamera}
                                        sx={{ flex: 1 }}
                                    >
                                        Stop Camera
                                    </Button>
                                </>
                            )}
                        </Box>
                    </Paper>
                </Grid>

                {/* Captured Image & Identification Section */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                            <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Identification
                        </Typography>

                        {capturedImage ? (
                            <>
                                <Box
                                    sx={{
                                        width: '100%',
                                        height: 300,
                                        backgroundImage: `url(${capturedImage.url})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        borderRadius: 1,
                                        mb: 2,
                                        border: '2px solid #ccc'
                                    }}
                                />

                                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={<VerifiedUserIcon />}
                                        onClick={identifyPerson}
                                        disabled={loading}
                                        fullWidth
                                    >
                                        {loading ? <CircularProgress size={24} /> : 'Identify Person'}
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        startIcon={<CloseIcon />}
                                        onClick={() => setCapturedImage(null)}
                                        fullWidth
                                    >
                                        Clear
                                    </Button>
                                </Box>

                                <Alert severity="info">
                                    Photo captured successfully. Click "Identify Person" to search the database.
                                </Alert>
                            </>
                        ) : (
                            <Box
                                sx={{
                                    height: 300,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: '#f5f5f5',
                                    borderRadius: 1,
                                    border: '2px dashed #ccc',
                                    color: '#999'
                                }}
                            >
                                <Typography variant="body2" align="center">
                                    Capture a photo using the camera to identify a person
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            {/* Results Dialog */}
            <Dialog
                open={showResultsDialog}
                onClose={() => setShowResultsDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Identification Results
                </DialogTitle>
                <DialogContent dividers>
                    {searchResults && (
                        <Box>
                            {searchResults.match ? (
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                        <CheckCircleIcon sx={{ color: 'green', fontSize: 32 }} />
                                        <Box>
                                            <Typography variant="h6">Match Found</Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                Confidence: {Math.round(searchResults.score * 100)}%
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Card sx={{ mb: 2 }}>
                                        <CardContent>
                                            <Typography variant="subtitle2" color="textSecondary">Person Details</Typography>
                                            <Typography variant="body1" sx={{ mt: 1 }}>
                                                <strong>Name:</strong> {searchResults.profileData?.name || 'N/A'}
                                            </Typography>
                                            <Typography variant="body1">
                                                <strong>Citizen ID:</strong> {searchResults.profileData?.citizenId || 'N/A'}
                                            </Typography>
                                            <Typography variant="body1">
                                                <strong>Phone:</strong> {searchResults.profileData?.phone || 'N/A'}
                                            </Typography>
                                        </CardContent>
                                    </Card>

                                    {searchResults.relatedCases?.length > 0 && (
                                        <Box>
                                            <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                                                Related Criminal Cases ({searchResults.relatedCases.length})
                                            </Typography>
                                            <TableContainer component={Paper} sx={{ mb: 2 }}>
                                                <Table size="small">
                                                    <TableHead>
                                                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                                            <TableCell><strong>Case #</strong></TableCell>
                                                            <TableCell><strong>Crime Type</strong></TableCell>
                                                            <TableCell><strong>Severity</strong></TableCell>
                                                            <TableCell><strong>Status</strong></TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {searchResults.relatedCases.map((c) => (
                                                            <TableRow key={c.caseId}>
                                                                <TableCell>{c.caseNumber}</TableCell>
                                                                <TableCell>{c.crimeType}</TableCell>
                                                                <TableCell>
                                                                    <Chip
                                                                        label={c.severity}
                                                                        size="small"
                                                                        color={c.severity === 'Critical' ? 'error' : 'warning'}
                                                                        variant="outlined"
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Chip label={c.status} size="small" />
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </Box>
                                    )}
                                </Box>
                            ) : (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <ErrorIcon sx={{ color: 'orange', fontSize: 32 }} />
                                    <Box>
                                        <Typography variant="h6">No Match Found</Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            The captured face does not match any records in the database
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowResultsDialog(false)} variant="contained">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CameraFaceDetection;
