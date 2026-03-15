const mongoose = require('mongoose');

const blockchainTransactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    unique: true,
    required: true,
  },
  caseId: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    enum: ['CREATE', 'UPDATE', 'DELETE', 'ASSIGN', 'REASSIGN', 'CLOSE'],
    required: true,
  },
  performedBy: {
    type: String, // User ID
    required: true,
  },
  performedByName: {
    type: String,
    required: true,
  },
  performedByRole: {
    type: String,
    enum: ['Citizen', 'Police', 'Authority', 'Admin'],
  },
  caseDetails: {
    caseNumber: String,
    crimeType: String,
    severity: String,
    citizenId: String,
    status: String,
  },
  metadata: {
    previousStatus: String,
    newStatus: String,
    assignedTo: String,
    description: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  blockchainHash: {
    type: String,
    default: null,
  },
  verified: {
    type: Boolean,
    default: true,
  },
});

const BlockchainTransaction = mongoose.model('BlockchainTransaction', blockchainTransactionSchema);

module.exports = BlockchainTransaction;
