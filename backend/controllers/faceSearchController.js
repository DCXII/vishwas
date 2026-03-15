const Ticket = require('../models/ticketModel');
const Case = require('../models/caseModel');
const crypto = require('crypto');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const FACE_SERVICE_URL = process.env.FACE_SERVICE_URL || 'http://127.0.0.1:5002';

// @desc    Search for related cases by face image
// @route   POST /api/face-search/lookup
// @access  Private (Police/Authority/Admin)
const faceSearchLookup = async (req, res) => {
    try {
        // Only police/authority/admin can search
        if (!['Police', 'Authority', 'Admin'].includes(req.user.role)) {
            return res.status(403).json({ error: 'Access denied. Only police/authority/admin can perform face search.' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        const photoPath = req.file.path;

        // Check if file exists
        if (!fs.existsSync(photoPath)) {
            return res.status(400).json({ error: 'Image file not found' });
        }

        console.log(`[Face Search] Searching for face in uploaded image...`);

        // Send to face service for identification
        const formData = new FormData();
        formData.append('image', fs.createReadStream(photoPath));

        let faceResult;
        try {
            const faceResponse = await axios.post(`${FACE_SERVICE_URL}/api/identify`, formData, {
                headers: formData.getHeaders(),
                timeout: 30000,
            });
            faceResult = faceResponse.data;
        } catch (err) {
            console.error('Face service error:', err.response?.data || err.message);
            if (err.code === 'ECONNREFUSED' || !err.response) {
                return res.status(503).json({ error: 'Face detection service is not running. Please start the Python face service on port 5002.' });
            }
            return res.status(err.response.status).json({
                error: err.response.data.error || 'Face search failed: ' + err.message
            });
        }

        if (!faceResult.match) {
            console.log('[Face Search] No face match found in database');
            return res.json({
                success: false,
                message: 'No matching face found in the system',
                matchScore: 0,
                relatedCases: [],
                relatedTickets: []
            });
        }

        // Face was matched - now search for related cases and tickets
        const suspectName = faceResult.profile?.name || 'Unknown';
        console.log(`[Face Search] Face match found: ${suspectName} (Score: ${faceResult.score})`);

        // Search tickets with matching suspect description or related info
        const relatedTickets = await Ticket.find({
            $or: [
                { suspectDescription: { $regex: suspectName, $options: 'i' } },
                { description: { $regex: suspectName, $options: 'i' } },
            ]
        }).sort({ createdAt: -1 }).limit(20);

        // Search cases with matching details
        const relatedCases = await Case.find({
            $or: [
                { crimeType: { $regex: suspectName, $options: 'i' } },
                { description: { $regex: suspectName, $options: 'i' } },
            ]
        }).sort({ createdAt: -1 }).limit(20);

        console.log(`[Face Search] Found ${relatedTickets.length} related tickets and ${relatedCases.length} related cases`);

        res.json({
            success: true,
            message: 'Face search completed',
            matchScore: faceResult.score,
            matchedProfile: {
                name: faceResult.profile?.name || 'Unknown',
                age: faceResult.profile?.age || 'N/A',
                bio: faceResult.profile?.bio || '',
                imagePath: faceResult.profile?.image_path || null
            },
            relatedTickets: relatedTickets.map(t => ({
                ticketId: t.ticketId,
                complaintType: t.complaintType,
                description: t.description,
                suspectDescription: t.suspectDescription,
                location: t.location,
                incidentDate: t.incidentDate,
                status: t.status,
                citizenName: t.citizenName,
                createdAt: t.createdAt
            })),
            relatedCases: relatedCases.map(c => ({
                caseId: c.caseId,
                crimeType: c.crimeType,
                description: c.description,
                severity: c.severity,
                status: c.status,
                location: c.location,
                victimName: c.victimName,
                createdAt: c.createdAt
            }))
        });

    } catch (err) {
        console.error('Face search error:', err);
        res.status(500).json({ error: 'Face search failed: ' + err.message });
    }
};

// @desc    Get search history
// @route   GET /api/face-search/history
// @access  Private (Police/Authority/Admin)
const getSearchHistory = async (req, res) => {
    try {
        if (!['Police', 'Authority', 'Admin'].includes(req.user.role)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // This can be extended to track searches if needed
        // For now, just return success
        res.json({
            message: 'Face search history feature (implementation pending)',
            searchHistory: []
        });
    } catch (err) {
        console.error('Error fetching search history:', err);
        res.status(500).json({ error: 'Failed to fetch search history' });
    }
};

module.exports = {
    faceSearchLookup,
    getSearchHistory
};
