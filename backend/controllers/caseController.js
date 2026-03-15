const Case = require('../models/caseModel');
const User = require('../models/userModel');
const blockchainGateway = require('../blockchainGatewayV2');

/**
 * Create a new case
 */
exports.createCase = async (req, res) => {
  try {
    const {
      crimeType,
      description,
      severity,
      location,
      evidence,
      citizenId,
      caseNumber,
    } = req.body;

    // Validate required fields
    if (
      !crimeType ||
      !description ||
      !severity ||
      !location ||
      !evidence ||
      !citizenId
    ) {
      return res
        .status(400)
        .json({ message: 'All required fields must be provided' });
    }

    // Get current user
    const user = req.user;

    // Only Police and Authority can create cases
    if (!['Police', 'Authority', 'Admin'].includes(user.role)) {
      return res.status(403).json({ message: 'Unauthorized to create cases' });
    }

    // Generate case ID and case number if not provided
    const caseId = `case_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const finalCaseNumber =
      caseNumber ||
      `CASE-${Date.now().toString().slice(-6)}-${Math.random()
        .toString(36)
        .substr(2, 5)
        .toUpperCase()}`;

    // Create case in database
    const newCase = new Case({
      caseId,
      caseNumber: finalCaseNumber,
      crimeType,
      description,
      severity,
      location,
      evidence,
      citizenId,
      createdBy: user.id,
      createdByName: user.name,
      blockchainRecorded: false,
    });

    await newCase.save();

    // Record to blockchain
    try {
      const contract = await blockchainGateway.getContract();
      const blockchainResult = await contract.submitTransaction(
        'CreateCase',
        caseId,
        finalCaseNumber,
        crimeType,
        description,
        severity,
        citizenId,
        location,
        evidence,
        user.id,
        user.name,
        user.role
      );

      const result = JSON.parse(blockchainResult);

      // Update case with blockchain transaction info
      newCase.blockchainRecorded = true;
      newCase.blockchainTransactionId = result.transactionId;
      newCase.blockchainTransactions.push({
        transactionId: result.transactionId,
        action: 'CREATE',
        performedBy: user.userId,
        performedByName: user.name,
        timestamp: new Date(),
        details: `Case created by ${user.name}`,
      });

      await newCase.save();

      return res.status(201).json({
        message: 'Case created successfully',
        case: newCase,
        blockchainStatus: {
          recorded: true,
          transactionId: result.transactionId,
          hash: result.hash,
        },
      });
    } catch (blockchainError) {
      console.error('Blockchain recording failed:', blockchainError);
      // Still return success even if blockchain fails - database is primary
      return res.status(201).json({
        message: 'Case created successfully (blockchain recording pending)',
        case: newCase,
        blockchainStatus: {
          recorded: false,
          error: blockchainError.message,
        },
      });
    }
  } catch (err) {
    console.error('Error creating case:', err);
    res.status(500).json({ message: 'Error creating case', error: err.message });
  }
};

/**
 * Get all cases
 */
exports.getAllCases = async (req, res) => {
  try {
    const cases = await Case.find().sort({ createdAt: -1 });
    res.status(200).json({ cases });
  } catch (err) {
    console.error('Error fetching cases:', err);
    res.status(500).json({ message: 'Error fetching cases', error: err.message });
  }
};

/**
 * Get case by ID
 */
exports.getCaseById = async (req, res) => {
  try {
    const { caseId } = req.params;
    const caseRecord = await Case.findOne({ caseId });

    if (!caseRecord) {
      return res.status(404).json({ message: 'Case not found' });
    }

    res.status(200).json({ case: caseRecord });
  } catch (err) {
    console.error('Error fetching case:', err);
    res.status(500).json({ message: 'Error fetching case', error: err.message });
  }
};

/**
 * Get cases for a citizen
 */
exports.getCasesByCitizen = async (req, res) => {
  try {
    const { citizenId } = req.params;
    const cases = await Case.find({ citizenId }).sort({ createdAt: -1 });

    res.status(200).json({
      cases,
      total: cases.length,
    });
  } catch (err) {
    console.error('Error fetching citizen cases:', err);
    res
      .status(500)
      .json({ message: 'Error fetching cases', error: err.message });
  }
};

/**
 * Update case status
 */
exports.updateCaseStatus = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { status } = req.body;
    const user = req.user;

    // Validate status
    if (
      !['Open', 'Under Investigation', 'Closed', 'Dismissed'].includes(status)
    ) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Only Authority and Admin can update
    if (!['Authority', 'Admin'].includes(user.role)) {
      return res
        .status(403)
        .json({ message: 'Unauthorized to update cases' });
    }

    const caseRecord = await Case.findOne({ caseId });
    if (!caseRecord) {
      return res.status(404).json({ message: 'Case not found' });
    }

    // Cannot update own cases if Police
    if (user.role === 'Police' && caseRecord.createdBy === user.userId) {
      return res
        .status(403)
        .json({ message: 'Cannot update your own cases' });
    }

    const previousStatus = caseRecord.status;
    caseRecord.status = status;
    caseRecord.updatedAt = new Date();

    // Record to blockchain
    try {
      const contract = await blockchainGateway.getContract();
      const blockchainResult = await contract.submitTransaction(
        'UpdateCase',
        caseId,
        status,
        user.userId,
        user.name,
        user.role,
        previousStatus
      );

      const result = JSON.parse(blockchainResult);

      caseRecord.blockchainTransactions.push({
        transactionId: result.transactionId,
        action: 'UPDATE',
        performedBy: user.userId,
        performedByName: user.name,
        timestamp: new Date(),
        details: `Status updated from ${previousStatus} to ${status}`,
      });
    } catch (blockchainError) {
      console.error('Blockchain recording failed:', blockchainError);
    }

    await caseRecord.save();

    res.status(200).json({
      message: 'Case status updated successfully',
      case: caseRecord,
    });
  } catch (err) {
    console.error('Error updating case:', err);
    res.status(500).json({ message: 'Error updating case', error: err.message });
  }
};

/**
 * Assign case to a user
 */
exports.assignCase = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { assignedTo } = req.body;
    const user = req.user;

    // Only Authority and Admin can assign
    if (!['Authority', 'Admin'].includes(user.role)) {
      return res
        .status(403)
        .json({ message: 'Unauthorized to assign cases' });
    }

    const caseRecord = await Case.findOne({ caseId });
    if (!caseRecord) {
      return res.status(404).json({ message: 'Case not found' });
    }

    // Verify assignee exists
    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser) {
      return res.status(404).json({ message: 'Assigned user not found' });
    }

    caseRecord.assignedTo = assignedTo;
    caseRecord.updatedAt = new Date();

    // Record to blockchain
    try {
      const contract = await blockchainGateway.getContract();
      const blockchainResult = await contract.submitTransaction(
        'AssignCase',
        caseId,
        assignedTo,
        user.userId,
        user.name,
        user.role
      );

      const result = JSON.parse(blockchainResult);

      caseRecord.blockchainTransactions.push({
        transactionId: result.transactionId,
        action: 'ASSIGN',
        performedBy: user.userId,
        performedByName: user.name,
        timestamp: new Date(),
        details: `Case assigned to ${assignedUser.name}`,
      });
    } catch (blockchainError) {
      console.error('Blockchain recording failed:', blockchainError);
    }

    await caseRecord.save();

    res.status(200).json({
      message: 'Case assigned successfully',
      case: caseRecord,
    });
  } catch (err) {
    console.error('Error assigning case:', err);
    res.status(500).json({ message: 'Error assigning case', error: err.message });
  }
};

/**
 * Get case blockchain history
 */
exports.getCaseBlockchainHistory = async (req, res) => {
  try {
    const { caseId } = req.params;

    const caseRecord = await Case.findOne({ caseId });
    if (!caseRecord) {
      return res.status(404).json({ message: 'Case not found' });
    }

    // Try to get from blockchain
    try {
      const contract = await blockchainGateway.getContract();
      const history = await contract.evaluateTransaction(
        'GetCaseHistory',
        caseId
      );

      return res.status(200).json({
        caseId,
        blockchainHistory: JSON.parse(history),
        databaseHistory: caseRecord.blockchainTransactions,
      });
    } catch (blockchainError) {
      console.error('Could not fetch from blockchain:', blockchainError);
      // Return database history as fallback
      return res.status(200).json({
        caseId,
        blockchainHistory: caseRecord.blockchainTransactions,
        source: 'database',
      });
    }
  } catch (err) {
    console.error('Error fetching case history:', err);
    res
      .status(500)
      .json({ message: 'Error fetching case history', error: err.message });
  }
};

/**
 * Delete case
 */
exports.deleteCase = async (req, res) => {
  try {
    const { caseId } = req.params;
    const user = req.user;

    // Only Admin can delete
    if (user.role !== 'Admin') {
      return res
        .status(403)
        .json({ message: 'Only admins can delete cases' });
    }

    const caseRecord = await Case.findOne({ caseId });
    if (!caseRecord) {
      return res.status(404).json({ message: 'Case not found' });
    }

    await Case.deleteOne({ caseId });

    res.status(200).json({
      message: 'Case deleted successfully',
      caseId,
    });
  } catch (err) {
    console.error('Error deleting case:', err);
    res.status(500).json({ message: 'Error deleting case', error: err.message });
  }
};
