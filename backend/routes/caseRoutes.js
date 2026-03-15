const express = require('express');
const router = express.Router();
const caseController = require('../controllers/caseController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Create a new case (Police/Authority/Admin)
router.post('/create', authorizeRoles('Police', 'Authority', 'Admin'), caseController.createCase);

// Get all cases (Police/Authority/Admin)
router.get('/all', authorizeRoles('Police', 'Authority', 'Admin'), caseController.getAllCases);

// Get cases by citizen (citizen can view own, Police/Authority/Admin can view any)
router.get('/citizen/:citizenId', caseController.getCasesByCitizen);

// Get case by ID
router.get('/:caseId', caseController.getCaseById);

// Update case status (Authority/Admin only)
router.put('/:caseId/status', authorizeRoles('Authority', 'Admin'), caseController.updateCaseStatus);

// Assign case (Authority/Admin only)
router.put('/:caseId/assign', authorizeRoles('Authority', 'Admin'), caseController.assignCase);

// Get case blockchain history
router.get('/:caseId/blockchain-history', caseController.getCaseBlockchainHistory);

// Delete case (Admin only)
router.delete('/:caseId', authorizeRoles('Admin'), caseController.deleteCase);

module.exports = router;
