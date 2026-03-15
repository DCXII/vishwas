const mongoose = require('mongoose');

/**
 * Person Enquiry/Search Model
 * Allows users to search and enquire about persons without filing formal complaints
 * Contains personal information and criminal record associations
 */
const personEnquirySchema = new mongoose.Schema({
  enquiryId: {
    type: String,
    unique: true,
    required: true,
  },
  searchedPerson: {
    name: {
      type: String,
      required: true,
    },
    citizenId: String,
    phone: String,
    email: String,
    address: String,
    dateOfBirth: Date,
    gender: String,
    profileImage: String,
    faceEncoding: [Number],
  },
  enquiredBy: {
    userId: mongoose.Schema.Types.ObjectId,
    name: String,
    role: String,
    location: String,
  },
  enquiryType: {
    type: String,
    enum: ['CITIZEN_SEARCH', 'CRIMINAL_RECORD_CHECK', 'BACKGROUND_VERIFICATION', 'SUSPECT_IDENTIFICATION'],
    default: 'CITIZEN_SEARCH',
  },
  relatedCases: [
    {
      caseId: mongoose.Schema.Types.ObjectId,
      caseNumber: String,
      crimeType: String,
      severity: String,
      status: String,
    }
  ],
  relatedTickets: [
    {
      ticketId: mongoose.Schema.Types.ObjectId,
      ticketNumber: String,
      type: String,
      status: String,
    }
  ],
  criminalRecords: [
    {
      recordId: mongoose.Schema.Types.ObjectId,
      offenseType: String,
      date: Date,
      status: String,
      court: String,
    }
  ],
  searchNotes: String,
  isConfidential: {
    type: Boolean,
    default: false,
  },
  accessLog: [
    {
      accessedBy: mongoose.Schema.Types.ObjectId,
      accessedAt: Date,
      action: String,
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const PersonEnquiry = mongoose.model('PersonEnquiry', personEnquirySchema);

module.exports = PersonEnquiry;
