/**
 * Approval Workflow Controller
 * Handles approval requests and workflow management
 */

const ApprovalWorkflow = require('../models/approvalWorkflowModel');
const approvalWorkflowService = require('../services/approvalWorkflowService');

// @desc Get pending approvals for current user
// @route GET /api/approvals/pending
// @access Private (Police/Authority)
const getPendingApprovals = async (req, res) => {
  try {
    const userId = req.user.id;
    const approvals = await approvalWorkflowService.getPendingApprovalsForUser(userId);
    
    res.json({
      success: true,
      count: approvals.length,
      data: approvals,
    });
  } catch (error) {
    console.error('Error fetching pending approvals:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Get workflow status
// @route GET /api/approvals/:workflowId
// @access Private
const getWorkflowStatus = async (req, res) => {
  try {
    const { workflowId } = req.params;
    const workflow = await approvalWorkflowService.getWorkflowStatus(workflowId);
    
    res.json({
      success: true,
      data: workflow,
    });
  } catch (error) {
    console.error('Error fetching workflow status:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Approve workflow
// @route POST /api/approvals/:workflowId/approve
// @access Private (Police/Authority)
const approveWorkflow = async (req, res) => {
  try {
    const { workflowId } = req.params;
    const { levelType, comments } = req.body;
    const userId = req.user.id;
    
    if (!levelType) {
      return res.status(400).json({
        success: false,
        message: 'Approval level type is required',
      });
    }
    
    const workflow = await approvalWorkflowService.approveWorkflow(
      workflowId,
      userId,
      levelType,
      req.user.name,
      comments
    );
    
    res.json({
      success: true,
      message: 'Workflow approved successfully',
      data: workflow,
    });
  } catch (error) {
    console.error('Error approving workflow:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Reject workflow
// @route POST /api/approvals/:workflowId/reject
// @access Private (Police/Authority)
const rejectWorkflow = async (req, res) => {
  try {
    const { workflowId } = req.params;
    const { rejectionReason } = req.body;
    const userId = req.user.id;
    
    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required',
      });
    }
    
    const workflow = await approvalWorkflowService.rejectWorkflow(
      workflowId,
      userId,
      rejectionReason
    );
    
    res.json({
      success: true,
      message: 'Workflow rejected successfully',
      data: workflow,
    });
  } catch (error) {
    console.error('Error rejecting workflow:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Escalate workflow
// @route POST /api/approvals/:workflowId/escalate
// @access Private (Police/Authority)
const escalateWorkflow = async (req, res) => {
  try {
    const { workflowId } = req.params;
    const { escalationReason } = req.body;
    
    if (!escalationReason) {
      return res.status(400).json({
        success: false,
        message: 'Escalation reason is required',
      });
    }
    
    const workflow = await approvalWorkflowService.escalateWorkflow(
      workflowId,
      req.user.id,
      escalationReason
    );
    
    res.json({
      success: true,
      message: 'Workflow escalated successfully',
      data: workflow,
    });
  } catch (error) {
    console.error('Error escalating workflow:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Get all workflows (Admin only)
// @route GET /api/approvals/all
// @access Private (Admin)
const getAllWorkflows = async (req, res) => {
  try {
    const { status, entityType, limit = 50, offset = 0 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (entityType) filter.entityType = entityType;
    
    const workflows = await ApprovalWorkflow.find(filter)
      .populate('initiatedBy.userId')
      .populate('metadata.complaintAgainstUserId')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));
    
    const total = await ApprovalWorkflow.countDocuments(filter);
    
    res.json({
      success: true,
      total,
      count: workflows.length,
      data: workflows,
    });
  } catch (error) {
    console.error('Error fetching workflows:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getPendingApprovals,
  getWorkflowStatus,
  approveWorkflow,
  rejectWorkflow,
  escalateWorkflow,
  getAllWorkflows,
};
