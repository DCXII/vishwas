
const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, updateProfile, generateZKPReport, getAllUsers, deleteUser, updateUserRole, getUserById } = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const getContract = require('../gateway');

// @route   POST api/users/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerUser);

// @route   POST api/users/login
// @desc    Login a user
// @access  Public
router.post('/login', loginUser);

// @route   GET api/users/me
// @desc    Get user data
// @access  Private
router.get('/me', auth, getMe);

// @route   PUT api/users/update
// @desc    Update user profile
// @access  Private
router.put('/update', auth, updateProfile);

// @route   GET api/users/zkp-report
// @desc    Generate ZKP Proof for Citizen
// @access  Private
router.get('/zkp-report', auth, generateZKPReport);

// @route   GET api/users
// @desc    Get all users (Admin only)
// @access  Private (Admin)
router.get('/', auth, authorizeRoles('Admin'), getAllUsers);

// @route   GET api/users/:id
// @desc    Get single user (Admin only)
// @access  Private (Admin)
router.get('/:id', auth, authorizeRoles('Admin'), getUserById);

// @route   DELETE api/users/:id
// @desc    Delete a user (Admin only)
// @access  Private (Admin)
router.delete('/:id', auth, authorizeRoles('Admin'), deleteUser);

// @route   PUT api/users/:id/role
// @desc    Update user role (Admin only)
// @access  Private (Admin)
router.put('/:id/role', auth, authorizeRoles('Admin'), updateUserRole);

// @route   GET api/users/all
// @desc    Get all users (Admin only)
// @access  Private (Admin)
router.get('/all', auth, authorizeRoles('Admin'), getAllUsers);

// @route   GET api/users/blockchain/records
// @desc    Get all blockchain records (Police, Authority, Admin only)
// @access  Private
router.get('/blockchain/records', auth, authorizeRoles('Police', 'Authority', 'Admin'), async (req, res) => {
  try {
    const contract = await getContract();
    const result = await contract.evaluateTransaction('GetAllRecords');
    const records = JSON.parse(result.toString());
    res.json({
      success: true,
      records
    });
  } catch (err) {
    console.error('Blockchain query error:', err.message);

    // Check if it's a Fabric availability issue
    if (err.message.includes('Hyperledger Fabric') || err.message.includes('no such file')) {
      return res.status(503).json({
        success: false,
        error: 'Blockchain network unavailable',
        message: 'Hyperledger Fabric is not configured.',
        code: 'FABRIC_UNAVAILABLE'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to fetch blockchain records',
      message: err.message
    });
  }
});

// @route   GET api/users/blockchain/citizen/:id
// @desc    Get citizen record from blockchain (Police, Authority, Admin only)
// @access  Private
router.get('/blockchain/citizen/:id', auth, authorizeRoles('Police', 'Authority', 'Admin'), async (req, res) => {
  try {
    const contract = await getContract();
    const result = await contract.evaluateTransaction('ReadRecord', req.params.id);
    const record = JSON.parse(result.toString());
    res.json({ success: true, record });
  } catch (err) {
    console.error('Blockchain query error:', err.message);

    // Check if it's a Fabric availability issue
    if (err.message.includes('Hyperledger Fabric') || err.message.includes('no such file')) {
      return res.status(503).json({
        success: false,
        error: 'Blockchain network unavailable',
        message: 'Hyperledger Fabric is not configured.',
        code: 'FABRIC_UNAVAILABLE'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to fetch blockchain record',
      message: err.message
    });
  }
});

module.exports = router;
