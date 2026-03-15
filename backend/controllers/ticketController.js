const Ticket = require('../models/ticketModel');
const User = require('../models/userModel');
const ApprovalWorkflow = require('../models/approvalWorkflowModel');
const BlockchainTransaction = require('../models/blockchainTransactionModel');
const crypto = require('crypto');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const FACE_SERVICE_URL = process.env.FACE_SERVICE_URL || 'http://127.0.0.1:5002';

// @desc    Citizen creates a new complaint ticket
// @route   POST /api/tickets
// @access  Private (Citizen)
const createTicket = async (req, res) => {
    try {
        const { complaintType, description, suspectDescription, accusedCitizenId, location, incidentDate } = req.body;

        if (!complaintType || !description) {
            return res.status(400).json({ error: 'Complaint type and description are required' });
        }

        // Check active ticket count for citizen allocation limit
        const activeTicketsCount = await Ticket.countDocuments({
            citizenId: req.user.id,
            status: { $ne: 'Closed' }
        });

        if (activeTicketsCount >= 5) {
            return res.status(400).json({
                error: 'Ticket allocation limit reached. You can have at most 5 active tickets.'
            });
        }

        const ticketData = {
            citizenId: req.user.id,
            citizenName: req.user.name,
            citizenEmail: req.user.email,
            complaintType,
            description,
            suspectDescription: suspectDescription || '',
            accusedCitizenId: accusedCitizenId || '',
            location: location || '',
            incidentDate: incidentDate || Date.now(),
        };

        // Handle uploaded suspect photo
        if (req.file) {
            ticketData.suspectPhotoPath = req.file.path;
        }

        const ticket = new Ticket(ticketData);
        await ticket.save();

        // Check if accused is an Authority or Police
        let accusedUser = null;
        let requiresMultiLevelApproval = false;

        if (accusedCitizenId) {
            const query = [{ citizenId: accusedCitizenId }];
            if (accusedCitizenId.length === 24) {
                query.push({ _id: accusedCitizenId });
            }
            accusedUser = await User.findOne({ $or: query });
            if (accusedUser && ['Police', 'Authority', 'Admin'].includes(accusedUser.role)) {
                requiresMultiLevelApproval = true;
            }
        }

        // Generate Approval Workflow
        const workflowId = `WF-${crypto.randomUUID().split('-')[0].toUpperCase()}`;
        const approvalLevels = [];

        if (requiresMultiLevelApproval) {
            approvalLevels.push({ level: 'POLICE_STATION', requiredApprovals: 1, approvals: [], status: 'PENDING' });
            approvalLevels.push({ level: 'DISTRICT_AUTHORITY', requiredApprovals: 1, approvals: [], status: 'PENDING' });
            if (accusedUser.role === 'Admin' || accusedUser.role === 'Authority') {
                approvalLevels.push({ level: 'STATE_AUTHORITY', requiredApprovals: 1, approvals: [], status: 'PENDING' });
            }
        } else {
            // Standard ticket just requires station approval
            approvalLevels.push({ level: 'POLICE_STATION', requiredApprovals: 1, approvals: [], status: 'PENDING' });
        }

        const workflow = new ApprovalWorkflow({
            workflowId,
            entityType: requiresMultiLevelApproval ? 'COMPLAINT_AGAINST_AUTHORITY' : 'COMPLAINT',
            entityId: ticket._id.toString(),
            initiatedBy: {
                userId: req.user.id,
                name: req.user.name,
                role: req.user.role,
            },
            approvalLevels,
            metadata: {
                complaintAgainstUserId: accusedUser ? accusedUser._id : null,
                complaintAgainstUserRole: accusedUser ? accusedUser.role : null,
                severity: requiresMultiLevelApproval ? 'CRITICAL' : 'MEDIUM'
            }
        });

        await workflow.save();

        // Update ticket with workflow reference
        ticket.approvalWorkflowId = workflow._id;
        await ticket.save();

        // Log to blockchain audit trail
        const txEntry = new BlockchainTransaction({
            transactionId: `TX-${crypto.randomUUID().split('-')[0].toUpperCase()}`,
            caseId: ticket.ticketId,
            action: 'CREATE',
            performedBy: req.user.id,
            performedByName: req.user.name,
            performedByRole: req.user.role,
            details: `Complaint ticket created: ${complaintType}`,
        });
        await txEntry.save();

        res.status(201).json({
            message: 'Complaint submitted successfully',
            ticket: {
                ticketId: ticket.ticketId,
                complaintType: ticket.complaintType,
                status: ticket.status,
                createdAt: ticket.createdAt,
            },
        });
    } catch (err) {
        console.error('Create ticket error:', err);
        res.status(500).json({ error: 'Failed to create ticket' });
    }
};

