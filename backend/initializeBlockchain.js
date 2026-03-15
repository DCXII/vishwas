/**
 * Initialize Blockchain for Crime Records
 * This script initializes the blockchain ledger with existing crime records
 * and sets up the system to record all future crime-related transactions
 */

const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

async function initializeBlockchain() {
  console.log(`${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}VISHWAS Blockchain Initialization${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}\n`);

  try {
    // Step 1: Check Fabric Network
    console.log(`${colors.blue}[Step 1/3]${colors.reset} Checking Hyperledger Fabric network...\n`);
    
    const ccpPath = path.resolve(__dirname, '..', 'blockchain', 'test-network', 'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
    
    if (!fs.existsSync(ccpPath)) {
      console.log(`${colors.yellow}⚠ Fabric network not fully configured.${colors.reset}`);
      console.log(`${colors.yellow}To enable blockchain:${colors.reset}`);
      console.log(`${colors.yellow}1. Navigate to: blockchain/test-network/fabric-samples/test-network${colors.reset}`);
      console.log(`${colors.yellow}2. Run: ./network.sh up createChannel -ca${colors.reset}`);
      console.log(`${colors.yellow}3. Deploy chaincode: ./network.sh deployCC${colors.reset}\n`);
      console.log(`${colors.cyan}For now, running in SIMULATION MODE...${colors.reset}\n`);
      return simulateBlockchainInit();
    }

    // Load CCP
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
    console.log(`${colors.green}✓ Fabric configuration found${colors.reset}\n`);

    // Step 2: Connect to Network
    console.log(`${colors.blue}[Step 2/3]${colors.reset} Connecting to Fabric network...\n`);
    
    const walletPath = path.join(__dirname, 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    const identity = await wallet.get('appUser');
    if (!identity) {
      console.log(`${colors.red}✗ User identity not found${colors.reset}`);
      console.log(`${colors.yellow}Run 'node registerUser.js' first to create appUser identity${colors.reset}\n`);
      return simulateBlockchainInit();
    }

    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: 'appUser',
      discovery: { enabled: true, asLocalhost: true }
    });

    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('vishwas');

    console.log(`${colors.green}✓ Connected to network successfully${colors.reset}\n`);

    // Step 3: Initialize Ledger
    console.log(`${colors.blue}[Step 3/3]${colors.reset} Initializing blockchain ledger...\n`);

    const result = await contract.submitTransaction('InitLedger');
    console.log(`${colors.green}✓ Ledger initialized${colors.reset}`);
    console.log(`Response: ${result.toString()}\n`);

    // Fetch existing records from database and add to blockchain
    console.log(`${colors.blue}[Step 4/4]${colors.reset} Recording existing crime records to blockchain...\n`);

    try {
      const response = await axios.get('http://localhost:5000/api/crime/all', {
        headers: { 'x-auth-token': process.env.AUTH_TOKEN || 'test-token' }
      });

      const records = response.data.records || [];
      console.log(`Found ${colors.yellow}${records.length}${colors.reset} existing crime records\n`);

      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < Math.min(records.length, 10); i++) {
        const record = records[i];
        try {
          await contract.submitTransaction(
            'RecordCrimeEvent',
            record.ID || `crime_${Date.now()}_${i}`,
            record.CitizenId || 'UNKNOWN',
            record.CrimeType || 'Unknown',
            record.Description || '',
            record.Severity || 'Low',
            record.ReportedBy || 'System',
            record.Evidence || '',
            record.Location || '',
            record.CaseNumber || '',
            'SYSTEM_INIT'
          );
          successCount++;
          console.log(`  ${colors.green}✓${colors.reset} Record ${i + 1}: ${record.CaseNumber || record.ID}`);
        } catch (err) {
          errorCount++;
          console.log(`  ${colors.red}✗${colors.reset} Record ${i + 1}: ${err.message}`);
        }
      }

      console.log(`\n${colors.green}✓ Successfully recorded ${successCount} crime records to blockchain${colors.reset}`);
      if (errorCount > 0) {
        console.log(`${colors.yellow}⚠ ${errorCount} records had errors${colors.reset}`);
      }
    } catch (err) {
      console.log(`${colors.yellow}⚠ Could not fetch records from database: ${err.message}${colors.reset}`);
    }

    await gateway.disconnect();

    console.log(`\n${colors.green}========================================${colors.reset}`);
    console.log(`${colors.green}Blockchain Initialization Complete!${colors.reset}`);
    console.log(`${colors.green}========================================${colors.reset}\n`);
    console.log(`${colors.cyan}The blockchain is now ready to record crime records.${colors.reset}`);
    console.log(`${colors.cyan}All future crime transactions will be recorded immutably.${colors.reset}\n`);

  } catch (error) {
    console.error(`${colors.red}✗ Error during blockchain initialization:${colors.reset}`, error.message);
    return simulateBlockchainInit();
  }
}

/**
 * Simulate blockchain initialization when Fabric network is not available
 * This allows development to continue without a running Fabric network
 */
async function simulateBlockchainInit() {
  console.log(`${colors.blue}[SIMULATION MODE]${colors.reset} Blockchain features will be simulated\n`);

  // Create simulation metadata
  const simulationData = {
    initialized: true,
    mode: 'simulation',
    timestamp: new Date().toISOString(),
    description: 'Blockchain simulation mode - records are stored locally but not on Hyperledger Fabric',
    futureTransactions: 0
  };

  const metaPath = path.join(__dirname, '.blockchain-meta.json');
  fs.writeFileSync(metaPath, JSON.stringify(simulationData, null, 2));

  console.log(`${colors.green}✓ Blockchain simulation initialized${colors.reset}`);
  console.log(`${colors.green}✓ Crime records will be recorded with transaction history${colors.reset}`);
  console.log(`${colors.green}✓ Blockchain authentication will be tracked locally${colors.reset}\n`);

  console.log(`${colors.yellow}Note: To enable real blockchain:${colors.reset}`);
  console.log(`${colors.yellow}1. Start Fabric test network${colors.reset}`);
  console.log(`${colors.yellow}2. Deploy the chaincode${colors.reset}`);
  console.log(`${colors.yellow}3. Run this script again${colors.reset}\n`);

  return true;
}

/**
 * Check blockchain status
 */
async function checkBlockchainStatus() {
  try {
    const ccpPath = path.resolve(__dirname, '..', 'blockchain', 'test-network', 'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
    
    if (fs.existsSync(ccpPath)) {
      console.log(`${colors.green}✓ Hyperledger Fabric network is available${colors.reset}\n`);
      return 'fabric-available';
    } else {
      const metaPath = path.join(__dirname, '.blockchain-meta.json');
      if (fs.existsSync(metaPath)) {
        console.log(`${colors.cyan}~ Running in blockchain simulation mode${colors.reset}\n`);
        return 'simulation-mode';
      }
      console.log(`${colors.yellow}⚠ Blockchain not initialized${colors.reset}\n`);
      return 'not-initialized';
    }
  } catch (err) {
    return 'error';
  }
}

// Run initialization
if (require.main === module) {
  initializeBlockchain().then(() => {
    process.exit(0);
  }).catch(err => {
    console.error(`${colors.red}Fatal error:${colors.reset}`, err);
    process.exit(1);
  });
}

module.exports = {
  initializeBlockchain,
  checkBlockchainStatus,
  simulateBlockchainInit
};
