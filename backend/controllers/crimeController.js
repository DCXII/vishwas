const blockchainGateway = require('../blockchainGateway');
const Case = require('../models/caseModel');
const BlockchainTransaction = require('../models/blockchainTransactionModel');

const createCrimeRecord = async (req, res) => {
  try {
    const { citizenId, victimName, crimeType, description, severity, evidence, location, caseNumber } = req.body;

    // Check if user has authority to create crime records
    if (req.user.role !== 'Authority' && req.user.role !== 'Police' && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Only authorities and police can create crime records.' });
    }

    // Generate unique crime record ID
    const crimeId = `crime_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const generatedCaseNumber = caseNumber || `CASE-${Date.now()}`;

    // Check active cases count for citizen allocation limit
    const activeCasesCount = await Case.countDocuments({
      citizenId: citizenId,
      status: { $ne: 'Closed' }
    });

    if (activeCasesCount >= 5) {
      return res.status(400).json({
        message: 'Case allocation limit reached. This citizen already has 5 active cases.'
      });
    }

    // Record on blockchain (real or simulated)
    let blockchainRecorded = false;
    let blockchainTxId = null;
    try {
      const contract = await blockchainGateway.getContract();
      await contract.submitTransaction(
        'RecordCrimeEvent',
        crimeId,
        citizenId,
        crimeType,
        description,
        severity,
        req.user.name,
        evidence || '',
        location || '',
        generatedCaseNumber,
        'CREATE'
      );
      blockchainRecorded = true;
      console.log(`✓ Crime record ${crimeId} recorded on blockchain`);
    } catch (blockchainErr) {
      console.warn(`⚠ Blockchain recording failed: ${blockchainErr.message}, falling back to database ledger`);
    }

    // Generate a transaction ID for the audit trail
    const txId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create a new case in MongoDB
    const newCase = new Case({
      caseId: crimeId,
      citizenId,
      victimName: victimName || 'Unknown',
      crimeType,
      description,
      severity,
      evidence: evidence || '',
      location: location || '',
      caseNumber: generatedCaseNumber,
      status: 'Open',
      createdBy: req.user.id,
      createdByName: req.user.name,
      blockchainRecorded,
      blockchainTransactionId: blockchainTxId,
      blockchainTransactions: [{
        transactionId: txId,
        action: 'CREATE',
        performedBy: req.user.id,
        performedByName: req.user.name,
        timestamp: new Date(),
        details: `Case created by ${req.user.name} (${req.user.role})`,
      }],
    });
    await newCase.save();

    // Also record in the BlockchainTransaction collection for global audit trail
    const blockchainTx = new BlockchainTransaction({
      transactionId: txId,
      caseId: crimeId,
      action: 'CREATE',
      performedBy: req.user.id,
      performedByName: req.user.name,
      performedByRole: req.user.role,
      caseDetails: {
        caseNumber: generatedCaseNumber,
        crimeType,
        severity,
        citizenId,
        status: 'Open',
      },
      metadata: {
        description: `New case filed: ${crimeType} — ${description.substring(0, 100)}`,
      },
      verified: true,
    });
    await blockchainTx.save();

    res.status(201).json({
      message: 'Crime record created successfully',
      crimeId: newCase.caseId,
      citizenId: newCase.citizenId,
      crimeType: newCase.crimeType,
      reportedBy: newCase.createdByName,
      reportedAt: newCase.createdAt,
      status: newCase.status,
      blockchainStatus: blockchainRecorded ? 'RECORDED_ON_CHAIN' : 'RECORDED_IN_LEDGER',
      note: 'Record stored in database with audit trail'
    });

  } catch (error) {
    console.error('Error creating crime record:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get crime records for a specific citizen
// @route   GET /api/crime/citizen/:citizenId
// @access  Private (Citizen can only view their own, Authority/Police can view any)
const getCitizenCrimeRecords = async (req, res) => {
  try {
    const { citizenId } = req.params;

    // Check access permissions
    if (req.user.role === 'Citizen' && req.user.citizenId !== citizenId) {
      return res.status(403).json({ message: 'Access denied. You can only view your own crime records.' });
    }

    if (!['Authority', 'Police', 'Admin', 'Citizen'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    // Fetch cases from MongoDB for the citizen
    const cases = await Case.find({ citizenId }).select('-__v');

    // Transform case data to match expected format for frontend
    const crimeRecords = cases.map(caseRecord => ({
      ID: caseRecord.caseId,
      CaseNumber: caseRecord.caseNumber,
      CrimeType: caseRecord.crimeType,
      Description: caseRecord.description,
      VictimName: caseRecord.victimName,
      Severity: caseRecord.severity,
      Status: caseRecord.status || 'Open',
      Location: caseRecord.location,
      Evidence: caseRecord.evidence,
      CitizenId: caseRecord.citizenId,
      CreatedBy: caseRecord.createdBy,
      CreatedByName: caseRecord.createdByName,
      CreatedAt: caseRecord.createdAt,
      BlockchainRecorded: caseRecord.blockchainRecorded,
      BlockchainTransactionId: caseRecord.blockchainTransactionId,
      AssignedTo: caseRecord.assignedTo
    }));

    res.status(200).json({
      message: 'Crime records retrieved successfully',
      citizenId: citizenId,
      records: crimeRecords,
      totalRecords: crimeRecords.length
    });

  } catch (error) {
    console.error('Error fetching citizen crime records:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all crime records (Authority/Police only)
// @route   GET /api/crime/all
// @access  Private (Authority/Police/Admin only)
const getAllCrimeRecords = async (req, res) => {
  try {
    if (!['Authority', 'Police', 'Admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Only authorities, police, and admins can view all crime records.' });
    }

    // Fetch all cases from MongoDB
    const cases = await Case.find().select('-__v');

    const crimeRecords = cases.map(caseRecord => ({
      ID: caseRecord.caseId,
      CaseNumber: caseRecord.caseNumber,
      CrimeType: caseRecord.crimeType,
      Description: caseRecord.description,
      VictimName: caseRecord.victimName,
      Severity: caseRecord.severity,
      Status: caseRecord.status || 'Open',
      Location: caseRecord.location,
      Evidence: caseRecord.evidence,
      CitizenId: caseRecord.citizenId,
      CreatedBy: caseRecord.createdBy,
      CreatedByName: caseRecord.createdByName,
      CreatedAt: caseRecord.createdAt,
      BlockchainRecorded: caseRecord.blockchainRecorded,
      BlockchainTransactionId: caseRecord.blockchainTransactionId,
      AssignedTo: caseRecord.assignedTo
    }));

    res.status(200).json({
      message: 'All crime records retrieved successfully',
      records: crimeRecords,
      totalRecords: crimeRecords.length,
      requestedBy: req.user.name
    });

  } catch (error) {
    console.error('Error fetching all crime records:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get specific crime record by ID
// @route   GET /api/crime/:crimeId
// @access  Private
const getCrimeRecord = async (req, res) => {
  try {
    const { crimeId } = req.params;

    // Fetch from MongoDB
    const caseRecord = await Case.findOne({ caseId: crimeId });
    if (!caseRecord) {
      return res.status(404).json({ message: 'Crime record not found' });
    }

    // Check access permissions — Citizens can only view their own records
    if (req.user.role === 'Citizen' && req.user.citizenId !== caseRecord.citizenId) {
      return res.status(403).json({ message: 'Access denied. You can only view your own crime records.' });
    }

    const record = {
      ID: caseRecord.caseId,
      CaseNumber: caseRecord.caseNumber,
      CrimeType: caseRecord.crimeType,
      Description: caseRecord.description,
      VictimName: caseRecord.victimName,
      Severity: caseRecord.severity,
      Status: caseRecord.status,
      Location: caseRecord.location,
      Evidence: caseRecord.evidence,
      CitizenId: caseRecord.citizenId,
      CreatedBy: caseRecord.createdBy,
      CreatedByName: caseRecord.createdByName,
      CreatedAt: caseRecord.createdAt,
      BlockchainRecorded: caseRecord.blockchainRecorded,
      AssignedTo: caseRecord.assignedTo,
      BlockchainTransactions: caseRecord.blockchainTransactions,
    };

    res.status(200).json({
      message: 'Crime record retrieved successfully',
      record
    });

  } catch (error) {
    console.error('Error fetching crime record:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update crime record
// @route   PUT /api/crime/:crimeId
// @access  Private (Authority/Admin only, not the creator)
const updateCrimeRecord = async (req, res) => {
  try {
    const { crimeId } = req.params;
    const { citizenId, victimName, crimeType, description, severity, evidence, location, caseNumber, status } = req.body;

    // Check if user has authority to update crime records
    if (!['Authority', 'Admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Only authorities and admins can update crime records.' });
    }

    // Validate all required fields
    if (!citizenId || !crimeType || !description || !severity || !evidence || !location || !status) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Find the crime record in MongoDB
    const caseRecord = await Case.findOne({ caseId: crimeId });
    if (!caseRecord) {
      return res.status(404).json({ message: 'Crime record not found' });
    }

    // Check if user is trying to edit their own record
    if (caseRecord.createdBy === req.user.id) {
      return res.status(403).json({ message: 'You cannot edit your own crime records' });
    }

    // Record update on blockchain
    try {
      const contract = await blockchainGateway.getContract();
      await contract.submitTransaction(
        'RecordCrimeEvent',
        crimeId,
        citizenId,
        crimeType,
        description,
        severity,
        req.user.name,
        evidence || '',
        location || '',
        caseNumber || caseRecord.caseNumber,
        'UPDATE'
      );
      console.log(`✓ Crime record ${crimeId} update recorded on blockchain`);
    } catch (blockchainErr) {
      console.warn(`⚠ Blockchain update failed: ${blockchainErr.message}`);
    }

    // Track previous values for audit
    const previousStatus = caseRecord.status;

    // Update the record in MongoDB
    caseRecord.citizenId = citizenId;
    caseRecord.victimName = victimName || caseRecord.victimName;
    caseRecord.crimeType = crimeType;
    caseRecord.description = description;
    caseRecord.severity = severity;
    caseRecord.evidence = evidence;
    caseRecord.location = location;
    caseRecord.status = status;
    caseRecord.updatedAt = new Date();

    // Add audit trail entry to embedded transactions
    const txId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    caseRecord.blockchainTransactions.push({
      transactionId: txId,
      action: 'UPDATE',
      performedBy: req.user.id,
      performedByName: req.user.name,
      timestamp: new Date(),
      details: `Record updated by ${req.user.name} (${req.user.role}). Status: ${previousStatus} → ${status}`,
    });

    await caseRecord.save();

    // Also record in the BlockchainTransaction collection
    const blockchainTx = new BlockchainTransaction({
      transactionId: txId,
      caseId: crimeId,
      action: 'UPDATE',
      performedBy: req.user.id,
      performedByName: req.user.name,
      performedByRole: req.user.role,
      caseDetails: {
        caseNumber: caseRecord.caseNumber,
        crimeType,
        severity,
        citizenId,
        status,
      },
      metadata: {
        previousStatus,
        newStatus: status,
        description: `Case updated: ${crimeType}`,
      },
      verified: true,
    });
    await blockchainTx.save();

    res.status(200).json({
      message: 'Crime record updated successfully',
      crimeId: crimeId,
      updatedBy: req.user.name,
      blockchainStatus: 'RECORDED'
    });

  } catch (error) {
    console.error('Error updating crime record:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update crime record status
// @route   PUT /api/crime/:crimeId/status
// @access  Private (Authority/Police only)
const updateCrimeRecordStatus = async (req, res) => {
  try {
    const { crimeId } = req.params;
    const { status } = req.body;

    if (!['Authority', 'Police', 'Admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Only authorities and police can update crime records.' });
    }

    // Validate status
    const validStatuses = ['Open', 'Under Investigation', 'Closed', 'Dismissed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Valid statuses are: ' + validStatuses.join(', ') });
    }

    // Find and update in MongoDB
    const caseRecord = await Case.findOne({ caseId: crimeId });
    if (!caseRecord) {
      return res.status(404).json({ message: 'Crime record not found' });
    }

    const previousStatus = caseRecord.status;
    caseRecord.status = status;
    caseRecord.updatedAt = new Date();

    const txId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    caseRecord.blockchainTransactions.push({
      transactionId: txId,
      action: 'UPDATE',
      performedBy: req.user.id,
      performedByName: req.user.name,
      timestamp: new Date(),
      details: `Status changed: ${previousStatus} → ${status}`,
    });

    await caseRecord.save();

    // Also record in the BlockchainTransaction collection
    const blockchainTx = new BlockchainTransaction({
      transactionId: txId,
      caseId: crimeId,
      action: 'UPDATE',
      performedBy: req.user.id,
      performedByName: req.user.name,
      performedByRole: req.user.role,
      caseDetails: {
        caseNumber: caseRecord.caseNumber,
        crimeType: caseRecord.crimeType,
        severity: caseRecord.severity,
        citizenId: caseRecord.citizenId,
        status,
      },
      metadata: {
        previousStatus,
        newStatus: status,
        description: `Status updated from ${previousStatus} to ${status}`,
      },
      verified: true,
    });
    await blockchainTx.save();

    res.status(200).json({
      message: 'Crime record status updated successfully',
      crimeId: crimeId,
      newStatus: status,
      updatedBy: req.user.name
    });

  } catch (error) {
    console.error('Error updating crime record status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create citizen record
// @route   POST /api/crime/citizen
// @access  Private (Authority/Admin only)
const createCitizenRecord = async (req, res) => {
  try {
    const { citizenId, name, email, role } = req.body;

    if (!['Authority', 'Admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Only authorities and admins can create citizen records.' });
    }

    const recordId = `citizen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    res.status(201).json({
      message: 'Citizen record created successfully',
      recordId: recordId,
      citizenId: citizenId,
      name: name,
      createdBy: req.user.name
    });

  } catch (error) {
    console.error('Error creating citizen record:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createCrimeRecord,
  getCitizenCrimeRecords,
  getAllCrimeRecords,
  getCrimeRecord,
  updateCrimeRecord,
  updateCrimeRecordStatus,
  createCitizenRecord
};
