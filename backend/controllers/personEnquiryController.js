/**
 * Person Enquiry Controller
 * Handles person searches and background verification
 */

const PersonEnquiry = require('../models/personEnquiryModel');
const User = require('../models/userModel');
const Case = require('../models/caseModel');
const Ticket = require('../models/ticketModel');

// @desc Generate unique enquiry ID
const generateEnquiryId = () => {
  return `ENQ${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

// @desc Search for a person by various criteria
// @route POST /api/enquiry/search
// @access Private (Police/Authority/Citizen)
const searchPerson = async (req, res) => {
  try {
    const { searchType, searchValue, criteria } = req.body;
    const enquiredBy = req.user;
    
    if (!searchType || !searchValue) {
      return res.status(400).json({
        success: false,
        message: 'Search type and search value are required',
      });
    }
    
    let searchedPerson = null;
    let relatedCases = [];
    let relatedTickets = [];
    
    // Search for person
    if (searchType === 'citizenId') {
      searchedPerson = await User.findOne({ citizenId: searchValue });
    } else if (searchType === 'email') {
      searchedPerson = await User.findOne({ email: searchValue });
    } else if (searchType === 'phone') {
      searchedPerson = await User.findOne({ phone: searchValue });
    } else if (searchType === 'name') {
      searchedPerson = await User.findOne({ name: new RegExp(searchValue, 'i') });
    }
    
    if (!searchedPerson) {
      return res.status(404).json({
        success: false,
        message: 'Person not found',
      });
    }
    
    // Find related cases
    if (enquiredBy.role === 'Police' || enquiredBy.role === 'Authority' || enquiredBy.role === 'Admin') {
      relatedCases = await Case.find({
        $or: [
          { citizenId: searchedPerson.citizenId },
          { createdBy: searchedPerson._id },
        ],
      }).select('-blockchainTransactions');
      
      relatedTickets = await Ticket.find({
        $or: [
          { filedBy: searchedPerson._id },
          { 'relatedUser.userId': searchedPerson._id },
        ],
      });
    }
    
    // Create enquiry record
    const enquiryId = generateEnquiryId();
    const personEnquiry = new PersonEnquiry({
      enquiryId,
      searchedPerson: {
        name: searchedPerson.name,
        citizenId: searchedPerson.citizenId,
        phone: searchedPerson.phone,
        email: searchedPerson.email,
        address: searchedPerson.address,
        dateOfBirth: searchedPerson.dateOfBirth,
        gender: searchedPerson.gender,
        profileImage: searchedPerson.profileImage,
        faceEncoding: searchedPerson.faceEncoding,
      },
      enquiredBy: {
        userId: enquiredBy.id,
        name: enquiredBy.name,
        role: enquiredBy.role,
      },
      enquiryType: criteria?.type || 'CITIZEN_SEARCH',
      relatedCases: relatedCases.map(c => ({
        caseId: c._id,
        caseNumber: c.caseNumber,
        crimeType: c.crimeType,
        severity: c.severity,
        status: c.status,
      })),
      relatedTickets: relatedTickets.map(t => ({
        ticketId: t._id,
        ticketNumber: t.ticketNumber,
        type: t.type,
        status: t.status,
      })),
      searchNotes: criteria?.notes || '',
      isConfidential: criteria?.confidential || false,
      accessLog: [
        {
          accessedBy: enquiredBy.id,
          accessedAt: new Date(),
          action: 'CREATED',
        },
      ],
    });
    
    await personEnquiry.save();
    
    res.json({
      success: true,
      message: 'Person search completed',
      enquiryId,
      data: {
        enquiredPerson: searchedPerson,
        relatedCases,
        relatedTickets,
        totalCases: relatedCases.length,
        totalTickets: relatedTickets.length,
      },
    });
  } catch (error) {
    console.error('Error searching person:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Get person enquiry details
// @route GET /api/enquiry/:enquiryId
// @access Private
const getEnquiryDetails = async (req, res) => {
  try {
    const { enquiryId } = req.params;
    
    const enquiry = await PersonEnquiry.findOne({ enquiryId })
      .populate('enquiredBy.userId')
      .populate('relatedCases')
      .populate('relatedTickets');
    
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found',
      });
    }
    
    // Log access
    enquiry.accessLog.push({
      accessedBy: req.user.id,
      accessedAt: new Date(),
      action: 'VIEWED',
    });
    await enquiry.save();
    
    res.json({
      success: true,
      data: enquiry,
    });
  } catch (error) {
    console.error('Error fetching enquiry details:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Get my enquiry history
// @route GET /api/enquiry/history/my
// @access Private
const getMyEnquiryHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;
    
    const enquiries = await PersonEnquiry.find({ 'enquiredBy.userId': userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));
    
    const total = await PersonEnquiry.countDocuments({ 'enquiredBy.userId': userId });
    
    res.json({
      success: true,
      total,
      count: enquiries.length,
      data: enquiries,
    });
  } catch (error) {
    console.error('Error fetching enquiry history:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Download person enquiry report
// @route GET /api/enquiry/:enquiryId/report
// @access Private
const downloadEnquiryReport = async (req, res) => {
  try {
    const { enquiryId } = req.params;
    
    const enquiry = await PersonEnquiry.findOne({ enquiryId })
      .populate('relatedCases')
      .populate('relatedTickets');
    
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found',
      });
    }
    
    // Generate report format (can be extended to generate PDF)
    const report = {
      enquiryId: enquiry.enquiryId,
      generatedAt: new Date(),
      person: enquiry.searchedPerson,
      enquiryType: enquiry.enquiryType,
      relatedCases: enquiry.relatedCases,
      relatedTickets: enquiry.relatedTickets,
      enquiredBy: enquiry.enquiredBy,
      notes: enquiry.searchNotes,
    };
    
    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc Criminal record check
// @route POST /api/enquiry/criminal-check
// @access Private (Police/Authority/Admin)
const checkCriminalRecord = async (req, res) => {
  try {
    const { searchValue } = req.body;
    
    const user = await User.findOne({
      $or: [
        { citizenId: searchValue },
        { email: searchValue },
      ],
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Person not found',
      });
    }
    
    const cases = await Case.find({
      citizenId: user.citizenId,
      status: { $ne: 'Dismissed' },
    });
    
    const criminalStatus = {
      person: {
        name: user.name,
        citizenId: user.citizenId,
      },
      hasRecords: cases.length > 0,
      totalCases: cases.length,
      cases,
      severity: cases.length > 0 ? 'FLAGGED' : 'CLEAR',
    };
    
    res.json({
      success: true,
      data: criminalStatus,
    });
  } catch (error) {
    console.error('Error checking criminal record:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  searchPerson,
  getEnquiryDetails,
  getMyEnquiryHistory,
  downloadEnquiryReport,
  checkCriminalRecord,
};
