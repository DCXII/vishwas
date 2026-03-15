const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const personEnquiryController = require('../controllers/personEnquiryController');

// All routes require authentication
router.use(authMiddleware);

// @route POST /api/enquiry/search
// @desc Search for a person
// @access Private
router.post('/search', personEnquiryController.searchPerson);

// @route POST /api/enquiry/criminal-check
// @desc Check criminal record of a person
// @access Private (Police/Authority/Admin)
router.post('/criminal-check', authorizeRoles('Police', 'Authority', 'Admin'), personEnquiryController.checkCriminalRecord);

// @route GET /api/enquiry/:enquiryId
// @desc Get enquiry details
// @access Private
router.get('/:enquiryId', personEnquiryController.getEnquiryDetails);

// @route GET /api/enquiry/history/my
// @desc Get my enquiry history
// @access Private
router.get('/history/my', personEnquiryController.getMyEnquiryHistory);

// @route GET /api/enquiry/:enquiryId/report
// @desc Download enquiry report
// @access Private
router.get('/:enquiryId/report', personEnquiryController.downloadEnquiryReport);

module.exports = router;
