const mongoose = require('mongoose');

/**
 * Approval Workflow for RBAC
 * Tracks multi-level approvals required for sensitive operations
 * such as filing complaints against authorities or other sensitive actions
 */
const approvalWorkflowSchema = new mongoose.Schema({
  workflowId: {
    type: String,
    unique: true,
    required: true,
  },
  entityType: {
    type: String,
    enum: ['CASE', 'COMPLAINT', 'COMPLAINT_AGAINST_AUTHORITY', 'CASE_UPDATE', 'DELETE_RECORD'],
    required: true,
  },
  entityId: {
    type: String,
    required: true,
  },
  initiatedBy: {
    userId: mongoose.Schema.Types.ObjectId,
    name: String,
    role: String,
  },
  initiatedAt: {
    type: Date,
    default: Date.now,
  },
  jurisdiction: {
    policeStationId: mongoose.Schema.Types.ObjectId,
    districtId: mongoose.Schema.Types.ObjectId,
    stateId: mongoose.Schema.Types.ObjectId,
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'ESCALATED'],
    default: 'PENDING',
  },
  approvalLevels: [
    {
      level: {
        type: String,
        enum: ['POLICE_STATION', 'DISTRICT_AUTHORITY', 'STATE_AUTHORITY'],
        required: true,
      },
      requiredApprovals: {
        type: Number,
        required: true,
      },
      approvals: [
        {
          approvedBy: mongoose.Schema.Types.ObjectId,
          approverName: String,
          approverRole: String,
          approvedAt: Date,
          comments: String,
          status: {
            type: String,
            enum: ['APPROVED', 'REJECTED', 'PENDING'],
          },
        }
      ],
      status: {
        type: String,
        enum: ['APPROVED', 'REJECTED', 'PENDING'],
        default: 'PENDING',
      },
      completedAt: Date,
    }
  ],
  escalationReason: String,
  escalatedTo: mongoose.Schema.Types.ObjectId,
  finalApprovedAt: Date,
  rejectionReason: String,
  rejectedAt: Date,
  metadata: {
    complaintAgainstUserId: mongoose.Schema.Types.ObjectId,
    complaintAgainstUserRole: String,
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const ApprovalWorkflow = mongoose.model('ApprovalWorkflow', approvalWorkflowSchema);

module.exports = ApprovalWorkflow;