// @desc    Citizen gets own tickets
// @route   GET /api/tickets/my
// @access  Private (Citizen)
const getMyTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find({ citizenId: req.user.id }).sort({ createdAt: -1 });

        // For citizen view, return limited info (no raw face data)
        const safeTickets = tickets.map(t => ({
            ticketId: t.ticketId,
            complaintType: t.complaintType,
            description: t.description,
            suspectDescription: t.suspectDescription,
            location: t.location,
            incidentDate: t.incidentDate,
            status: t.status,
            hasSuspectPhoto: !!t.suspectPhotoPath,
            faceVerificationResult: t.faceVerificationResult.matched !== null ? {
                matched: t.faceVerificationResult.matched,
                status: t.faceVerificationResult.matched ? 'Suspect Identified' : 'No Match Found',
            } : null,
            policeResponse: t.policeResponse.message ? {
                message: t.policeResponse.message,
                respondedByName: t.policeResponse.respondedByName,
                respondedAt: t.policeResponse.respondedAt,
            } : null,
            createdAt: t.createdAt,
        }));

        res.json(safeTickets);
    } catch (err) {
        console.error('Get my tickets error:', err);
        res.status(500).json({ error: 'Failed to fetch tickets' });
    }
};

// @desc    Police/Admin gets all tickets
// @route   GET /api/tickets
// @access  Private (Police/Admin)
const getAllTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find().sort({ createdAt: -1 });

        // Format tickets for safe display to police (exclude sensitive photo paths)
        const formattedTickets = tickets.map(t => ({
            _id: t._id,
            ticketId: t.ticketId,
            citizenName: t.citizenName,
            citizenEmail: t.citizenEmail,
            complaintType: t.complaintType,
            description: t.description,
            suspectDescription: t.suspectDescription,
            location: t.location,
            incidentDate: t.incidentDate,
            status: t.status,
            hasSuspectPhoto: !!t.suspectPhotoPath,
            faceVerificationResult: t.faceVerificationResult.matched !== null ? {
                matched: t.faceVerificationResult.matched,
                score: t.faceVerificationResult.score,
                status: t.faceVerificationResult.matched ? 'Suspect Identified' : 'No Match Found',
                verifiedAt: t.faceVerificationResult.verifiedAt,
            } : null,
            policeResponse: t.policeResponse.message ? {
                message: t.policeResponse.message,
                respondedByName: t.policeResponse.respondedByName,
                respondedAt: t.policeResponse.respondedAt,
            } : null,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,
        }));

        res.json(formattedTickets);
    } catch (err) {
        console.error('Get all tickets error:', err);
        res.status(500).json({ error: 'Failed to fetch tickets' });
    }
};

