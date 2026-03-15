import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1a365d', // Deep Blue (Government/Official)
            light: '#2c5282',
            dark: '#0f2440',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#d4af37', // Metallic Gold (Premium Accent)
            light: '#f3cf55',
            dark: '#a3841d',
            contrastText: '#1a365d',
        },
        background: {
            default: '#f8fafc', // Light Gray-Blue background
            paper: '#ffffff',
        },
        text: {
            primary: '#1e293b', // Slate 800
            secondary: '#64748b', // Slate 500
        },
        success: {
            main: '#10b981',
        },
        warning: {
            main: '#f59e0b',
        },
        error: {
            main: '#ef4444',
        },
        info: {
            main: '#3b82f6',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontWeight: 700,
            fontSize: '2.5rem',
            letterSpacing: '-0.02em',
            color: '#1a365d',
        },
        h2: {
            fontWeight: 700,
            fontSize: '2rem',
            letterSpacing: '-0.01em',
            color: '#1a365d',
        },
        h3: {
            fontWeight: 600,
            fontSize: '1.5rem',
            color: '#1a365d',
        },
        h4: {
            fontWeight: 600,
            fontSize: '1.25rem',
            color: '#1e293b',
        },
        h5: {
            fontWeight: 600,
            fontSize: '1rem',
            color: '#1e293b',
        },
        h6: {
            fontWeight: 600,
            fontSize: '0.875rem',
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
        },
        button: {
            fontWeight: 600,
            textTransform: 'none', // Modern look
        },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    padding: '10px 24px',
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    },
                },
                containedPrimary: {
                    background: 'linear-gradient(135deg, #1a365d 0%, #2c5282 100%)',
                },
                containedSecondary: {
                    background: 'linear-gradient(135deg, #d4af37 0%, #f3cf55 100%)',
                    color: '#0f2440',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    border: '1px solid #e2e8f0',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 8,
                        backgroundColor: '#ffffff',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 600,
                    borderRadius: 6,
                },
            },
        },
    },
});

export default theme;
