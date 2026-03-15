
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./config/config');

// Connect to MongoDB
mongoose.connect(config.mongoURI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));


const app = express();
const port = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

app.use(express.json());

// Add error handling for routes
try {
  app.use('/api/users', require('./routes/userRoutes'));
  console.log('User routes loaded successfully');
} catch (err) {
  console.error('Error loading user routes:', err);
}

try {
  app.use('/api/crime', require('./routes/crimeRoutes'));
  console.log('Crime routes loaded successfully');
} catch (err) {
  console.error('Error loading crime routes:', err);
}

try {
  app.use('/api/blockchain', require('./routes/blockchainRoutes'));
  console.log('Blockchain routes loaded successfully');
} catch (err) {
  console.error('Error loading blockchain routes:', err);
}

try {
  app.use('/api/cases', require('./routes/caseRoutes'));
  console.log('Case routes loaded successfully');
} catch (err) {
  console.error('Error loading case routes:', err);
}

try {
  app.use('/api/tickets', require('./routes/ticketRoutes'));
  console.log('Ticket routes loaded successfully');
} catch (err) {
  console.error('Error loading ticket routes:', err);
}

try {
  app.use('/api/face-search', require('./routes/faceSearchRoutes'));
  console.log('Face search routes loaded successfully');
} catch (err) {
  console.error('Error loading face search routes:', err);
}

try {
  app.use('/api/approvals', require('./routes/approvalRoutes'));
  console.log('Approval workflow routes loaded successfully');
} catch (err) {
  console.error('Error loading approval workflow routes:', err);
}

try {
  app.use('/api/enquiry', require('./routes/personEnquiryRoutes'));
  console.log('Person enquiry routes loaded successfully');
} catch (err) {
  console.error('Error loading person enquiry routes:', err);
}

// A simple route to test the server
app.get('/', (req, res) => {
  res.send('VISHWAS backend is running!');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});
