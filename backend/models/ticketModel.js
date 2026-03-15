const mongoose = require('mongoose');
const crypto = require('crypto');

const ticketSchema = new mongoose.Schema({
    ticketId: {
        type: String,
        default: () => `TKT-${crypto.randomUUID().split('-')[0].toUpperCase()}`,
        unique: true,
    },
    citizenId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    citizenName: {
        type: String,
        required: true,
    },
    citizenEmail: {
        type: String,
        required: true,
    },
    complaintType: {
        type: String,
        enum: ['Theft', 'Assault', 'Fraud', 'Harassment', 'Cybercrime', 'Other'],
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    suspectDescription: {
        type: String,
        default: '',
    },
    accusedCitizenId: {
        type: String,
        default: '',
    },
    approvalWorkflowId: {
        type: String,
        default: null,
    },
    suspectPhotoPath: {
        type: String,
        default: '',
    },
    location: {
        type: String,
        default: '',
    },
    incidentDate: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ['Pending', 'Under Review', 'Verified', 'Responded', 'Closed'],
        default: 'Pending',
    },
    faceVerificationResult: {
        matched: { type: Boolean, default: null },
        score: { type: Number, default: null },
        verifiedBy: { type: String, default: null },
        verifiedAt: { type: Date, default: null },
    },
    policeResponse: {
        message: { type: String, default: '' },
        respondedBy: { type: String, default: '' },
        respondedByName: { type: String, default: '' },
        respondedAt: { type: Date, default: null },
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);
