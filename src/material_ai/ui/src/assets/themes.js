import { createTheme } from '@mui/material/styles'

export const CHAT_SECTION_WIDTH = '760px'

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
}

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
})

export const lightTheme = (config) =>
  createTheme({
    ...baseThemeOptions,
    palette: config.theme.lightPalette,
    ...getComponentOverrides(config.theme.lightPalette),
  })

export const darkTheme = (config) =>
  createTheme({
    ...baseThemeOptions,
    palette: config.theme.darkPalette,
    ...getComponentOverrides(config.theme.darkPalette),
  })
