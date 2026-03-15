import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme/theme';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import About from './components/About';
import Home from './components/Home';
import PrivateRoute from './components/PrivateRoute';
import LayoutWrapper from './layouts/LayoutWrapper';
import MyCases from './pages/cases/MyCases';
import CreateRequest from './pages/requests/CreateRequest';
import TrackRequests from './pages/requests/TrackRequests';
import CaseManagement from './pages/cases/CaseManagement';
import BlockchainRecords from './pages/blockchain/BlockchainRecords';
import BlockchainVisualization from './pages/dashboard/BlockchainVisualization';
import SystemAdmin from './pages/admin/SystemAdmin';
import FaceSearch from './pages/police/FaceSearch';
import ReviewRequests from './pages/police/ReviewRequests';
import CameraFaceDetection from './pages/police/CameraFaceDetection';
import PersonEnquiry from './pages/records/PersonEnquiry';
import config from './config';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  const setAuth = (boolean) => {
    setIsAuthenticated(boolean);
  };

  async function isAuth() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        return;
      }
      const url = config?.apiUrl ? `${config.apiUrl}/api/users/me` : '/api/users/me';
      const response = await fetch(url, {
        method: "GET",
        headers: { "x-auth-token": token }
      });

      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        localStorage.removeItem('token');
      }
    } catch (err) {
      console.error(err.message);
    }
  }

  useEffect(() => {
    isAuth();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={!isAuthenticated ? <Login setAuth={setAuth} /> : <Navigate to="/dashboard" />} />
            <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<PrivateRoute isAuthenticated={isAuthenticated}><Dashboard setAuth={setAuth} /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute isAuthenticated={isAuthenticated}><Profile setAuth={setAuth} /></PrivateRoute>} />
            <Route path="/my-cases" element={<PrivateRoute isAuthenticated={isAuthenticated}><LayoutWrapper setAuth={setAuth}><MyCases /></LayoutWrapper></PrivateRoute>} />
            <Route path="/create-ticket" element={<PrivateRoute isAuthenticated={isAuthenticated}><LayoutWrapper setAuth={setAuth}><CreateRequest /></LayoutWrapper></PrivateRoute>} />
            <Route path="/track-requests" element={<PrivateRoute isAuthenticated={isAuthenticated}><LayoutWrapper setAuth={setAuth}><TrackRequests /></LayoutWrapper></PrivateRoute>} />
            <Route path="/manage-cases" element={<PrivateRoute isAuthenticated={isAuthenticated}><LayoutWrapper setAuth={setAuth}><CaseManagement /></LayoutWrapper></PrivateRoute>} />
            <Route path="/face-search" element={<PrivateRoute isAuthenticated={isAuthenticated}><LayoutWrapper setAuth={setAuth}><FaceSearch /></LayoutWrapper></PrivateRoute>} />
            <Route path="/camera-face-detection" element={<PrivateRoute isAuthenticated={isAuthenticated}><LayoutWrapper setAuth={setAuth}><CameraFaceDetection /></LayoutWrapper></PrivateRoute>} />
            <Route path="/person-enquiry" element={<PrivateRoute isAuthenticated={isAuthenticated}><LayoutWrapper setAuth={setAuth}><PersonEnquiry /></LayoutWrapper></PrivateRoute>} />
            <Route path="/review-requests" element={<PrivateRoute isAuthenticated={isAuthenticated}><LayoutWrapper setAuth={setAuth}><ReviewRequests /></LayoutWrapper></PrivateRoute>} />
            <Route path="/blockchain" element={<PrivateRoute isAuthenticated={isAuthenticated}><LayoutWrapper setAuth={setAuth}><BlockchainRecords /></LayoutWrapper></PrivateRoute>} />
            <Route path="/blockchain-visualization" element={<PrivateRoute isAuthenticated={isAuthenticated}><LayoutWrapper setAuth={setAuth}><BlockchainVisualization /></LayoutWrapper></PrivateRoute>} />
            <Route path="/admin" element={<PrivateRoute isAuthenticated={isAuthenticated}><LayoutWrapper setAuth={setAuth}><SystemAdmin /></LayoutWrapper></PrivateRoute>} />
            <Route path="/about" element={<About />} />
            <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Home />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
