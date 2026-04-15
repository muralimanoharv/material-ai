import { useCallback, useState, type ReactNode } from 'react'
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
  type Theme,
} from '@mui/material/styles'
import { getDarkTheme, getLightTheme } from '../assets/themes'
import { type ThemeMode, type AppConfigImpl } from '../schema'
import { ThemeContext } from '../context'

interface AppThemeProviderProps {
  config: AppConfigImpl
  children: ReactNode
  refreshConfig: () => void
}

export function AppThemeProvider({
  config,
  children,
  refreshConfig,
}: AppThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>('system')

  const setTheme = (theme: ThemeMode) => {
    setMode(theme)
  }

  const getTheme = useCallback((): Theme => {
    if (!config) {
      return createTheme()
    }

    const darkTheme = getDarkTheme(config.getTheme())
    const lightTheme = getLightTheme(config.getTheme())

    if (mode === 'light') return lightTheme
    if (mode === 'dark') return darkTheme

    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    return darkModeMediaQuery.matches ? darkTheme : lightTheme
  }, [mode, config])

  return (
    <ThemeContext.Provider
      value={{ theme: mode, setTheme, config, refreshConfig }}
    >
      <MuiThemeProvider theme={getTheme()}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  )
}
