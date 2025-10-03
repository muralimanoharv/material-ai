import { createTheme } from '@mui/material/styles';

export const CHAT_SECTION_WIDTH = '760px';

const lightPalette = {
    mode: 'light',
    primary: {
        main: '#1a73e8',
    },
    background: {
        default: '#ffffff',
        paper: '#f0f4f9',
        card: '#f0f4f9',
        cardHover: '#dde3ea',
        history: '#d3e3fd',
    },
    text: {
        primary: '#07080aff',
        secondary: '#1b1c1d',
        tertiary: '#575b5f', 
        h5: '#1f1f1f',      
        selected: '#0842a0',
        tagline: '#9a9b9c',
    },
    tooltip: {
        background: '#1b1c1d',
        text: '#e8eaed',
    },
};

const darkPalette = {
    mode: 'dark',
    primary: {
        main: '#8ab4f8',
    },
    background: {
        default: '#1b1c1d',
        paper: '#333537',
        card: '#282a2c',
        cardHover: '#3d3f42',
        history: '#1f3760',
    },
    text: {
        primary: '#fff',
        secondary: '#9aa0a6',
        tertiary: '#a2a9b0', 
        h5: '#e3e3e3',    
        selected: '#d3e3fd',
        tagline: '#747775',
    },
    tooltip: {
        background: '#fff',
        text: '#1b1c1d',
    },
};

const baseThemeOptions = {
    app: {
        isMobileQuery: (theme) => theme.breakpoints.down(960),
    },
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
            lineHeight: 'normal',
        },
        h1: {
            fontWeight: 500,
            fontSize: '36px',
            lineHeight: '38.4px',
            letterSpacing: '0.1px',
        },
        p: {
            fontSize: '16px',
            fontWeight: 400,
            wordBreak: 'break-word',
            lineHeight: '26px',
        },
    },
};

const getComponentOverrides = (palette) => ({
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    '--Paper-overlay': 'none !important',
                    background: palette.background.card,
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    color: palette.text.tertiary,
                },
            },
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    backgroundColor: palette.tooltip.background,
                    color: palette.tooltip.text,
                },
            },
        },
        MuiTypography: {
            styleOverrides: {
                h2: {
                    fontWeight: 500,
                    fontSize: '26px',
                    lineHeight: '28px',
                    letterSpacing: '0.1px',
                    color: palette.text.tertiary,
                },
                h3: {
                    fontWeight: 500,
                    fontSize: '24px',
                    lineHeight: '28px',
                    letterSpacing: '0.1px',
                    color: palette.text.tertiary,
                },
                h4: {
                    fontWeight: 500,
                    fontSize: '14px',
                    lineHeight: '20px',
                    letterSpacing: 'normal',
                    color: palette.text.tertiary,
                },
                h5: {
                    fontWeight: 500,
                    fontSize: '14px',
                    lineHeight: '20px',
                    letterSpacing: 'normal',
                    color: palette.text.h5,
                },
                h6: {
                    fontWeight: 400,
                    fontSize: '12px',
                    lineHeight: '16px',
                    letterSpacing: '0.1px',
                    color: palette.text.tertiary,
                },
            },
        },
    },
});

export const lightTheme = createTheme({
    ...baseThemeOptions,
    palette: lightPalette,
    ...getComponentOverrides(lightPalette),
});

export const darkTheme = createTheme({
    ...baseThemeOptions,
    palette: darkPalette,
    ...getComponentOverrides(darkPalette),
});