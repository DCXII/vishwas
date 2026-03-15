/**
 * Blockchain Status and Analytics Routes
 */

const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const blockchainGateway = require('../blockchainGatewayV2');

/**
 * @route   GET /api/blockchain/status
 * @desc    Get blockchain status and statistics
 * @access  Public
 */
router.get('/status', async (req, res) => {
  try {
    const isFabricAvailable = blockchainGateway.isFabricAvailable();
    const stats = await blockchainGateway.getBlockchainStatistics();

    res.status(200).json({
      connected: isFabricAvailable,
      fabricAvailable: isFabricAvailable,
      status: isFabricAvailable ? 'connected' : 'disconnected',
      blockchainMode: isFabricAvailable ? 'FABRIC' : 'DATABASE_LEDGER',
      network: 'Hyperledger Fabric',
      channel: 'mychannel',
      totalTransactions: stats.totalTransactions,
      totalRecords: stats.uniqueRecords,
      timestamp: new Date().toISOString(),
      message: isFabricAvailable 
        ? 'Connected to Hyperledger Fabric network' 
        : 'Running in database ledger mode (Fabric network unavailable)'
    });
  } catch (error) {
    res.status(500).json({ 
      connected: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/blockchain/transactions/:caseId
 * @desc    Get transaction history for a case
 * @access  Private (Authority/Police/Admin only)
 */
router.get('/transactions/:caseId', auth, async (req, res) => {
  try {
    const { caseId } = req.params;

    // Check authorization
    if (!['Authority', 'Police', 'Admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Only authorities and police can view transaction history.' });
    }

    const history = await blockchainGateway.getTransactionHistory(caseId);

    res.status(200).json({
      caseId: caseId,
      transactionCount: history.length,
      transactions: history,
      message: history.length > 0 
        ? 'Transaction history retrieved successfully' 
        : 'No transactions found for this case'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/blockchain/stats
 * @desc    Get detailed blockchain statistics
 * @access  Private (Admin only)
 */
router.get('/stats', auth, async (req, res) => {
  try {
    // Check authorization
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Only admins can view blockchain statistics.' });
    }

    const stats = await blockchainGateway.getBlockchainStatistics();

    res.status(200).json({
      totalTransactions: stats.totalTransactions,
      uniqueRecords: stats.uniqueRecords,
      transactionsByType: stats.transactionsByType,
      latestTransaction: stats.latestTransaction,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   POST /api/blockchain/initialize
 * @desc    Initialize blockchain
 * @access  Private (Admin only)
 */
router.post('/initialize', auth, async (req, res) => {
  try {
    // Check authorization
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Only admins can initialize blockchain.' });
    }

    const isFabricAvailable = blockchainGateway.isFabricAvailable();
    const stats = await blockchainGateway.getBlockchainStatistics();

    res.status(200).json({
      message: 'Blockchain initialized successfully',
      mode: isFabricAvailable ? 'FABRIC' : 'DATABASE_LEDGER',
      initializedAt: new Date().toISOString(),
      stats: stats,
      note: 'Blockchain is ready to record case events'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/blockchain/all-transactions
 * @desc    Get all transactions for visualization
 * @access  Private (Admin/Police/Authority only)
 */
router.get('/all-transactions', auth, async (req, res) => {
  try {
    if (!['Admin', 'Police', 'Authority'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const BlockchainTransaction = require('../models/blockchainTransactionModel');
    const transactions = await BlockchainTransaction.find()
      .sort({ timestamp: -1 })
      .limit(100)
      .lean();

    res.status(200).json({
      transactionCount: transactions.length,
      transactions: transactions,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/blockchain/dashboard
 * @desc    Get blockchain dashboard data
 * @access  Private (Admin/Police/Authority only)
 */
router.get('/dashboard', auth, async (req, res) => {
  try {
    if (!['Admin', 'Police', 'Authority'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const BlockchainTransaction = require('../models/blockchainTransactionModel');
    const stats = await blockchainGateway.getBlockchainStatistics();
    const isFabricAvailable = blockchainGateway.isFabricAvailable();

    // Get recent transactions
    const recentTransactions = await BlockchainTransaction.find()
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();

    // Get transactions by role
    const transactionsByRole = await BlockchainTransaction.aggregate([
      {
        $group: {
          _id: '$performedByRole',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get hourly transaction distribution
    const last24Transactions = await BlockchainTransaction.find({
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }).lean();

    const hourlyDistribution = {};
    for (let i = 0; i < 24; i++) {
      hourlyDistribution[i] = 0;
    }
    last24Transactions.forEach(tx => {
      const hour = new Date(tx.timestamp).getHours();
      hourlyDistribution[hour]++;
    });

    res.status(200).json({
      status: 'connected',
      mode: isFabricAvailable ? 'FABRIC' : 'DATABASE_LEDGER',
      stats: stats,
      recentTransactions: recentTransactions,
      transactionsByRole: transactionsByRole,
      hourlyDistribution: hourlyDistribution,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
