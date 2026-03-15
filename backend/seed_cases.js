/**
 * VISHWAS Crime Data Portal — Case Data Seed Script
 * Creates up to 5 cases for each citizen in the database
 * 
 * Usage: node seed_cases.js
 */

const mongoose = require('mongoose');
const config = require('./config/config');
const User = require('./models/userModel');
const Case = require('./models/caseModel');

// ── Data pools ──────────────────────────────────────────────────────
const crimeTypes = [
    'Theft', 'Robbery', 'Burglary', 'Assault', 'Fraud', 'Cybercrime',
    'Drug Trafficking', 'Vehicle Theft', 'Property Damage', 'Harassment',
    'Blackmail', 'Counterfeiting', 'Smuggling', 'Forgery', 'Embezzlement',
    'Identity Theft', 'Hit and Run', 'Trespassing', 'Vandalism', 'Stalking'
];

const descriptions = [
    'Valuable items reported missing from residence',
    'Suspicious activity reported in the area',
    'Vehicle damage reported at parking lot',
    'Financial transaction fraud detected',
    'Personal property loss incident',
    'Unauthorized access to building',
    'Goods reported stolen from storage',
    'Suspicious person observed near premises',
    'Document forgery suspected',
    'Unauthorized use of personal information'
];

const locations = [
    'Delhi', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Ahmedabad', 'Chennai',
    'Kolkata', 'Pune', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore',
    'Thane', 'Bhopal', 'Visakhapatnam', 'Patna', 'Vadodara', 'Ghaziabad',
    'Ludhiana', 'Agra', 'Nashik', 'Ranchi', 'Meerut'
];

const evidenceTypes = [
    'Photographs of the scene', 'Witness statements recorded',
    'Video surveillance footage', 'Physical evidence collected',
    'Digital records seized', 'Medical examination reports',
    'Bank statements obtained', 'Travel records reviewed',
    'Communication logs examined', 'Technical analysis completed'
];

// ── Helper functions ────────────────────────────────────────────────
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateCaseId = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return `CASE-${letters[randInt(0, 25)]}${String(Date.now()).slice(-6)}${String(Math.random()).slice(-4)}`;
};

const generateCaseNumber = (() => {
    let counter = 0;
    return () => {
        counter++;
        return `${new Date().getFullYear()}/${String(counter).padStart(6, '0')}/VISHWAS`;
    };
})();

// ── Main ────────────────────────────────────────────────────────────
const seedCases = async () => {
    try {
        await mongoose.connect(config.mongoURI);
        console.log('✅ Connected to MongoDB');

        // Clear existing cases
        const deleted = await Case.deleteMany({});
        console.log(`🗑️  Cleared ${deleted.deletedCount} existing cases`);

        // Get all citizens
        const citizens = await User.find({ role: 'Citizen' });
        console.log(`📋 Found ${citizens.length} citizens in database`);

        if (citizens.length === 0) {
            console.log('⚠️  No citizens found. Please run seed.js first to create users.');
            await mongoose.connection.close();
            process.exit(0);
        }

        // Get a sample police officer to assign cases
        const police = await User.findOne({ role: 'Police' });
        const operatorName = police ? police.name : 'System Administrator';
        const operatorId = police ? police._id.toString() : null;

        let totalCasesCreated = 0;

        // Create exactly 1 case for each citizen
        for (const citizen of citizens) {
            const newCase = new Case({
                caseId: generateCaseId(),
                caseNumber: generateCaseNumber(),
                crimeType: pick(crimeTypes),
                description: pick(descriptions),
                victimName: citizen.name,
                severity: pick(['Low', 'Medium', 'High', 'Critical']),
                status: pick(['Open', 'Under Investigation', 'Closed', 'Dismissed']),
                location: pick(locations),
                evidence: pick(evidenceTypes),
                citizenId: citizen.citizenId || citizen._id.toString(),
                createdBy: operatorId || citizen._id.toString(),
                createdByName: operatorName,
                assignedTo: operatorId || null,
                blockchainRecorded: false,
            });

            await newCase.save();
            totalCasesCreated++;

            if (totalCasesCreated % 100 === 0) {
                process.stdout.write(`\r✅ Created cases for ${totalCasesCreated}/${citizens.length} citizens`);
            }
        }

        console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('  VISHWAS Case Data Seeded Successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`  👤 Citizens:  ${citizens.length}`);
        console.log(`  📋 Cases:     ${totalCasesCreated}`);
        console.log(`  ━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`  📊 Ratio:     1 case per citizen`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        await mongoose.connection.close();
        console.log('\n✅ Database connection closed. Done!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Case seeding failed:', err.message);
        process.exit(1);
    }
};

seedCases();
