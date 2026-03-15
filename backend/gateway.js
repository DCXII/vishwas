
const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

// Check if Fabric network is available
function isFabricAvailable() {
  const ccpPath = path.resolve(__dirname, '..', 'blockchain', 'test-network', 'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
  return fs.existsSync(ccpPath);
}

async function getContract() {
  try {
    // Check if Fabric is available
    if (!isFabricAvailable()) {
      throw new Error('Hyperledger Fabric network is not configured. Please set up the Fabric test network first.');
    }

    // load the network configuration
    const ccpPath = path.resolve(__dirname, '..', 'blockchain', 'test-network', 'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    // Check to see if we've already enrolled the user.
    const identity = await wallet.get('appUser');
    if (!identity) {
      console.log('An identity for the user "appUser" does not exist in the wallet');
      console.log('Run the registerUser.js application before retrying');
      throw new Error('User identity not found in wallet');
    }

    // Create a new gateway for connecting to our peer node.
    const gateway = new Gateway();
    await gateway.connect(ccp, { 
      wallet, 
      identity: 'appUser', 
      discovery: { enabled: true, asLocalhost: true } 
    });

    // Get the network (channel) our contract is deployed to.
    const network = await gateway.getNetwork('mychannel');

    // Get the contract from the network.
    const contract = network.getContract('vishwas');

    return contract;
  } catch (error) {
    console.error(`Failed to get contract: ${error.message}`);
    throw error; // Throw error instead of exiting process
  }
}

module.exports = getContract;
module.exports.isFabricAvailable = isFabricAvailable;