// @desc    Get single ticket by ticketId
// @route   GET /api/tickets/:ticketId
// @access  Private
const getTicketById = async (req, res) => {
    try {
        const ticket = await Ticket.findOne({ ticketId: req.params.ticketId });
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        // Citizens can only view their own tickets
        if (req.user.role === 'Citizen' && ticket.citizenId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(ticket);
    } catch (err) {
        console.error('Get ticket error:', err);
        res.status(500).json({ error: 'Failed to fetch ticket' });
    }
};

// @desc    Police verifies suspect face against the face detection service
// @route   POST /api/tickets/:ticketId/verify-face
// @access  Private (Police/Admin)
const verifyFace = async (req, res) => {
    try {
        const ticket = await Ticket.findOne({ ticketId: req.params.ticketId });
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        if (!ticket.suspectPhotoPath) {
            return res.status(400).json({ error: 'No suspect photo attached to this ticket' });
        }

        // Check if file exists
        const photoPath = path.resolve(ticket.suspectPhotoPath);
        if (!fs.existsSync(photoPath)) {
            return res.status(400).json({ error: 'Suspect photo file not found on server' });
        }

        // Send image to Python face service for identification
        const formData = new FormData();
        formData.append('image', fs.createReadStream(photoPath));

        const faceResponse = await axios.post(`${FACE_SERVICE_URL}/api/identify`, formData, {
            headers: formData.getHeaders(),
            timeout: 30000,
        });

        const faceResult = faceResponse.data;

        // Update ticket with verification result
        ticket.faceVerificationResult = {
            matched: faceResult.match || false,
            score: faceResult.score || 0,
            verifiedBy: req.user.id,
            verifiedAt: new Date(),
        };
        ticket.status = 'Verified';
        await ticket.save();

        // Log to audit trail
        const txEntry = new BlockchainTransaction({
            transactionId: `TX-${crypto.randomUUID().split('-')[0].toUpperCase()}`,
            caseId: ticket.ticketId,
            action: 'UPDATE',
            performedBy: req.user.id,
            performedByName: req.user.name,
            performedByRole: req.user.role,
            details: `Face verification performed. Match: ${faceResult.match}, Score: ${faceResult.score || 0}`,
        });
        await txEntry.save();

        // Return result to police (full info)
        res.json({
            message: 'Face verification complete',
            result: {
                matched: faceResult.match,
                score: faceResult.score || 0,
                profile: faceResult.match ? faceResult.profile : null,
            },
        });
    } catch (err) {
        console.error('Face verification error:', err.response?.data || err.message);
        if (err.code === 'ECONNREFUSED' || !err.response) {
            return res.status(503).json({ error: 'Face detection service is not running. Please start the Python face service on port 5002.' });
        }
        res.status(err.response.status).json({ error: err.response.data.error || 'Face verification failed: ' + err.message });
    }
};

// @desc    Police responds to a ticket with limited info for the citizen
// @route   POST /api/tickets/:ticketId/respond
// @access  Private (Police/Admin)
const respondToTicket = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Response message is required' });
        }

        const ticket = await Ticket.findOne({ ticketId: req.params.ticketId });
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        ticket.policeResponse = {
            message,
            respondedBy: req.user.id,
            respondedByName: req.user.name,
            respondedAt: new Date(),
        };
        ticket.status = 'Responded';
        await ticket.save();

        // Log to audit trail
        const txEntry = new BlockchainTransaction({
            transactionId: `TX-${crypto.randomUUID().split('-')[0].toUpperCase()}`,
            caseId: ticket.ticketId,
            action: 'UPDATE',
            performedBy: req.user.id,
            performedByName: req.user.name,
            performedByRole: req.user.role,
            details: `Police responded to ticket`,
        });
        await txEntry.save();

        res.json({ message: 'Response sent to citizen', ticket });
    } catch (err) {
        console.error('Respond to ticket error:', err);
        res.status(500).json({ error: 'Failed to respond to ticket' });
    }
};

