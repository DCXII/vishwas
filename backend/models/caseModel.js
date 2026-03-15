const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  caseId: {
    type: String,
    unique: true,
    required: true,
  },
  caseNumber: {
    type: String,
    unique: true,
    required: true,
  },
  crimeType: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  victimName: {
    type: String,
    required: true,
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium',
  },
  status: {
    type: String,
    enum: ['Open', 'Under Investigation', 'Closed', 'Dismissed'],
    default: 'Open',
  },
  location: {
    type: String,
    required: true,
  },
  evidence: {
    type: String,
    required: true,
  },
  citizenId: {
    type: String,
    required: true,
  },
  assignedTo: {
    type: String, // User ID of police/authority
    default: null,
  },
  createdBy: {
    type: String, // User ID who created the case
    required: true,
  },
  createdByName: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  blockchainRecorded: {
    type: Boolean,
    default: false,
  },
  blockchainTransactionId: {
    type: String,
    default: null,
  },
  blockchainTransactions: [
    {
      transactionId: String,
      action: String, // CREATE, UPDATE, DELETE, ASSIGN
      performedBy: String,
      performedByName: String,
      timestamp: Date,
      details: String,
    },
  ],
});

const Case = mongoose.model('Case', caseSchema);

module.exports = Case;
