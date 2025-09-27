
import { createTheme } from '@mui/material/styles';


export const CHAT_SECTION_WIDTH = '760px'
const commonThemeOptions = (isLight) => ({
    shape: {
        borderRadius: 8,
    },
    typography: {
        fontFamily: 'Inter, "Helvetica Neue", Arial, sans-serif',
        button: {
            fontWeight: 500,
            fontSize: '14px',
            textTransform: 'none',
            letterSpacing: 'normal',
            lineHeight: 'normal'
        },
    },
    components: {
        MuiMenu: {
            styleOverrides: {
                paper: ({ theme }) => ({
                    backgroundColor: theme.palette.background.card,
                }),
            }
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    '--Paper-overlay': 'none !important',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    color: isLight ? '#575b5f' : '#a2a9b0'
                }
            }
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    backgroundColor: isLight ? '#1b1c1d' : '#fff',
                    color: isLight ? '#e8eaed' : '#1b1c1d'
                },
            },
        },
        MuiTypography: {
            styleOverrides: {
                h1: {
                    fontWeight: 500,
                    fontSize: '28px',
                    lineHeight: '28px',
                    letterSpacing: '0.1px'
                },
                h2: {
                    fontWeight: 500,
                    fontSize: '26px',
                    lineHeight: '28px',
                    letterSpacing: '0.1px',
                    color: isLight ? '#575b5f' : '#a2a9b0'

                },
                h3: {
                    fontWeight: 500,
                    fontSize: '24px',
                    lineHeight: '28px',
                    letterSpacing: '0.1px',
                    color: isLight ? '#575b5f' : '#a2a9b0'

                },
                h4: {
                    fontWeight: 500,
                    fontSize: '14px',
                    lineHeight: '20px',
                    letterSpacing: 'normal',
                    color: isLight ? '#575b5f' : '#a2a9b0'
                },
                h5: {
                    fontWeight: 500,
                    fontSize: '14px',
                    lineHeight: '20px',
                    letterSpacing: 'normal',
                    color: isLight ? '#1f1f1f' : '#e3e3e3'
                },
                h6: {
                    fontWeight: 400,
                    fontSize: '12px',
                    lineHeight: '16px',
                    letterSpacing: '0.1px',
                    color: isLight ? '#575b5f' : '#a2a9b0'
                },
                p: {
                    fontSize: '16px',
                    fontWeight: 400,
                    wordBreak: 'break-word',
                    lineHeight: '26px',
                }
            },
        },
    },
});

export const lightTheme = createTheme({
    ...commonThemeOptions(true),
    palette: {
        mode: 'light',
        primary: {
            main: '#1a73e8',
        },
        background: {
            default: '#ffffff',
            paper: '#f0f4f9',
            card: '#f0f4f9',
            cardHover: '#dde3ea'
        },
        text: {
            primary: '#07080aff',
            secondary: '#1b1c1d',
        },
    },
});

// --- Dark Theme (Gemini-inspired) ---
export const darkTheme = createTheme({
    ...commonThemeOptions(false),
    palette: {
        mode: 'dark',
        primary: {
            main: '#8ab4f8',
        },
        background: {
            default: '#1b1c1d',
            paper: '#333537',
            card: '#282a2c',
            cardHover: '#3d3f42'
        },
        text: {
            primary: '#fff',
            secondary: '#9aa0a6',
        },
    },
});