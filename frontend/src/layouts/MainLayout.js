import React, { useState } from 'react';
import {
    Box, Drawer, AppBar, Toolbar, List, Typography, Divider, IconButton,
    ListItem, ListItemButton, ListItemIcon, ListItemText, Avatar, Menu, MenuItem,
    useTheme, useMediaQuery
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SecurityIcon from '@mui/icons-material/Security';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ReceiptIcon from '@mui/icons-material/Receipt';
import FolderIcon from '@mui/icons-material/Folder';
import GavelIcon from '@mui/icons-material/Gavel';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import FaceIcon from '@mui/icons-material/Face';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import ChecklistIcon from '@mui/icons-material/Checklist';
import VideocamIcon from '@mui/icons-material/Videocam';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';

const drawerWidth = 280;

const MainLayout = ({ children, user, setAuth }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleClose();
        localStorage.removeItem("token");
        setAuth(false);
        navigate('/login');
    };

    const handleProfile = () => {
        handleClose();
        navigate('/profile');
    };

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', roles: ['Citizen', 'Police', 'Authority', 'Admin'] },
        { text: 'My Cases', icon: <FolderIcon />, path: '/my-cases', roles: ['Citizen'] },
        { text: 'File Request', icon: <ReceiptIcon />, path: '/create-ticket', roles: ['Citizen'] },
        { text: 'Track Requests', icon: <TrackChangesIcon />, path: '/track-requests', roles: ['Citizen'] },
        { text: 'Case Management', icon: <GavelIcon />, path: '/manage-cases', roles: ['Police', 'Authority'] },
        { text: 'Review Requests', icon: <ChecklistIcon />, path: '/review-requests', roles: ['Police', 'Authority', 'Admin'] },
        { text: 'Person Enquiry', icon: <PersonSearchIcon />, path: '/person-enquiry', roles: ['Police', 'Authority', 'Admin'] },
        { text: 'Face Search', icon: <FaceIcon />, path: '/face-search', roles: ['Police', 'Authority'] },
        { text: 'Live Camera Scan', icon: <VideocamIcon />, path: '/camera-face-detection', roles: ['Police', 'Authority'] },
        { text: 'Blockchain Records', icon: <SecurityIcon />, path: '/blockchain', roles: ['Police', 'Authority', 'Admin'] },
        { text: 'System Admin', icon: <AdminPanelSettingsIcon />, path: '/admin', roles: ['Admin'] },
    ];

    // Filter items based on user role
    const filteredItems = menuItems.filter(item => user && item.roles.includes(user.role));

    const drawerContent = (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Sidebar Header */}
            <Box sx={{
                p: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: 'white'
            }}>
                <SecurityIcon sx={{ color: 'secondary.main', fontSize: 32 }} />
                <Box>
                    <Typography variant="h6" fontWeight={700} lineHeight={1.2}>VISHWAS</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>Secure Portal</Typography>
                </Box>
            </Box>

            <Divider />

            {/* User Info (Sidebar) */}
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Avatar
                    sx={{
                        width: 64,
                        height: 64,
                        mx: 'auto',
                        mb: 2,
                        bgcolor: 'secondary.main',
                        color: 'primary.dark',
                        fontWeight: 700
                    }}
                >
                    {user?.name?.charAt(0) || 'U'}
                </Avatar>
                <Typography variant="subtitle1" fontWeight={600} noWrap>
                    {user?.name || 'User'}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    {user?.role?.toUpperCase() || 'ROLE'}
                </Typography>
            </Box>

            <Divider sx={{ mx: 2 }} />

            {/* Navigation Items */}
            <List sx={{ flexGrow: 1, px: 2, py: 2 }}>
                {filteredItems.map((item) => {
                    const active = location.pathname === item.path;
                    return (
                        <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                            <ListItemButton
                                onClick={() => {
                                    navigate(item.path);
                                    if (isMobile) setMobileOpen(false);
                                }}
                                selected={active}
                                sx={{
                                    borderRadius: 2,
                                    '&.Mui-selected': {
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        '&:hover': {
                                            bgcolor: 'primary.dark',
                                        },
                                        '& .MuiListItemIcon-root': {
                                            color: 'white',
                                        }
                                    },
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 40, color: active ? 'inherit' : 'text.secondary' }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    primaryTypographyProps={{
                                        fontSize: '0.9rem',
                                        fontWeight: active ? 600 : 500
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>

            <Divider sx={{ mx: 2 }} />

            {/* Logout Button (Sidebar Bottom) */}
            <Box sx={{ p: 2 }}>
                <ListItemButton
                    onClick={handleLogout}
                    sx={{
                        borderRadius: 2,
                        color: 'error.main',
                        '&:hover': { bgcolor: 'error.light', color: 'error.dark' }
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                        <LogoutIcon />
                    </ListItemIcon>
                    <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 600 }} />
                </ListItemButton>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            {/* AppBar */}
            <AppBar
                position="fixed"
                sx={{
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    ml: { md: `${drawerWidth}px` },
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    boxShadow: 'none',
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Box sx={{ flexGrow: 1 }} />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ mr: 1, fontWeight: 500, display: { xs: 'none', sm: 'block' } }}>
                            {user?.email}
                        </Typography>
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleMenu}
                            color="inherit"
                        >
                            <AccountCircleIcon />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorEl}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            <MenuItem onClick={handleProfile}>Profile</MenuItem>
                            <MenuItem onClick={handleLogout}>Logout</MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Navigation Drawer */}
            <Box
                component="nav"
                sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
            >
                {/* Mobile Drawer */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawerContent}
                </Drawer>

                {/* Desktop Drawer */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid #e2e8f0' },
                    }}
                    open
                >
                    {drawerContent}
                </Drawer>
            </Box>

            {/* Main Content Area */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    minHeight: '100vh',
                    bgcolor: 'background.default'
                }}
            >
                <Toolbar /> {/* Spacer for fixed AppBar */}
                {children}
            </Box>
        </Box>
    );
};

export default MainLayout;
