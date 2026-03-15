
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Validate input
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Build user data
    const userData = {
      name,
      email,
      password,
      role,
    };

    // Generate citizenId for Citizens
    if (role === 'Citizen') {
      userData.citizenId = `CIT${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    }

    // Create a new user
    user = new User(userData);

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user to database
    await user.save();

    // Create and sign a JWT
    const payload = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        citizenId: user.citizenId,
      },
    };

    jwt.sign(
      payload,
      config.jwtSecret,
      { expiresIn: 3600 },
      (err, token) => {
        if (err) {
          console.error('JWT Error:', err);
          return res.status(500).json({ message: 'Error generating token' });
        }
        res.json({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            citizenId: user.citizenId,
          }
        });
      }
    );
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};


// @desc    Login a user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create and sign a JWT
    const payload = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        citizenId: user.citizenId,
      },
    };

    jwt.sign(
      payload,
      config.jwtSecret,
      { expiresIn: 3600 },
      (err, token) => {
        if (err) {
          console.error('JWT Error:', err);
          return res.status(500).json({ message: 'Error generating token' });
        }
        res.json({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            citizenId: user.citizenId,
          }
        });
      }
    );
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error during login' });
  }
};

const getMe = async (req, res) => {
  try {
    // Get user from database
    const user = await User.findById(req.user.id).select('-password');
    res.json({ ...user.toObject(), blockchainRecord: null });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update user profile
// @route   PUT /api/users/update
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, dateOfBirth, gender, idProof } = req.body;

    // Build update object with only provided fields
    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (phone !== undefined) updateFields.phone = phone;
    if (address !== undefined) updateFields.address = address;
    if (dateOfBirth !== undefined) updateFields.dateOfBirth = dateOfBirth;
    if (gender !== undefined) updateFields.gender = gender;
    if (idProof !== undefined) updateFields.idProof = idProof;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error('Profile update error:', err.message);
    res.status(500).json({ message: 'Server error during profile update' });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/users/all
// @access  Private (Admin)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error('Get all users error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const crypto = require('crypto');

// @desc    Generate a Zero Knowledge Proof report for the citizen
// @route   GET /api/users/zkp-report
// @access  Private (Citizen)
const generateZKPReport = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Mock ZKP: We prove "Age > 18" and "Valid Resident" without revealing exact DOB or Address
    // In a real ZKP system, this would be a mathematical proof (zk-SNARK).
    // Here we simulate it by signing the claims with the server's secret.

    const attributes = {
      isAdult: user.dateOfBirth ? (new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear() >= 18) : false,
      isValidResident: !!user.address,
      hasCleanRecord: true, // Placeholder
    };

    const proofData = {
      id: user.citizenId || user._id,
      timestamp: new Date().toISOString(),
      claims: attributes,
      issuer: 'VISHWAS_AUTHORITY_NODE',
    };

    // Create a cryptographic signature of the proof data
    const proofString = JSON.stringify(proofData);
    const signature = crypto
      .createHmac('sha256', config.jwtSecret)
      .update(proofString)
      .digest('hex');

    res.json({
      status: 'Success',
      message: 'ZKP Report Generated',
      proof: {
        data: proofData,
        signature: signature,
        verificationMethod: 'HMAC-SHA256-VISHWAS-SECRET'
      }
    });
  } catch (err) {
    console.error('ZKP Report error:', err.message);
    res.status(500).json({ message: 'Failed to generate ZKP report' });
  }
};

// @desc    Delete a user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully', user });
  } catch (err) {
    console.error('Delete user error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a user role (Admin only)
// @route   PUT /api/users/:id/role
// @access  Private (Admin)
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!role) {
      return res.status(400).json({ message: 'Role is required' });
    }

    const validRoles = ['Citizen', 'Police', 'Authority', 'Admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User role updated successfully', user });
  } catch (err) {
    console.error('Update user role error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single user (Admin only)
// @route   GET /api/users/:id
// @access  Private (Admin)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Get user error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  generateZKPReport,
  getAllUsers,
  deleteUser,
  updateUserRole,
  getUserById,
};
