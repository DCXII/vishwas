import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import axios from 'axios';
import MainLayout from '../layouts/MainLayout';
import Loading from './common/Loading';
import CitizenDashboard from '../pages/dashboard/CitizenDashboard';
import PoliceDashboard from '../pages/dashboard/PoliceDashboard';
import AdminDashboard from '../pages/dashboard/AdminDashboard';
import AuthorityDashboard from '../pages/dashboard/AuthorityDashboard';
import config from '../config';

const Dashboard = ({ setAuth }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Data State
  const [crimeRecords, setCrimeRecords] = useState([]);
  const [myRequests, setMyRequests] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = config?.apiUrl ? `${config.apiUrl}/api/users/me` : '/api/users/me';
        const res = await axios.get(url, {
          headers: { 'x-auth-token': localStorage.token }
        });
        setUser(res.data);

        // Fetch Role Specific Data
        if (res.data.role === 'Citizen') {
          const baseUrl = config?.apiUrl || '';
          const crimeRes = await axios.get(`${baseUrl}/api/crime/citizen/${res.data.citizenId}`, {
            headers: { 'x-auth-token': localStorage.token }
          });
          setCrimeRecords(crimeRes.data.records || []);

          const ticketRes = await axios.get(`${baseUrl}/api/tickets/my`, {
            headers: { 'x-auth-token': localStorage.token }
          });
          setMyRequests(ticketRes.data || []);
        }

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Loading />;

  return (
    <MainLayout user={user} setAuth={setAuth}>
      {user?.role === 'Citizen' && <CitizenDashboard user={user} crimeRecords={crimeRecords} myRequests={myRequests} />}
      {user?.role === 'Police' && <PoliceDashboard user={user} />}
      {user?.role === 'Admin' && <AdminDashboard user={user} />}
      {user?.role === 'Authority' && <AuthorityDashboard user={user} />}
    </MainLayout>
  );
};

export default Dashboard;
