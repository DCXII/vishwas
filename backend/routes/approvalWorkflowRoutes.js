const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const approvalWorkflowController = require('../controllers/approvalWorkflowController');

// All routes require authentication
router.use(authMiddleware);

// @route GET /api/approvals/pending
// @desc Get pending approvals for current user
// @access Private (Police/Authority)
router.get('/pending', authorizeRoles('Police', 'Authority', 'Admin'), approvalWorkflowController.getPendingApprovals);

// @route GET /api/approvals/:workflowId
// @desc Get workflow status and details
// @access Private
router.get('/:workflowId', approvalWorkflowController.getWorkflowStatus);

// @route POST /api/approvals/:workflowId/approve
// @desc Approve workflow
// @access Private (Police/Authority)
router.post('/:workflowId/approve', authorizeRoles('Police', 'Authority', 'Admin'), approvalWorkflowController.approveWorkflow);

// @route POST /api/approvals/:workflowId/reject
// @desc Reject workflow
// @access Private (Police/Authority)
router.post('/:workflowId/reject', authorizeRoles('Police', 'Authority', 'Admin'), approvalWorkflowController.rejectWorkflow);

// @route POST /api/approvals/:workflowId/escalate
// @desc Escalate workflow
// @access Private (Police/Authority)
router.post('/:workflowId/escalate', authorizeRoles('Police', 'Authority', 'Admin'), approvalWorkflowController.escalateWorkflow);

// @route GET /api/approvals/all
// @desc Get all workflows (Admin only)
// @access Private (Admin)
router.get('/all', authorizeRoles('Admin'), approvalWorkflowController.getAllWorkflows);

module.exports = router;
