const express = require('express');
const router = express.Router();
const { getPendingWorkflows, approveWorkflow, rejectWorkflow } = require('../controllers/approvalController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

// Get all pending approvals assigned to the current user's role layer
router.get('/pending', authMiddleware, authorizeRoles('Police', 'Authority', 'Admin'), getPendingWorkflows);

// Approve workflow
router.post('/:id/approve', authMiddleware, authorizeRoles('Police', 'Authority', 'Admin'), approveWorkflow);

// Reject workflow
router.post('/:id/reject', authMiddleware, authorizeRoles('Police', 'Authority', 'Admin'), rejectWorkflow);

module.exports = router;
