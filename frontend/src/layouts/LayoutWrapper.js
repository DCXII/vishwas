import React, { useState, useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';
import axios from 'axios';
import MainLayout from './MainLayout';
import config from '../config';

/**
 * LayoutWrapper fetches user data and wraps children in MainLayout.
 * Used for pages that need the sidebar but aren't the Dashboard itself.
 */
const LayoutWrapper = ({ children, setAuth }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const url = config?.apiUrl ? `${config.apiUrl}/api/users/me` : '/api/users/me';
                const res = await axios.get(url, {
                    headers: { 'x-auth-token': localStorage.token }
                });
                setUser(res.data);
            } catch (err) {
                console.error('LayoutWrapper: failed to fetch user', err);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <MainLayout user={user} setAuth={setAuth}>
            {children}
        </MainLayout>
    );
};

export default LayoutWrapper;
