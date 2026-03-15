/**
 * Enhanced Blockchain Gateway with Simulation Support
 * Handles both real Hyperledger Fabric network and simulation mode
 */

const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

// In-memory store for blockchain simulation
const blockchainSimulation = {
  transactions: [],
  crimeRecords: {},
  enabled: false
};

/**
 * Check if Fabric network is available
 */
function isFabricAvailable() {
  try {
    const ccpPath = path.resolve(__dirname, '..', 'blockchain', 'test-network', 'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
    return fs.existsSync(ccpPath);
  } catch (err) {
    return false;
  }
}

/**
 * Enable blockchain simulation mode
 */
function enableSimulation() {
  blockchainSimulation.enabled = true;
  console.log('✓ Blockchain simulation mode enabled');
}

/**
 * Record a crime event in simulation mode
 */
function recordCrimeEventSimulation(crimeId, citizenId, crimeType, reportedBy, action = 'CREATE') {
  const transaction = {
    id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    crimeId: crimeId,
    citizenId: citizenId,
    crimeType: crimeType,
    reportedBy: reportedBy,
    action: action, // CREATE, UPDATE, DELETE, VIEW
    timestamp: new Date().toISOString(),
    status: 'RECORDED'
  };

  blockchainSimulation.transactions.push(transaction);
  blockchainSimulation.crimeRecords[crimeId] = {
    id: crimeId,
    citizenId: citizenId,
    crimeType: crimeType,
    reportedBy: reportedBy,
    createdAt: new Date().toISOString(),
    transactionHistory: [transaction]
  };

  return transaction;
}

/**
 * Get blockchain transaction history (simulation mode)
 */
function getTransactionHistorySimulation(crimeId) {
  const record = blockchainSimulation.crimeRecords[crimeId];
  if (record) {
    return record.transactionHistory;
  }
  return [];
}

/**
 * Connect to Hyperledger Fabric network and get contract
 */
async function getContract() {
  try {
    if (!isFabricAvailable()) {
      console.log('⚠ Fabric network not available - using simulation mode');
      enableSimulation();
      return createSimulatedContract();
    }

    // Load the network configuration
    const ccpPath = path.resolve(__dirname, '..', 'blockchain', 'test-network', 'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

    // Create wallet
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    // Check for user identity
    const identity = await wallet.get('appUser');
    if (!identity) {
      console.log('⚠ User identity not found - using simulation mode');
      enableSimulation();
      return createSimulatedContract();
    }

    // Connect to gateway
    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: 'appUser',
      discovery: { enabled: true, asLocalhost: true }
    });

    // Get contract
    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('vishwas');

    console.log('✓ Connected to Hyperledger Fabric network');
    return contract;

  } catch (error) {
    console.log('⚠ Could not connect to Fabric network - using simulation mode:', error.message);
    enableSimulation();
    return createSimulatedContract();
  }
}

/**
 * Create a simulated contract object that mirrors the real contract interface
 */
function createSimulatedContract() {
  return {
    submitTransaction: async (...args) => {
      const [method, ...params] = args;

      // Handle different transaction types
      if (method === 'CreateCrimeRecord' || method === 'RecordCrimeEvent') {
        const [crimeId, citizenId, crimeType, description, severity, reportedBy, evidence, location, caseNumber, initiator] = params;
        const txn = recordCrimeEventSimulation(crimeId, citizenId, crimeType, reportedBy, 'CREATE');
        return JSON.stringify({
          success: true,
          transactionId: txn.id,
          message: `Crime record ${crimeId} recorded on blockchain (simulation)`
        });
      }

      if (method === 'UpdateCrimeRecord') {
        const [crimeId, status, updatedBy] = params;
        const txn = recordCrimeEventSimulation(crimeId, '', '', updatedBy, 'UPDATE');
        return JSON.stringify({
          success: true,
          transactionId: txn.id,
          message: `Crime record ${crimeId} updated on blockchain (simulation)`
        });
      }

      return JSON.stringify({ success: true, message: 'Transaction recorded (simulation)' });
    },

    evaluateTransaction: async (...args) => {
      const [method, ...params] = args;

      if (method === 'GetCitizenCrimeRecords') {
        const citizenId = params[0];
        const records = Object.values(blockchainSimulation.crimeRecords).filter(
          r => r.citizenId === citizenId
        );
        return JSON.stringify(records);
      }

      if (method === 'GetTransactionHistory') {
        const crimeId = params[0];
        return JSON.stringify(getTransactionHistorySimulation(crimeId));
      }

      return JSON.stringify([]);
    }
  };
}

/**
 * Get blockchain statistics
 */
function getBlockchainStats() {
  return {
    mode: blockchainSimulation.enabled ? 'SIMULATION' : 'FABRIC',
    totalTransactions: blockchainSimulation.transactions.length,
    totalRecords: Object.keys(blockchainSimulation.crimeRecords).length,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  getContract,
  isFabricAvailable,
  enableSimulation,
  recordCrimeEventSimulation,
  getTransactionHistorySimulation,
  getBlockchainStats,
  blockchainSimulation
};
