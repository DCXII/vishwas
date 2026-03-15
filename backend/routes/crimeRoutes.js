const express = require('express');
const router = express.Router();
const {
  createCrimeRecord,
  getCitizenCrimeRecords,
  getAllCrimeRecords,
  getCrimeRecord,
  updateCrimeRecord,
  updateCrimeRecordStatus,
  createCitizenRecord
} = require('../controllers/crimeController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

// @route   POST /api/crime/create
// @desc    Create a new crime record
// @access  Private (Police/Authority/Admin)
router.post('/create', authMiddleware, authorizeRoles('Police', 'Authority', 'Admin'), createCrimeRecord);

// @route   GET /api/crime/all
// @desc    Get all crime records
// @access  Private (Police/Authority/Admin)
router.get('/all', authMiddleware, authorizeRoles('Police', 'Authority', 'Admin'), getAllCrimeRecords);

// @route   GET /api/crime/citizen/:citizenId
// @desc    Get crime records for a specific citizen
// @access  Private (Citizen can only view their own, Authority/Police can view any)
router.get('/citizen/:citizenId', authMiddleware, getCitizenCrimeRecords);

// @route   GET /api/crime/:crimeId
// @desc    Get specific crime record by ID
// @access  Private
router.get('/:crimeId', authMiddleware, getCrimeRecord);

// @route   PUT /api/crime/:crimeId
// @desc    Update crime record
// @access  Private (Authority/Admin only, not the creator)
router.put('/:crimeId', authMiddleware, authorizeRoles('Authority', 'Admin'), updateCrimeRecord);

// @route   PUT /api/crime/:crimeId/status
// @desc    Update crime record status
// @access  Private (Authority/Police/Admin)
router.put('/:crimeId/status', authMiddleware, authorizeRoles('Authority', 'Police', 'Admin'), updateCrimeRecordStatus);

// @route   POST /api/crime/citizen
// @desc    Create citizen record
// @access  Private (Authority/Admin only)
router.post('/citizen', authMiddleware, authorizeRoles('Authority', 'Admin'), createCitizenRecord);

module.exports = router;
