# VISHWAS - Blockchain-Based Identity Verification System

![VISHWAS Logo](https://img.shields.io/badge/VISHWAS-Blockchain%20Identity-blue?style=for-the-badge)

## 🌟 Project Overview

**VISHWAS** (Verifiable Identity System with Hyperledger and Secure Authentication) is a cutting-edge blockchain-based identity verification system that combines biometric authentication with distributed ledger technology. Built on Hyperledger Fabric, it provides secure, transparent, and tamper-proof identity management for modern applications.

### 🎯 Key Features

- **🔐 Biometric Authentication**: Simulated biometric scanning for enhanced security
- **⛓️ Blockchain Integration**: Hyperledger Fabric for immutable record keeping
- **🏥 Multi-Role Support**: Patient, Doctor, Authority, and Admin roles
- **🔒 JWT Security**: Token-based authentication system
- **📱 Modern UI**: React-based responsive frontend with Material-UI
- **🛡️ Data Integrity**: Cryptographic hashing and blockchain verification

### 🏗️ Technology Stack

- **Frontend**: React.js, Material-UI, Axios
- **Backend**: Node.js, Express.js, MongoDB
- **Blockchain**: Hyperledger Fabric, Go Chaincode
- **Authentication**: JWT, bcrypt
- **Database**: MongoDB
- **Containerization**: Docker (for Hyperledger Fabric)

---

## 📁 Project Structure

```
vishwas/
├── 📂 frontend/                 # React frontend application
│   ├── 📂 public/              # Static assets
│   ├── 📂 src/                 # Source code
│   │   ├── 📂 components/      # React components
│   │   │   ├── Login.js        # User login component
│   │   │   ├── Register.js     # User registration component
│   │   │   ├── Dashboard.js    # User dashboard
│   │   │   └── PrivateRoute.js # Protected route wrapper
│   │   ├── App.js              # Main application component
│   │   └── index.js            # Application entry point
│   └── package.json            # Frontend dependencies
├── 📂 backend/                 # Node.js backend server
│   ├── 📂 config/              # Configuration files
│   │   └── config.js           # Database and JWT configuration
│   ├── 📂 controllers/         # Route controllers
│   │   └── userController.js   # User management logic
│   ├── 📂 middleware/          # Express middleware
│   │   └── authMiddleware.js   # JWT authentication middleware
│   ├── 📂 models/              # Database models
│   │   └── userModel.js        # User schema definition
│   ├── 📂 routes/              # API routes
│   │   └── userRoutes.js       # User-related endpoints
│   ├── 📂 wallet/              # Hyperledger Fabric wallets
│   ├── index.js                # Server entry point
│   ├── gateway.js              # Blockchain gateway connection
│   ├── registerUser.js         # Fabric user registration
│   ├── testBlockchain.js       # Blockchain connectivity test
│   └── package.json            # Backend dependencies
├── 📂 blockchain/              # Hyperledger Fabric components
│   ├── 📂 chaincode/           # Smart contract (Go)
│   │   ├── vishwas-chaincode.go # Main chaincode logic
│   │   ├── go.mod              # Go module definition
│   │   └── go.sum              # Go dependencies
│   └── 📂 test-network/        # Fabric test network
│       └── fabric-samples/     # Official Fabric samples
├── 📄 start-vishwas.sh         # Complete application startup script
├── 📄 start-backend.sh         # Backend-only startup script
├── 📄 test-backend.sh          # Backend testing script
└── 📄 README-RUNNING-GUIDE.md  # Detailed setup instructions
```

---

## 🔧 File Descriptions

### Frontend Components

#### `frontend/src/components/Login.js`
- **Purpose**: User authentication interface
- **Features**: 
  - Email/password login form
  - Biometric scan simulation
  - JWT token management
  - Navigation to registration page
- **Usage**: Handles user login and sets authentication state

#### `frontend/src/components/Register.js`
- **Purpose**: New user registration
- **Features**:
  - Multi-field registration form (name, email, password, role)
  - Role selection (Patient, Doctor, Authority, Admin)
  - Biometric verification simulation
  - Automatic login after registration
- **Usage**: Creates new user accounts in the system

#### `frontend/src/components/Dashboard.js`
- **Purpose**: Protected user dashboard
- **Features**:
  - Display user information
  - Role-based content
  - Logout functionality
  - Blockchain record access
- **Usage**: Main interface after successful authentication

#### `frontend/src/components/PrivateRoute.js`
- **Purpose**: Route protection wrapper
- **Features**: JWT token validation
- **Usage**: Protects authenticated routes from unauthorized access

### Backend Components

#### `backend/index.js`
- **Purpose**: Express server entry point
- **Features**:
  - Server configuration
  - MongoDB connection
  - Route mounting
  - Error handling
- **Usage**: Main server file that starts the application

#### `backend/controllers/userController.js`
- **Purpose**: User management business logic
- **Features**:
  - User registration logic
  - Authentication verification
  - Password hashing
  - JWT token generation
  - Blockchain integration hooks
- **Usage**: Handles all user-related operations

#### `backend/models/userModel.js`
- **Purpose**: MongoDB user schema
- **Features**:
  - User data structure definition
  - Validation rules
  - Database methods
- **Usage**: Defines how user data is stored in MongoDB

#### `backend/routes/userRoutes.js`
- **Purpose**: API endpoint definitions
- **Endpoints**:
  - `POST /api/users/register` - User registration
  - `POST /api/users/login` - User login
  - `GET /api/users/me` - Get user profile
- **Usage**: Maps HTTP requests to controller functions

#### `backend/middleware/authMiddleware.js`
- **Purpose**: JWT authentication middleware
- **Features**:
  - Token validation
  - User identification
  - Route protection
- **Usage**: Secures protected API endpoints

#### `backend/gateway.js`
- **Purpose**: Hyperledger Fabric blockchain gateway
- **Features**:
  - Fabric network connection
  - Chaincode interaction
  - Transaction submission
- **Usage**: Interfaces with the blockchain network

#### `backend/config/config.js`
- **Purpose**: Application configuration
- **Settings**:
  - MongoDB connection string
  - JWT secret key
  - Environment variables
- **Usage**: Centralized configuration management

### Blockchain Components

#### `blockchain/chaincode/vishwas-chaincode.go`
- **Purpose**: Smart contract for identity records
- **Features**:
  - Record creation and management
  - Identity verification
  - Immutable audit trail
- **Usage**: Handles blockchain operations for identity data

### Utility Scripts

#### `start-vishwas.sh`
- **Purpose**: Complete application startup automation
- **Features**:
  - Prerequisites verification
  - MongoDB startup
  - Hyperledger Fabric network deployment
  - Chaincode installation
  - Backend and frontend service startup
- **Usage**: One-command complete system deployment

#### `start-backend.sh`
- **Purpose**: Backend-only startup script
- **Features**: Ensures correct directory and starts Node.js server
- **Usage**: Quick backend development and testing

#### `test-backend.sh`
- **Purpose**: Backend API testing
- **Features**: Automated endpoint testing with curl
- **Usage**: Verify backend functionality

---

## 🚀 Quick Start Guide

### Prerequisites

Before running VISHWAS, ensure you have:

- **Node.js** (v14+)
- **MongoDB** (v4.4+)
- **Docker** and **Docker Compose**
- **Go** (v1.19+)
- **Git**

### Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd vishwas
   ```

2. **One-Command Startup** (Recommended)
   ```bash
   chmod +x start-vishwas.sh
   ./start-vishwas.sh
   ```

3. **Manual Setup** (Advanced users)
   ```bash
   # Install backend dependencies
   cd backend && npm install
   
   # Install frontend dependencies
   cd ../frontend && npm install
   
   # Start MongoDB
   sudo systemctl start mongod
   
   # Start Hyperledger Fabric network
   cd ../blockchain/test-network/fabric-samples/test-network
   ./network.sh up createChannel -ca
   ./network.sh deployCC -ccn vishwas -ccp ../../../chaincode -ccl go
   
   # Start backend server
   cd ../../../../backend && node index.js
   
   # Start frontend (in new terminal)
   cd ../frontend && npm start
   ```

### Access Points

- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Registration Page**: http://localhost:3000/register
- **Login Page**: http://localhost:3000/login

---

## 🎮 Usage Guide

### User Registration

1. Navigate to http://localhost:3000/register
2. Fill in the registration form:
   - **Name**: Your full name
   - **Email**: Valid email address
   - **Password**: Secure password
   - **Role**: Select from Patient, Doctor, Authority, or Admin
3. Click "Simulate Biometric Scan"
4. Click "Register" to create your account

### User Login

1. Go to http://localhost:3000/login
2. Enter your registered email and password
3. Click "Simulate Biometric Scan" (required for login)
4. Click "Login" to access the dashboard

### Test Credentials

For quick testing, you can use:
- **Email**: test@example.com
- **Password**: testpass
- **Role**: Patient

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
MONGODB_URI=mongodb://localhost:27017/vishwas
JWT_SECRET=your_super_secret_jwt_key
PORT=5000
NODE_ENV=development
```

### MongoDB Configuration

Default connection: `mongodb://localhost:27017/vishwas`

### Hyperledger Fabric Configuration

The system uses the Fabric test network with:
- **Channel**: mychannel
- **Chaincode**: vishwas
- **Organizations**: Org1, Org2
- **Orderer**: orderer.example.com

---

## 🧪 Testing

### Backend API Testing
```bash
# Test server health
curl http://localhost:5000/

# Test user registration
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"testpass","role":"patient"}'

# Run automated tests
./test-backend.sh
```

### Blockchain Testing
```bash
cd backend
node testBlockchain.js
```

---

## 🐛 Troubleshooting

### Common Issues

1. **"MongoDB connection failed"**
   - Ensure MongoDB is running: `sudo systemctl start mongod`
   - Check connection string in `backend/config/config.js`

2. **"Port 5000 already in use"**
   - Kill existing processes: `pkill -f "node index.js"`
   - Use different port: Change PORT in config

3. **"Blockchain connection failed"**
   - Ensure Docker is running
   - Restart Fabric network: `./network.sh down && ./network.sh up createChannel -ca`

4. **Frontend build errors**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility

### Getting Help

For detailed troubleshooting, see:
- **Detailed Setup Guide**: `README-RUNNING-GUIDE.md`
- **Server Logs**: Check terminal output for error messages
- **MongoDB Logs**: `/var/log/mongodb/mongod.log`

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Hyperledger Fabric** community for blockchain infrastructure
- **MongoDB** for database solutions
- **React** and **Material-UI** for frontend framework
- **Node.js** and **Express** for backend development

---

## 📞 Contact

For questions or support, please contact the development team or open an issue on GitHub.

---

**Built with Blockchain Technology for Secure Identity Management**
