
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['Citizen', 'Police', 'Authority', 'Admin'],
    default: 'Citizen',
  },
  citizenId: {
    type: String,
    unique: true,
    sparse: true, // Allow null values but ensure uniqueness when present
  },
  phone: {
    type: String,
    default: '',
  },
  address: {
    type: String,
    default: '',
  },
  dateOfBirth: {
    type: Date,
    default: null,
  },
  gender: {
    type: String,
    enum: ['', 'male', 'female', 'other'],
    default: '',
  },
  idProof: {
    type: String,
    default: '',
  },
  faceEncoding: {
    type: [Number], // Store embedding as array of numbers
    default: [],
  },
  profileImage: {
    type: String, // Path to the image file
    default: '',
  },
  
  // Hierarchical Jurisdiction Information
  jurisdiction: {
    policeStationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PoliceStation',
    },
    policeStationName: String,
    districtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'District',
    },
    districtName: String,
    stateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'State',
    },
    stateName: String,
  },
  
  // Authority/Police specific fields
  badgeNumber: String,
  designation: String, // e.g., Inspector, Constable, Judge, etc.
  departmentCode: String,
  
  // Approval Authority Information
  approvalAuthority: {
    canApproveAtLevel: {
      type: String,
      enum: ['STATION', 'DISTRICT', 'STATE', 'NATIONAL', 'NONE'],
      default: 'NONE',
    },
    authorityLevel: Number, // 1 = Station, 2 = District, 3 = State, 4 = National
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  
  // Operational Status
  isVerified: {
    type: Boolean,
    default: false,
  },
  isSuspended: {
    type: Boolean,
    default: false,
  },
  suspensionReason: String,
  
  // Activity tracking
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0,
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
