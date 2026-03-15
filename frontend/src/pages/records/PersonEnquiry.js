import React, { useState } from 'react';
import {
    Box, Typography, Paper, TextField, Button, Grid, Card, CardContent,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    CircularProgress, Alert, Chip, Dialog, DialogTitle, DialogContent,
    DialogActions, FormControl, InputLabel, Select, MenuItem, InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import DownloadIcon from '@mui/icons-material/Download';
import HistoryIcon from '@mui/icons-material/History';
import ClearIcon from '@mui/icons-material/Clear';
import axios from 'axios';
import config from '../../config';
import PageHeader from '../../components/common/PageHeader';

const PersonEnquiry = () => {
    const [searchType, setSearchType] = useState('citizenId');
    const [searchValue, setSearchValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [enquiryHistory, setEnquiryHistory] = useState([]);
    const [showHistoryDialog, setShowHistoryDialog] = useState(false);
    const [selectedEnquiry, setSelectedEnquiry] = useState(null);

    // Perform person search
    const handleSearch = async () => {
        if (!searchValue.trim()) {
            setError('Please enter a search value');
            return;
        }

        setLoading(true);
        setError('');
        setSearchResults(null);

        try {
            const baseUrl = config?.apiUrl || '';
            const response = await axios.post(
                `${baseUrl}/api/enquiry/search`,
                {
                    searchType,
                    searchValue,
                    criteria: {
                        type: 'CITIZEN_SEARCH',
                    }
                },
                {
                    headers: {
                        'x-auth-token': localStorage.token,
                    }
                }
            );

            if (response.data.success) {
                setSearchResults(response.data.data);
            } else {
                setError(response.data.message || 'Search failed');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Search failed');
            console.error('Search error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Check criminal record
    const handleCriminalCheck = async () => {
        if (!searchValue.trim()) {
            setError('Please enter a search value');
            return;
        }

        setLoading(true);
        setError('');
        setSearchResults(null);

        try {
            const baseUrl = config?.apiUrl || '';
            const response = await axios.post(
                `${baseUrl}/api/enquiry/criminal-check`,
                {
                    searchValue,
                },
                {
                    headers: {
                        'x-auth-token': localStorage.token,
                    }
                }
            );

            if (response.data.success) {
                setSearchResults({
                    ...response.data.data,
                    isCriminalCheck: true,
                });
            } else {
                setError(response.data.message || 'Criminal check failed');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Criminal check failed');
        } finally {
            setLoading(false);
        }
    };

    // Fetch enquiry history
    const fetchEnquiryHistory = async () => {
        try {
            const baseUrl = config?.apiUrl || '';
            const response = await axios.get(
                `${baseUrl}/api/enquiry/history/my`,
                {
                    headers: {
                        'x-auth-token': localStorage.token,
                    }
                }
            );

            if (response.data.success) {
                setEnquiryHistory(response.data.data);
                setShowHistoryDialog(true);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch history');
        }
    };

    // Download enquiry report
    const handleDownloadReport = async (enquiryId) => {
        try {
            const baseUrl = config?.apiUrl || '';
            const response = await axios.get(
                `${baseUrl}/api/enquiry/${enquiryId}/report`,
                {
                    headers: {
                        'x-auth-token': localStorage.token,
                    }
                }
            );

            if (response.data.success) {
                // Generate JSON report
                const dataStr = JSON.stringify(response.data.data, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `enquiry-report-${enquiryId}.json`;
                link.click();
            }
        } catch (err) {
            setError('Failed to download report');
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <PageHeader
                title="Person Enquiry & Search"
                description="Search for person details and verify criminal records"
                icon={<PersonSearchIcon />}
            />

            <Grid container spacing={3}>
                {/* Search Section */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                            <SearchIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Search Criteria
                        </Typography>

                        <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid item xs={12} sm={4}>
                                <FormControl fullWidth>
                                    <InputLabel>Search Type</InputLabel>
                                    <Select
                                        value={searchType}
                                        onChange={(e) => setSearchType(e.target.value)}
                                        label="Search Type"
                                    >
                                        <MenuItem value="citizenId">Citizen ID</MenuItem>
                                        <MenuItem value="email">Email</MenuItem>
                                        <MenuItem value="phone">Phone</MenuItem>
                                        <MenuItem value="name">Name</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={8}>
                                <TextField
                                    fullWidth
                                    label={`Enter ${searchType}`}
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') handleSearch();
                                    }}
                                    placeholder={`Search by ${searchType}`}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <SearchIcon color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                        </Grid>

                        {error && (
                            <Alert
                                severity="error"
                                sx={{ mb: 2 }}
                                onClose={() => setError('')}
                            >
                                {error}
                            </Alert>
                        )}

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<SearchIcon />}
                                onClick={handleSearch}
                                disabled={loading}
                                sx={{ flex: 1 }}
                            >
                                {loading ? <CircularProgress size={24} /> : 'Search Person'}
                            </Button>
                            <Button
                                variant="contained"
                                color="warning"
                                startIcon={<SearchIcon />}
                                onClick={handleCriminalCheck}
                                disabled={loading}
                                sx={{ flex: 1 }}
                            >
                                {loading ? <CircularProgress size={24} /> : 'Criminal Record Check'}
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<HistoryIcon />}
                                onClick={fetchEnquiryHistory}
                                sx={{ flex: 1 }}
                            >
                                View History
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<ClearIcon />}
                                onClick={() => {
                                    setSearchValue('');
                                    setSearchResults(null);
                                    setError('');
                                }}
                                sx={{ flex: 1 }}
                            >
                                Clear
                            </Button>
                        </Box>
                    </Paper>
                </Grid>

                {/* Search Results */}
                {searchResults && (
                    <>
                        {searchResults.isCriminalCheck ? (
                            // Criminal Check Results
                            <Grid item xs={12}>
                                <Paper sx={{ p: 3, borderRadius: 2 }}>
                                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                        Criminal Record Check Results
                                    </Typography>

                                    <Card sx={{ mb: 2 }}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                <Box>
                                                    <Typography variant="body1">
                                                        <strong>Name:</strong> {searchResults.person?.name}
                                                    </Typography>
                                                    <Typography variant="body1">
                                                        <strong>Citizen ID:</strong> {searchResults.person?.citizenId}
                                                    </Typography>
                                                </Box>
                                                <Chip
                                                    label={searchResults.severity}
                                                    color={searchResults.severity === 'FLAGGED' ? 'error' : 'success'}
                                                    sx={{ fontSize: '1rem', padding: '20px 10px' }}
                                                />
                                            </Box>

                                            <Alert severity={searchResults.hasRecords ? 'warning' : 'success'}>
                                                {searchResults.hasRecords
                                                    ? `⚠️ ${searchResults.totalCases} criminal case(s) found`
                                                    : '✓ No criminal records found'}
                                            </Alert>
                                        </CardContent>
                                    </Card>

                                    {searchResults.cases?.length > 0 && (
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                                                Related Cases
                                            </Typography>
                                            <TableContainer component={Paper}>
                                                <Table>
                                                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                                        <TableRow>
                                                            <TableCell><strong>Case #</strong></TableCell>
                                                            <TableCell><strong>Crime Type</strong></TableCell>
                                                            <TableCell><strong>Severity</strong></TableCell>
                                                            <TableCell><strong>Status</strong></TableCell>
                                                            <TableCell><strong>Date</strong></TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {searchResults.cases.map((c) => (
                                                            <TableRow key={c._id}>
                                                                <TableCell>{c.caseNumber}</TableCell>
                                                                <TableCell>{c.crimeType}</TableCell>
                                                                <TableCell>
                                                                    <Chip
                                                                        label={c.severity}
                                                                        size="small"
                                                                        color={c.severity === 'Critical' ? 'error' : 'warning'}
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Chip label={c.status} size="small" />
                                                                </TableCell>
                                                                <TableCell>
                                                                    {new Date(c.createdAt).toLocaleDateString()}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </Box>
                                    )}
                                </Paper>
                            </Grid>
                        ) : (
                            // Regular Search Results
                            <Grid item xs={12}>
                                <Paper sx={{ p: 3, borderRadius: 2 }}>
                                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                        Person Details
                                    </Typography>

                                    <Card sx={{ mb: 3 }}>
                                        <CardContent>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} sm={6}>
                                                    <Typography variant="body2" color="textSecondary">Name</Typography>
                                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                        {searchResults.enquiredPerson?.name}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <Typography variant="body2" color="textSecondary">Citizen ID</Typography>
                                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                        {searchResults.enquiredPerson?.citizenId}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <Typography variant="body2" color="textSecondary">Email</Typography>
                                                    <Typography variant="body1">
                                                        {searchResults.enquiredPerson?.email}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <Typography variant="body2" color="textSecondary">Phone</Typography>
                                                    <Typography variant="body1">
                                                        {searchResults.enquiredPerson?.phone}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <Typography variant="body2" color="textSecondary">Address</Typography>
                                                    <Typography variant="body1">
                                                        {searchResults.enquiredPerson?.address}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <Typography variant="body2" color="textSecondary">Date of Birth</Typography>
                                                    <Typography variant="body1">
                                                        {searchResults.enquiredPerson?.dateOfBirth
                                                            ? new Date(searchResults.enquiredPerson.dateOfBirth).toLocaleDateString()
                                                            : 'N/A'}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                    </Card>

                                    {searchResults.relatedCases?.length > 0 && (
                                        <Box sx={{ mb: 3 }}>
                                            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                                                Related Cases ({searchResults.totalCases})
                                            </Typography>
                                            <TableContainer component={Paper}>
                                                <Table size="small">
                                                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                                        <TableRow>
                                                            <TableCell><strong>Case #</strong></TableCell>
                                                            <TableCell><strong>Type</strong></TableCell>
                                                            <TableCell><strong>Severity</strong></TableCell>
                                                            <TableCell><strong>Status</strong></TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {searchResults.relatedCases.map((c) => (
                                                            <TableRow key={c._id}>
                                                                <TableCell>{c.caseNumber}</TableCell>
                                                                <TableCell>{c.crimeType}</TableCell>
                                                                <TableCell>
                                                                    <Chip label={c.severity} size="small" />
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
                                </Paper>
                            </Grid>
                        )}
                    </>
                )}
            </Grid>

            {/* Enquiry History Dialog */}
            <Dialog
                open={showHistoryDialog}
                onClose={() => setShowHistoryDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Search History</DialogTitle>
                <DialogContent dividers>
                    {enquiryHistory.length > 0 ? (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                        <TableCell><strong>Person</strong></TableCell>
                                        <TableCell><strong>Type</strong></TableCell>
                                        <TableCell><strong>Cases Found</strong></TableCell>
                                        <TableCell><strong>Date</strong></TableCell>
                                        <TableCell><strong>Action</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {enquiryHistory.map((e) => (
                                        <TableRow key={e._id}>
                                            <TableCell>{e.searchedPerson?.name}</TableCell>
                                            <TableCell>{e.enquiryType}</TableCell>
                                            <TableCell>{e.relatedCases?.length || 0}</TableCell>
                                            <TableCell>
                                                {new Date(e.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    size="small"
                                                    startIcon={<DownloadIcon />}
                                                    onClick={() => handleDownloadReport(e.enquiryId)}
                                                >
                                                    Report
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 4 }}>
                            No search history found
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowHistoryDialog(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PersonEnquiry;
