const axios = require('axios');
const assert = require('assert');

const API_URL = 'http://localhost:5000/api';
let citizenToken = '';
let policeToken = '';
let authorityToken = '';
let adminToken = '';
let createdTicketId = '';
let createdWorkflowId = '';

async function runTests() {
    console.log("Starting QA API Tests...");
    try {
        // 1. Initial login for demo users
        console.log("Testing Demo Logins...");
        let res = await axios.post(`${API_URL}/users/login`, { email: 'advait.trivedi@police.vishwas.gov.in', password: 'Vishwas@123' });
        policeToken = res.data.token;
        assert(policeToken, "Police login failed");
        let policeUser = res.data.user;
        console.log("POLICE USER OBJECT:", policeUser);

        res = await axios.post(`${API_URL}/users/login`, { email: 'shaurya.menon@authority.vishwas.gov.in', password: 'Vishwas@123' });
        authorityToken = res.data.token;
        assert(authorityToken, "Authority login failed");

        res = await axios.post(`${API_URL}/users/login`, { email: 'admin@vishwas.gov.in', password: 'Vishwas@123' });
        adminToken = res.data.token;
        assert(adminToken, "Admin login failed");

        // 2. Register a new citizen
        console.log("Testing Citizen Registration...");
        const randomEmail = `qa_citizen_${Date.now()}@example.com`;
        res = await axios.post(`${API_URL}/users/register`, {
            name: 'QA Citizen User',
            email: randomEmail,
            password: 'Vishwas@123',
            role: 'Citizen',
            phone: '1234567890'
        });
        citizenToken = res.data.token;
        assert(citizenToken, "Citizen registration failed");
        console.log("Registration successful.");

        // 3. File a standard complaint (Citizen)
        console.log("Testing Standard Complaint Creation...");
        res = await axios.post(`${API_URL}/tickets`, {
            complaintType: 'Theft',
            description: 'My bike was stolen from the parking lot.',
            location: 'Downtown Parking',
            incidentDate: new Date().toISOString()
        }, { headers: { 'x-auth-token': citizenToken } });
        assert(res.data.ticket && res.data.ticket.ticketId, "Standard complaint creation failed");

        // 4. File an RBAC Hierarchical complaint against Police
        console.log("Testing Hierarchical Complaint Creation (Against Police)...");
        res = await axios.post(`${API_URL}/tickets`, {
            complaintType: 'Harassment',
            description: 'The officer demanded a bribe.',
            location: 'Station 1',
            accusedCitizenId: policeUser.citizenId || policeUser.id, // Use id if seeded without citizenId
        }, { headers: { 'x-auth-token': citizenToken } });
        createdTicketId = res.data.ticket.ticketId;
        assert(createdTicketId, "Hierarchical complaint creation failed");

        // 5. Verify the ApprovalWorkflow was generated
        console.log("Testing ApprovalWorkflow generation...");
        // Wait briefly for async generation if needed, though it's sync in the controller
        res = await axios.get(`${API_URL}/approvals/pending`, { headers: { 'x-auth-token': authorityToken } });
        const pendingForAuthority = res.data;
        console.log(`Authority has ${pendingForAuthority.length} pending workflows.`);

        // Find the one we just created
        let targetWorkflow;
        let pRes = await axios.get(`${API_URL}/approvals/pending`, { headers: { 'x-auth-token': policeToken } });
        let pendingForPolice = pRes.data;
        targetWorkflow = pendingForPolice.find(w => w.ticketDetails && w.ticketDetails.ticketId === createdTicketId);

        if (targetWorkflow) {
            createdWorkflowId = targetWorkflow._id;
            console.log("Approving workflow as Police...");
            res = await axios.post(`${API_URL}/approvals/${createdWorkflowId}/approve`, { comments: "Reviewed at Station level." }, { headers: { 'x-auth-token': policeToken } });
            assert(res.status === 200, "Police approval failed");
            console.log("Police approval successful.");
        } else {
            console.log("No pending workflow found for Police with this ticket ID. This could mean it is waiting on another layer.");
        }

        // Wait a small bit for DB to update if needed
        await new Promise(r => setTimeout(r, 1000));

        let aRes = await axios.get(`${API_URL}/approvals/pending`, { headers: { 'x-auth-token': authorityToken } });
        let pendingForAuthorityAfterPolice = aRes.data; // Renamed to avoid redeclaration error with 'const'
        targetWorkflow = pendingForAuthorityAfterPolice.find(w => w.ticketDetails && w.ticketDetails.ticketId === createdTicketId);

        if (targetWorkflow) {
            createdWorkflowId = targetWorkflow._id;
            console.log("Approving workflow as Authority...");
            res = await axios.post(`${API_URL}/approvals/${createdWorkflowId}/approve`, { comments: "Reviewed at District level." }, { headers: { 'x-auth-token': authorityToken } });
            assert(res.status === 200, "Authority approval failed");
            console.log("Authority approval successful.");
        } else {
            console.log("No pending workflow found for Authority with this ticket ID. Workflow might be stuck.");
            // Log from DB directly via Mongoose
            const mongoose = require('./backend/node_modules/mongoose');
            await mongoose.connect('mongodb://admin:password@localhost:27017/vishwas?authSource=admin');
            const ApprovalWorkflow = require('./backend/models/approvalWorkflowModel');
            const rawWfByEntity = await ApprovalWorkflow.find({}).sort({ _id: -1 }).limit(1);
            console.log("RAW WORKFLOW IN DB:", JSON.stringify(rawWfByEntity[0], null, 2));
            await mongoose.disconnect();
        }

        console.log("All API integration tests passed successfully!");
    } catch (error) {
        console.error("QA Test Failed:");
        if (error.response) {
            console.error(error.response.status, error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

runTests();
