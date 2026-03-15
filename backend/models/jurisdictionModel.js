const mongoose = require('mongoose');

/**
 * State Level - Top level jurisdiction
 * Overseen by High Court
 */
const stateSchema = new mongoose.Schema({
  stateId: {
    type: String,
    unique: true,
    required: true,
  },
  stateName: {
    type: String,
    required: true,
    unique: true,
  },
  highCourtId: {
    type: String,
    required: true,
  },
  highCourtName: {
    type: String,
    required: true,
  },
  supervisorUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  districtCount: {
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

/**
 * District Level - Under State
 * Overseen by District Court (Authority)
 */
const districtSchema = new mongoose.Schema({
  districtId: {
    type: String,
    unique: true,
    required: true,
  },
  districtName: {
    type: String,
    required: true,
  },
  stateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'State',
    required: true,
  },
  districtCourtId: {
    type: String,
    required: true,
  },
  courtName: {
    type: String,
    required: true,
  },
  supervisorUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  policeStationCount: {
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

/**
 * Police Station Level - Under District
 * Jurisdiction for citizens and police
 */
const policeStationSchema = new mongoose.Schema({
  stationId: {
    type: String,
    unique: true,
    required: true,
  },
  stationName: {
    type: String,
    required: true,
  },
  districtId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'District',
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  jurisdiction: {
    type: String,
    required: true,
  },
  stationInchargeUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  policeOfficers: [
    {
      userId: mongoose.Schema.Types.ObjectId,
      name: String,
      badge: String,
    }
  ],
  citizenCount: {
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

const State = mongoose.model('State', stateSchema);
const District = mongoose.model('District', districtSchema);
const PoliceStation = mongoose.model('PoliceStation', policeStationSchema);

module.exports = { State, District, PoliceStation };
