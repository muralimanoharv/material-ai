import { useCallback, useState, type ReactNode } from 'react'
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
  type Theme,
} from '@mui/material/styles'
import { lightTheme, darkTheme } from '../assets/themes'
import { type AppConfig, type ThemeMode } from '../schema'
import { ThemeContext } from '../context'

interface AppThemeProviderProps {
  config: AppConfig
  children: ReactNode
}

export function AppThemeProvider({ config, children }: AppThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>('system')

  const setTheme = (theme: ThemeMode) => {
    setMode(theme)
  }

  const getTheme = useCallback((): Theme => {
    if (!config) {
      return createTheme()
    }

    if (mode === 'light') return lightTheme(config)
    if (mode === 'dark') return darkTheme(config)

    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    return darkModeMediaQuery.matches ? darkTheme(config) : lightTheme(config)
  }, [mode, config])

  return (
    <ThemeContext.Provider value={{ theme: mode, setTheme, config }}>
      <MuiThemeProvider theme={getTheme()}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  )
}