// @desc    Update ticket status
// @route   PUT /api/tickets/:ticketId/status
// @access  Private (Police/Admin)
const updateTicketStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const ticketId = req.params.ticketId;

        console.log(`Attempting to update ticket ${ticketId} to status: ${status}`);

        const validStatuses = ['Pending', 'Under Review', 'Verified', 'Responded', 'Closed'];
        if (!validStatuses.includes(status)) {
            console.error(`Invalid status provided: ${status}`);
            return res.status(400).json({ error: 'Invalid status' });
        }

        const ticket = await Ticket.findOne({ ticketId });
        if (!ticket) {
            console.error(`Ticket not found with ID: ${ticketId}`);
            return res.status(404).json({ error: 'Ticket not found' });
        }

        // Police/Admin can reopen closed tickets
        if (ticket.status === 'Closed' && status !== 'Closed' && !['Police', 'Authority', 'Admin'].includes(req.user.role)) {
            console.error(`Cannot reopen closed ticket ${ticketId} - only police/admin can reopen`);
            return res.status(403).json({ error: 'Only police/admin can reopen closed tickets' });
        }

        ticket.status = status;
        const updatedTicket = await ticket.save();

        console.log(`Successfully updated ticket ${ticketId} to status: ${status}`);

        // Log to audit trail
        const txEntry = new BlockchainTransaction({
            transactionId: `TX-${crypto.randomUUID().split('-')[0].toUpperCase()}`,
            caseId: ticketId,
            action: 'UPDATE',
            performedBy: req.user.id,
            performedByName: req.user.name,
            performedByRole: req.user.role,
            details: `Ticket status updated to: ${status}`,
        });
        await txEntry.save();

        res.json({ message: `Ticket status updated to ${status}`, ticket: updatedTicket });
    } catch (err) {
        console.error('Update ticket status error:', err.message || err);
        res.status(500).json({ error: 'Failed to update ticket status: ' + err.message });
    }
};

// @desc    Serve suspect photo (for police only)
// @route   GET /api/tickets/:ticketId/photo
// @access  Private (Police/Admin)
const getTicketPhoto = async (req, res) => {
    try {
        const ticket = await Ticket.findOne({ ticketId: req.params.ticketId });
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        // Only police/admin can view suspect photos
        if (req.user.role === 'Citizen') {
            return res.status(403).json({ error: 'Access denied' });
        }

        if (!ticket.suspectPhotoPath) {
            return res.status(404).json({ error: 'No photo attached' });
        }

        const photoPath = path.resolve(ticket.suspectPhotoPath);
        if (!fs.existsSync(photoPath)) {
            return res.status(404).json({ error: 'Photo file not found' });
        }

        res.sendFile(photoPath);
    } catch (err) {
        console.error('Get ticket photo error:', err);
        res.status(500).json({ error: 'Failed to fetch photo' });
    }
};



// @desc    Assign ticket to an officer
// @route   PUT /api/tickets/:ticketId/assign
// @access  Private (Police/Admin)
const assignTicket = async (req, res) => {
    try {
        const { assignedToId } = req.body; // ID of officer to assign to
        const ticketId = req.params.ticketId;

        const ticket = await Ticket.findOne({ ticketId });
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        // Check if officer exists and is Police/Admin
        // (Assuming you have a User model imported or can check via DB)
        // For now, we will trust the ID passed or default to current user if not provided
        const targetOfficerId = assignedToId || req.user.id;

        // Optional: Check workload of target officer (Allocation limit for officer)
        const officerActiveCases = await Ticket.countDocuments({
            assignedTo: targetOfficerId,
            status: { $ne: 'Closed' }
        });

        if (officerActiveCases >= 5) {
            return res.status(400).json({
                error: 'Officer allocation limit reached. This officer has 5 active cases.'
            });
        }

        ticket.assignedTo = targetOfficerId;
        ticket.status = 'Under Review'; // Auto-update status when assigned
        await ticket.save();

        // Log to audit trail
        const txEntry = new BlockchainTransaction({
            transactionId: `TX-${crypto.randomUUID().split('-')[0].toUpperCase()}`,
            caseId: ticketId,
            action: 'ASSIGN',
            performedBy: req.user.id,
            performedByName: req.user.name,
            performedByRole: req.user.role,
            details: `Ticket assigned to officer ID: ${targetOfficerId}`,
        });
        await txEntry.save();

        res.json({ message: 'Ticket assigned successfully', ticket });

    } catch (err) {
        console.error('Assign ticket error:', err);
        res.status(500).json({ error: 'Failed to assign ticket' });
    }
};

