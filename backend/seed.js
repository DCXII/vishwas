/**
 * VISHWAS Crime Data Portal — Database Seed Script
 * Creates 1000 users: 1 Admin, 10 Authority, 100 Police, 889 Citizens
 * 
 * Usage: node seed.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('./config/config');
const User = require('./models/userModel');

// ── Indian name pools ───────────────────────────────────────────────
const firstNames = [
    'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan',
    'Shaurya', 'Atharv', 'Advik', 'Pranav', 'Advait', 'Dhruv', 'Kabir', 'Ritvik', 'Aarush', 'Kayaan',
    'Darsh', 'Veer', 'Sahil', 'Rohan', 'Kunal', 'Nikhil', 'Rahul', 'Amit', 'Vikram', 'Suresh',
    'Rajesh', 'Manoj', 'Ajay', 'Deepak', 'Sandeep', 'Rakesh', 'Pankaj', 'Gaurav', 'Harsh', 'Dev',
    'Ananya', 'Diya', 'Myra', 'Sara', 'Aadhya', 'Isha', 'Anvi', 'Aanya', 'Pari', 'Navya',
    'Riya', 'Priya', 'Neha', 'Pooja', 'Sneha', 'Kavya', 'Meera', 'Tanvi', 'Shreya', 'Nisha',
    'Divya', 'Swati', 'Anjali', 'Kiara', 'Sanya', 'Tara', 'Zara', 'Aisha', 'Fatima', 'Ruhi',
    'Yash', 'Karan', 'Mohit', 'Tushar', 'Vishal', 'Akash', 'Manish', 'Siddharth', 'Naveen', 'Ashok',
    'Ramesh', 'Ganesh', 'Sunil', 'Arun', 'Vijay', 'Prakash', 'Dinesh', 'Harish', 'Girish', 'Naresh',
    'Lakshmi', 'Sarita', 'Sunita', 'Geeta', 'Rekha', 'Suman', 'Kiran', 'Rani', 'Radha', 'Savita'
];

const lastNames = [
    'Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Patel', 'Reddy', 'Iyer', 'Nair', 'Joshi',
    'Mishra', 'Pandey', 'Yadav', 'Chauhan', 'Thakur', 'Mehta', 'Shah', 'Desai', 'Patil', 'Kulkarni',
    'Chopra', 'Malhotra', 'Kapoor', 'Khanna', 'Bhatia', 'Saxena', 'Agarwal', 'Bansal', 'Jain', 'Goel',
    'Rao', 'Rajan', 'Menon', 'Pillai', 'Das', 'Bose', 'Sen', 'Ghosh', 'Dutta', 'Mukherjee',
    'Tiwari', 'Dubey', 'Shukla', 'Srivastava', 'Trivedi', 'Dwivedi', 'Chaturvedi', 'Bajpai', 'Awasthi', 'Rastogi'
];

const states = [
    'Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh', 'Gujarat', 'Rajasthan',
    'West Bengal', 'Madhya Pradesh', 'Kerala', 'Telangana', 'Andhra Pradesh', 'Punjab', 'Haryana',
    'Bihar', 'Odisha', 'Jharkhand', 'Assam', 'Chhattisgarh', 'Uttarakhand'
];

const cities = [
    'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Pune',
    'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam',
    'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Ranchi', 'Meerut'
];

// ── Helper functions ────────────────────────────────────────────────
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generatePhone = () => `${pick(['98', '97', '96', '95', '94', '93', '91', '90', '89', '88', '87', '86', '85', '84', '83', '82', '81', '80', '79', '78', '77', '76', '75', '74', '73', '72', '71', '70'])}${String(randInt(10000000, 99999999))}`;

const generateAadhaar = () => `${randInt(1000, 9999)} ${randInt(1000, 9999)} ${randInt(1000, 9999)}`;

const generateDOB = (minAge, maxAge) => {
    const now = new Date();
    const year = now.getFullYear() - randInt(minAge, maxAge);
    const month = randInt(0, 11);
    const day = randInt(1, 28);
    return new Date(year, month, day);
};

const generateAddress = () => {
    const houseNo = randInt(1, 500);
    const sector = randInt(1, 50);
    const city = pick(cities);
    const state = pick(states);
    const pin = randInt(110001, 855999);
    return `${houseNo}, Sector ${sector}, ${city}, ${state} - ${pin}`;
};

const usedEmails = new Set();
const generateUniqueEmail = (firstName, lastName, domain) => {
    let email;
    let attempt = 0;
    do {
        const suffix = attempt === 0 ? '' : attempt;
        email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${suffix}@${domain}`;
        attempt++;
    } while (usedEmails.has(email));
    usedEmails.add(email);
    return email;
};

// ── Build user records ──────────────────────────────────────────────
const buildUsers = () => {
    const users = [];
    const defaultPassword = 'Vishwas@123'; // Default password for all seeded users

    // 1 Admin
    users.push({
        name: 'Rajendra Prasad',
        email: 'admin@vishwas.gov.in',
        password: defaultPassword,
        role: 'Admin',
        phone: '9000000001',
        address: 'Ministry of Home Affairs, North Block, New Delhi - 110001',
        dateOfBirth: new Date(1975, 2, 15),
        gender: 'male',
        idProof: '1234 5678 9012',
    });

    // 10 Authority
    const authorityTitles = [
        'District Magistrate', 'Commissioner', 'Joint Commissioner', 'Additional DG',
        'Inspector General', 'Superintendent', 'Deputy Commissioner', 'Sessions Judge',
        'Chief Judicial Magistrate', 'District Judge'
    ];

    // Add specifically known demo Authority user
    users.push({
        name: 'Shaurya Menon',
        email: 'shaurya.menon@authority.vishwas.gov.in',
        password: defaultPassword,
        role: 'Authority',
        phone: generatePhone(),
        address: `${authorityTitles[0]} Office, ${pick(cities)}, ${pick(states)}`,
        dateOfBirth: generateDOB(40, 60),
        gender: 'male',
        idProof: generateAadhaar(),
    });

    for (let i = 1; i < 10; i++) {
        const fn = pick(firstNames);
        const ln = pick(lastNames);
        users.push({
            name: `${fn} ${ln}`,
            email: generateUniqueEmail(fn, ln, 'authority.vishwas.gov.in'),
            password: defaultPassword,
            role: 'Authority',
            phone: generatePhone(),
            address: `${authorityTitles[i]} Office, ${pick(cities)}, ${pick(states)}`,
            dateOfBirth: generateDOB(40, 60),
            gender: pick(['male', 'female']),
            idProof: generateAadhaar(),
        });
    }

    // 100 Police
    const policeRanks = ['Constable', 'Head Constable', 'ASI', 'SI', 'Inspector', 'DSP', 'SP', 'ACP', 'DCP', 'AIG'];

    // Add specifically known demo Police user
    users.push({
        name: 'Advait Trivedi',
        email: 'advait.trivedi@police.vishwas.gov.in',
        password: defaultPassword,
        role: 'Police',
        phone: generatePhone(),
        address: `Inspector Office, ${pick(cities)} Police Station, ${pick(states)}`,
        dateOfBirth: generateDOB(25, 55),
        gender: 'male',
        idProof: generateAadhaar(),
    });

    for (let i = 1; i < 100; i++) {
        const fn = pick(firstNames);
        const ln = pick(lastNames);
        users.push({
            name: `${fn} ${ln}`,
            email: generateUniqueEmail(fn, ln, 'police.vishwas.gov.in'),
            password: defaultPassword,
            role: 'Police',
            phone: generatePhone(),
            address: `${pick(policeRanks)} Office, ${pick(cities)} Police Station, ${pick(states)}`,
            dateOfBirth: generateDOB(25, 55),
            gender: pick(['male', 'female']),
            idProof: generateAadhaar(),
        });
    }

    // 889 Citizens
    // Add specifically known demo Citizen user
    users.push({
        name: 'Harsh Yadav',
        email: 'harsh.yadav@gmail.com',
        password: defaultPassword,
        role: 'Citizen',
        citizenId: `CIT${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        phone: generatePhone(),
        address: generateAddress(),
        dateOfBirth: generateDOB(18, 70),
        gender: 'male',
        idProof: generateAadhaar(),
    });

    for (let i = 1; i < 889; i++) {
        const fn = pick(firstNames);
        const ln = pick(lastNames);
        users.push({
            name: `${fn} ${ln}`,
            email: generateUniqueEmail(fn, ln, 'gmail.com'),
            password: defaultPassword,
            role: 'Citizen',
            citizenId: `CIT${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
            phone: generatePhone(),
            address: generateAddress(),
            dateOfBirth: generateDOB(18, 70),
            gender: pick(['male', 'female', 'other']),
            idProof: generateAadhaar(),
        });
    }

    return users;
};

// ── Main ────────────────────────────────────────────────────────────
const seed = async () => {
    try {
        await mongoose.connect(config.mongoURI);
        console.log('✅ Connected to MongoDB');

        // Clear existing users
        const deleted = await User.deleteMany({});
        console.log(`🗑️  Cleared ${deleted.deletedCount} existing users`);

        // Hash password once (same for all)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Vishwas@123', salt);

        // Build and insert users
        const rawUsers = buildUsers();
        const usersToInsert = rawUsers.map(u => ({
            ...u,
            password: hashedPassword,
        }));

        await User.insertMany(usersToInsert);

        // Print summary
        const counts = { Admin: 0, Authority: 0, Police: 0, Citizen: 0 };
        usersToInsert.forEach(u => counts[u.role]++);

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('  VISHWAS Database Seeded Successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`  👑 Admin:     ${counts.Admin}`);
        console.log(`  🏛️  Authority: ${counts.Authority}`);
        console.log(`  🛡️  Police:    ${counts.Police}`);
        console.log(`  👤 Citizens:  ${counts.Citizen}`);
        console.log(`  ━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`  📊 Total:     ${usersToInsert.length}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n🔑 Default password for ALL users: Vishwas@123');
        console.log('\n📧 Key accounts:');
        console.log('   Admin:     admin@vishwas.gov.in');
        console.log('   Authority: <name>@authority.vishwas.gov.in');
        console.log('   Police:    <name>@police.vishwas.gov.in');
        console.log('   Citizens:  <name>@gmail.com');

        await mongoose.connection.close();
        console.log('\n✅ Database connection closed. Done!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err.message);
        process.exit(1);
    }
};

seed();
