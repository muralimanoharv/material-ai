import {
  createTheme,
  type Theme,
  type ThemeOptions,
  type Palette,
} from '@mui/material/styles'
import React from 'react'

import { type ThemeConfig } from '../schema'

declare module '@mui/material/styles' {
  interface Theme {
    app: {
      isMobileQuery: (theme: Theme) => string
    }
  }
  interface ThemeOptions {
    app?: {
      isMobileQuery?: (theme: Theme) => string
    }
  }

  interface TypographyVariants {
    p: React.CSSProperties
  }
  interface TypographyVariantsOptions {
    p?: React.CSSProperties
  }

  interface TypeBackground {
    card: string
    cardHover: string
    history: string
  }

  interface TypeText {
    tertiary: string
    h5: string
    tagline: string
    selected: string
  }

  interface Palette {
    tooltip: {
      background: string
      text: string
    }
  }
  interface PaletteOptions {
    tooltip?: {
      background: string
      text: string
    }
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    p: true
  }
}

export const CHAT_SECTION_WIDTH = '760px'

const baseThemeOptions: ThemeOptions = {
  app: {
    isMobileQuery: (theme: Theme) => theme.breakpoints.down(960),
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

const getComponentOverrides = (palette: Palette): ThemeOptions => ({
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
        contained: {
          color: palette.background.default,
          backgroundColor: palette.primary.main,
          '&:hover': {
            backgroundColor: palette.primary.dark,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          color: palette.background.default,
          '& .MuiTypography-root': {
            color: 'inherit',
          },
          '& .MuiSvgIcon-root': {
            color: 'inherit',
          },
          '& .MuiButton-root': {
            color: 'inherit',
          },
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          color: palette.background.default,
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

export const lightTheme = (config: ThemeConfig) =>
  createTheme({
    ...baseThemeOptions,
    palette: config.theme.lightPalette,
    ...getComponentOverrides(config.theme.lightPalette),
  })

export const darkTheme = (config: ThemeConfig) =>
  createTheme({
    ...baseThemeOptions,
    palette: config.theme.darkPalette,
    ...getComponentOverrides(config.theme.darkPalette),
  })