// @desc    Reopen a closed ticket
// @route   POST /api/tickets/:ticketId/reopen
// @access  Private (Police/Admin only)
const reopenTicket = async (req, res) => {
    try {
        const ticketId = req.params.ticketId;
        const { reason } = req.body;

        const ticket = await Ticket.findOne({ ticketId });
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        if (ticket.status !== 'Closed') {
            return res.status(400).json({ error: 'Only closed tickets can be reopened' });
        }

        // Reopen ticket
        ticket.status = 'Under Review';
        await ticket.save();

        // Log to audit trail
        const txEntry = new BlockchainTransaction({
            transactionId: `TX-${crypto.randomUUID().split('-')[0].toUpperCase()}`,
            caseId: ticketId,
            action: 'REOPEN',
            performedBy: req.user.id,
            performedByName: req.user.name,
            performedByRole: req.user.role,
            details: `Ticket reopened by ${req.user.name}. Reason: ${reason || 'Not specified'}`,
        });
        await txEntry.save();

        res.json({ message: 'Ticket reopened successfully', ticket });
    } catch (err) {
        console.error('Reopen ticket error:', err);
        res.status(500).json({ error: 'Failed to reopen ticket' });
    }
};

// @desc    Search for suspect by description
// @route   GET /api/tickets/search/suspect
// @access  Private (Police/Admin only)
const searchSuspect = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query || query.trim().length === 0) {
            return res.status(400).json({ error: 'Search query is required' });
        }

        // Search in suspect descriptions and complaint descriptions
        const results = await Ticket.find({
            $or: [
                { suspectDescription: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { citizenName: { $regex: query, $options: 'i' } },
            ]
        }).sort({ createdAt: -1 }).limit(50);

        // Format results for police view
        const formattedResults = results.map(t => ({
            _id: t._id,
            ticketId: t.ticketId,
            citizenName: t.citizenName,
            citizenEmail: t.citizenEmail,
            complaintType: t.complaintType,
            description: t.description,
            suspectDescription: t.suspectDescription,
            location: t.location,
            incidentDate: t.incidentDate,
            status: t.status,
            hasSuspectPhoto: !!t.suspectPhotoPath,
            createdAt: t.createdAt,
        }));

        res.json({
            query,
            count: formattedResults.length,
            results: formattedResults,
        });
    } catch (err) {
        console.error('Search suspect error:', err);
        res.status(500).json({ error: 'Search failed' });
    }
};

// @desc    Get tickets by status (for tracking)
// @route   GET /api/tickets/status/:status
// @access  Private (Citizen - own tickets, Police/Admin - all)
const getTicketsByStatus = async (req, res) => {
    try {
        const { status } = req.params;
        const validStatuses = ['Pending', 'Under Review', 'Verified', 'Responded', 'Closed'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        let query = { status };

        // Citizens only see their own tickets
        if (req.user.role === 'Citizen') {
            query.citizenId = req.user.id;
        }

        const tickets = await Ticket.find(query).sort({ createdAt: -1 }).limit(100);

        res.json(tickets);
    } catch (err) {
        console.error('Get tickets by status error:', err);
        res.status(500).json({ error: 'Failed to fetch tickets' });
    }
};

module.exports = {
    createTicket,
    getMyTickets,
    getAllTickets,
    getTicketById,
    verifyFace,
    respondToTicket,
    updateTicketStatus,
    getTicketPhoto,
    assignTicket,
    reopenTicket,
    searchSuspect,
    getTicketsByStatus,
};
