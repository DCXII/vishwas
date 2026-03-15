
'use strict';

const FabricCAServices = require('fabric-ca-client');
const { Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

async function main() {
  try {
    // load the network configuration
    const ccpPath = path.resolve(__dirname, '..', 'blockchain', 'test-network', 'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

    // Create a new CA client for interacting with the CA.
    const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
    const caTLSCACerts = caInfo.tlsCACerts.pem;
    const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    // Check to see if we've already enrolled the admin user.
    const adminIdentity = await wallet.get('admin');
    if (adminIdentity) {
      console.log('An identity for the admin user "admin" already exists in the wallet');
      return;
    }

    // Enroll the admin user, and import the new identity into the wallet.
    const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: 'Org1MSP',
      type: 'X.509',
    };
    await wallet.put('admin', x509Identity);
    console.log('Successfully enrolled admin user "admin" and imported it into the wallet');

    // Check to see if we've already enrolled the app user.
    const appUserIdentity = await wallet.get('appUser');
    if (appUserIdentity) {
      console.log('An identity for the user "appUser" already exists in the wallet');
      return;
    }

    const adminUser = await wallet.get('admin');
    if (!adminUser) {
      console.log('An identity for the admin user "admin" does not exist in the wallet');
      return;
    }

    // build a user object for authenticating with the CA
    const provider = wallet.getProviderRegistry().getProvider(adminUser.type);
    const adminUserObj = await provider.getUserContext(adminUser, 'admin');

    // Register the user, enroll the user, and import the new identity into the wallet.
    const secret = await ca.register({ affiliation: 'org1.department1', enrollmentID: 'appUser', role: 'client' }, adminUserObj);
    const appUserEnrollment = await ca.enroll({ enrollmentID: 'appUser', enrollmentSecret: secret });
    const appUserX509Identity = {
      credentials: {
        certificate: appUserEnrollment.certificate,
        privateKey: appUserEnrollment.key.toBytes(),
      },
      mspId: 'Org1MSP',
      type: 'X.509',
    };
    await wallet.put('appUser', appUserX509Identity);
    console.log('Successfully registered and enrolled user "appUser" and imported it into the wallet');

  } catch (error) {
    console.error(`Failed to register user: ${error}`);
    process.exit(1);
  }
}

main();
