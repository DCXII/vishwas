const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let officerToken = '';
const testCitizenId = 'CASE_LIMIT_CIT_' + Date.now();

async function loginUser(email, password) {
    try {
        const res = await axios.post(`${BASE_URL}/users/login`, { email, password });
        return res.data.token;
    } catch (err) {
        return null; // Login failed
    }
}

async function registerUser(name, email, password, role) {
    try {
        await axios.post(`${BASE_URL}/users/register`, { name, email, password, role });
        return await loginUser(email, password);
    } catch (err) {
        if (err.response?.data?.message === 'User already exists') {
            return await loginUser(email, password);
        }
        console.error('Register failed:', err.response?.data || err.message);
        return null;
    }
}

async function runTest() {
    console.log('--- Setting up Officer ---');
    officerToken = await registerUser('Case Limit Cop', 'case_cop@test.com', '123456', 'Police');
    if (!officerToken) {
        console.error('Failed to get officer token');
        return;
    }

    console.log('--- Testing Case Allocation Limit (Max 5) ---');

    // Create 5 cases
    for (let i = 1; i <= 5; i++) {
        try {
            await axios.post(`${BASE_URL}/crime/create`, {
                citizenId: testCitizenId,
                victimName: 'Test Victim',
                crimeType: 'Theft',
                description: `Case ${i}`,
                severity: 'Low',
                location: 'Test Loc',
                evidence: 'Test Evidence'
            }, {
                headers: { 'x-auth-token': officerToken }
            });
            console.log(`Created Case ${i}: Success`);
        } catch (err) {
            console.error(`Created Case ${i}: Failed`, err.response?.data || err.message);
        }
    }

    // Attempt 6th case
    console.log('Attempting 6th case (Should Fail)...');
    try {
        await axios.post(`${BASE_URL}/crime/create`, {
            citizenId: testCitizenId,
            victimName: 'Test Victim',
            crimeType: 'Theft',
            description: `Case 6`,
            severity: 'Low',
            location: 'Test Loc',
            evidence: 'Test Evidence'
        }, {
            headers: { 'x-auth-token': officerToken }
        });
        console.error('Error: 6th Case was created but should have been rejected!');
    } catch (err) {
        if (err.response?.status === 400 && err.response.data.message.includes('limit reached')) {
            console.log('Success: 6th Case rejected as expected.');
        } else {
            console.error('Unexpected error on 6th case:', err.response?.data || err.message);
        }
    }
}

runTest();
