/**
 * Approval Workflow Service
 * Handles multi-level approvals for complaints and sensitive operations
 */

const ApprovalWorkflow = require('../models/approvalWorkflowModel');
const User = require('../models/userModel');
const { District, PoliceStation } = require('../models/jurisdictionModel');
const Case = require('../models/caseModel');

// @desc Generate unique workflow ID
const generateWorkflowId = () => {
  return `WF${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

// @desc Create approval workflow for complaint/case
const createApprovalWorkflow = async (entityType, entityId, initiatedBy, userId, jurisdiction, metadata = {}) => {
  try {
    const workflowId = generateWorkflowId();
    
    // Determine required approval levels based on entity type
    let approvalLevels = [];
    
    if (entityType === 'COMPLAINT_AGAINST_AUTHORITY') {
      // Complaints against authorities require multiple levels
      approvalLevels = [
        {
          level: 'POLICE_STATION',
          requiredApprovals: 2,
          approvals: [],
          status: 'PENDING',
        },
        {
          level: 'DISTRICT_AUTHORITY',
          requiredApprovals: 2,
          approvals: [],
          status: 'PENDING',
        },
        {
          level: 'STATE_AUTHORITY',
          requiredApprovals: 1,
          approvals: [],
          status: 'PENDING',
        },
      ];
    } else if (entityType === 'COMPLAINT' || entityType === 'CASE') {
      // Regular complaints need station incharge approval
      approvalLevels = [
        {
          level: 'POLICE_STATION',
          requiredApprovals: 1,
          approvals: [],
          status: 'PENDING',
        },
      ];
    }
    
    const workflow = new ApprovalWorkflow({
      workflowId,
      entityType,
      entityId,
      initiatedBy: {
        userId: userId,
        name: initiatedBy.name,
        role: initiatedBy.role,
      },
      jurisdiction,
      approvalLevels,
      metadata,
      status: 'PENDING',
    });
    
    await workflow.save();
    return workflow;
  } catch (error) {
    throw new Error(`Failed to create approval workflow: ${error.message}`);
  }
};

// @desc Get pending approvals for a user
const getPendingApprovalsForUser = async (userId) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Find workflows where current user is in approvers
    const workflows = await ApprovalWorkflow.find({
      'approvalLevels.approvals.approvedBy': { $ne: userId },
      'approvalLevels.status': 'PENDING',
      'status': 'PENDING',
    })
    .populate('initiatedBy.userId')
    .populate('metadata.complaintAgainstUserId')
    .sort({ createdAt: -1 });
    
    return workflows;
  } catch (error) {
    throw new Error(`Failed to fetch pending approvals: ${error.message}`);
  }
};

// @desc Approve workflow at specific level
const approveWorkflow = async (workflowId, userId, levelType, approverName, comments = '') => {
  try {
    const workflow = await ApprovalWorkflow.findOne({ workflowId });
    
    if (!workflow) {
      throw new Error('Workflow not found');
    }
    
    if (workflow.status !== 'PENDING') {
      throw new Error('Workflow is not in pending state');
    }
    
    const levelIndex = workflow.approvalLevels.findIndex(l => l.level === levelType);
    if (levelIndex === -1) {
      throw new Error('Invalid approval level');
    }
    
    const level = workflow.approvalLevels[levelIndex];
    
    // Add approval
    level.approvals.push({
      approvedBy: userId,
      approverName,
      approverRole: 'Authority',
      approvedAt: new Date(),
      comments,
      status: 'APPROVED',
    });
    
    // Check if level is complete (all required approvals received)
    const approvedCount = level.approvals.filter(a => a.status === 'APPROVED').length;
    
    if (approvedCount >= level.requiredApprovals) {
      level.status = 'APPROVED';
      level.completedAt = new Date();
      
      // Check if all levels are approved
      const allApproved = workflow.approvalLevels.every(l => l.status === 'APPROVED');
      if (allApproved) {
        workflow.status = 'APPROVED';
        workflow.finalApprovedAt = new Date();
      }
    }
    
    workflow.updatedAt = new Date();
    await workflow.save();
    
    return workflow;
  } catch (error) {
    throw new Error(`Failed to approve workflow: ${error.message}`);
  }
};

// @desc Reject workflow
const rejectWorkflow = async (workflowId, userId, rejectionReason) => {
  try {
    const workflow = await ApprovalWorkflow.findOne({ workflowId });
    
    if (!workflow) {
      throw new Error('Workflow not found');
    }
    
    workflow.status = 'REJECTED';
    workflow.rejectedAt = new Date();
    workflow.rejectionReason = rejectionReason;
    workflow.updatedAt = new Date();
    
    await workflow.save();
    
    return workflow;
  } catch (error) {
    throw new Error(`Failed to reject workflow: ${error.message}`);
  }
};

// @desc Escalate workflow to higher authority
const escalateWorkflow = async (workflowId, escalatedBy, escalationReason) => {
  try {
    const workflow = await ApprovalWorkflow.findOne({ workflowId });
    
    if (!workflow) {
      throw new Error('Workflow not found');
    }
    
    workflow.status = 'ESCALATED';
    workflow.escalationReason = escalationReason;
    workflow.updatedAt = new Date();
    
    await workflow.save();
    
    return workflow;
  } catch (error) {
    throw new Error(`Failed to escalate workflow: ${error.message}`);
  }
};

// @desc Get workflow status and history
const getWorkflowStatus = async (workflowId) => {
  try {
    const workflow = await ApprovalWorkflow.findOne({ workflowId })
      .populate('initiatedBy.userId')
      .populate('approvalLevels.approvals.approvedBy')
      .populate('metadata.complaintAgainstUserId');
    
    if (!workflow) {
      throw new Error('Workflow not found');
    }
    
    return workflow;
  } catch (error) {
    throw new Error(`Failed to get workflow status: ${error.message}`);
  }
};

module.exports = {
  createApprovalWorkflow,
  getPendingApprovalsForUser,
  approveWorkflow,
  rejectWorkflow,
  escalateWorkflow,
  getWorkflowStatus,
  generateWorkflowId,
};
