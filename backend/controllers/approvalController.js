const ApprovalWorkflow = require('../models/approvalWorkflowModel');
const Ticket = require('../models/ticketModel');
const BlockchainTransaction = require('../models/blockchainTransactionModel');
const crypto = require('crypto');

// Map user roles to approval levels
const ROLE_TO_LEVEL = {
    'Police': 'POLICE_STATION',
    'Authority': 'DISTRICT_AUTHORITY',
    'Admin': 'STATE_AUTHORITY'
};

// @desc    Get pending workflows for the current user's role
// @route   GET /api/approvals/pending
// @access  Private (Police/Authority/Admin)
const getPendingWorkflows = async (req, res) => {
    try {
        const userRole = req.user.role;
        const requiredLevel = ROLE_TO_LEVEL[userRole];

        if (!requiredLevel) {
            return res.status(403).json({ error: 'Not authorized to view approvals' });
        }

        // Find workflows that are globally pending
        const workflows = await ApprovalWorkflow.find({ status: 'PENDING' }).sort({ createdAt: -1 });

        // Filter down to workflows where the CURRENT pending level matches the user's role
        const pendingForUser = workflows.filter(wf => {
            // Find the first level that is pending
            const currentPendingLevel = wf.approvalLevels.find(l => l.status === 'PENDING');
            return currentPendingLevel && currentPendingLevel.level === requiredLevel;
        });

        // Enrich with ticket data for UI context
        const enrichedWorkflows = await Promise.all(pendingForUser.map(async (wf) => {
            const ticket = await Ticket.findById(wf.entityId);
            return {
                ...wf.toObject(),
                ticketDetails: ticket ? {
                    ticketId: ticket.ticketId,
                    complaintType: ticket.complaintType,
                    description: ticket.description,
                    citizenName: ticket.citizenName,
                    hasAccused: !!ticket.accusedCitizenId,
                } : null
            };
        }));

        res.json(enrichedWorkflows);
    } catch (err) {
        console.error('Get pending workflows error:', err);
        res.status(500).json({ error: 'Failed to fetch pending approvals' });
    }
};

// @desc    Approve a workflow
// @route   POST /api/approvals/:id/approve
// @access  Private (Police/Authority/Admin)
const approveWorkflow = async (req, res) => {
    try {
        const { id } = req.params;
        const { comments } = req.body;
        const userRole = req.user.role;
        const requiredLevel = ROLE_TO_LEVEL[userRole];

        const workflow = await ApprovalWorkflow.findById(id);
        if (!workflow) return res.status(404).json({ error: 'Workflow not found' });

        if (workflow.status !== 'PENDING') {
            return res.status(400).json({ error: 'Workflow is no longer pending' });
        }

        // Find the current level
        const currentLevelIndex = workflow.approvalLevels.findIndex(l => l.status === 'PENDING');
        if (currentLevelIndex === -1 || workflow.approvalLevels[currentLevelIndex].level !== requiredLevel) {
            return res.status(403).json({ error: 'You are not authorized to approve at this stage' });
        }

        // Register the approval
        const currentLevel = workflow.approvalLevels[currentLevelIndex];
        currentLevel.approvals.push({
            approvedBy: req.user.id,
            approverName: req.user.name,
            approverRole: req.user.role,
            approvedAt: new Date(),
            comments: comments || '',
            status: 'APPROVED'
        });

        // Check if level has enough approvals
        if (currentLevel.approvals.length >= currentLevel.requiredApprovals) {
            currentLevel.status = 'APPROVED';
            currentLevel.completedAt = new Date();
        }

        // Check if entirely completed
        const allLevelsApproved = workflow.approvalLevels.every(l => l.status === 'APPROVED');
        if (allLevelsApproved) {
            workflow.status = 'APPROVED';
            workflow.finalApprovedAt = new Date();

            // Advance the underlying Ticket status
            await Ticket.findByIdAndUpdate(workflow.entityId, { status: 'Under Review' });
        }

        workflow.markModified('approvalLevels');
        await workflow.save();

        // Blockchain Log
        const txEntry = new BlockchainTransaction({
            transactionId: `TX-${crypto.randomUUID().split('-')[0].toUpperCase()}`,
            caseId: workflow.entityId,
            action: 'UPDATE',
            performedBy: req.user.id,
            performedByName: req.user.name,
            performedByRole: req.user.role,
            details: `Approved workflow ${workflow.workflowId} at level ${requiredLevel}`,
        });
        await txEntry.save();

        res.json({ success: true, message: 'Workflow approved successfully', workflow });

    } catch (err) {
        console.error('Approve workflow error:', err);
        res.status(500).json({ error: 'Failed to approve workflow' });
    }
};

// @desc    Reject a workflow
// @route   POST /api/approvals/:id/reject
// @access  Private (Police/Authority/Admin)
const rejectWorkflow = async (req, res) => {
    try {
        const { id } = req.params;
        const { comments } = req.body;

        const workflow = await ApprovalWorkflow.findById(id);
        if (!workflow) return res.status(404).json({ error: 'Workflow not found' });

        if (workflow.status !== 'PENDING') {
            return res.status(400).json({ error: 'Workflow is no longer pending' });
        }

        workflow.status = 'REJECTED';
        workflow.rejectionReason = comments || 'Rejected by authority';
        workflow.rejectedAt = new Date();

        const currentLevel = workflow.approvalLevels.find(l => l.status === 'PENDING');
        if (currentLevel) {
            currentLevel.status = 'REJECTED';
        }

        workflow.markModified('approvalLevels');
        await workflow.save();

        // Advance the underlying Ticket status to Closed/Rejected
        await Ticket.findByIdAndUpdate(workflow.entityId, {
            status: 'Closed',
            policeResponse: {
                message: `Complaint rejected during hierarchical approval: ${comments || 'No reason provided'}`,
                respondedBy: req.user.id,
                respondedByName: req.user.name,
                respondedAt: new Date()
            }
        });

        // Blockchain Log
        const txEntry = new BlockchainTransaction({
            transactionId: `TX-${crypto.randomUUID().split('-')[0].toUpperCase()}`,
            caseId: workflow.entityId,
            action: 'UPDATE',
            performedBy: req.user.id,
            performedByName: req.user.name,
            performedByRole: req.user.role,
            details: `Rejected workflow ${workflow.workflowId}`,
        });
        await txEntry.save();

        res.json({ success: true, message: 'Workflow rejected successfully', workflow });

    } catch (err) {
        console.error('Reject workflow error:', err);
        res.status(500).json({ error: 'Failed to reject workflow' });
    }
};

module.exports = {
    getPendingWorkflows,
    approveWorkflow,
    rejectWorkflow
};
