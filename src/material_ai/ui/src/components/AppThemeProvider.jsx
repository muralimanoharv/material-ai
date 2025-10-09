import { useCallback, useState } from 'react'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import { lightTheme, darkTheme } from '../assets/themes.js'
import { AppConfigContext } from '../context.jsx'

export function AppThemeProvider({ config, children }) {
  const [mode, setMode] = useState('system')

  const setTheme = (theme) => {
    setMode(theme)
  }

  const getTheme = useCallback(() => {
    if (!config) return
    if (mode == 'light') return lightTheme(config)
    if (mode == 'dark') return darkTheme(config)
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    return darkModeMediaQuery.matches ? darkTheme(config) : lightTheme(config)
  }, [mode])

  return (
    <AppConfigContext.Provider value={{ theme: mode, setTheme, config }}>
      <MuiThemeProvider theme={getTheme()}>{children}</MuiThemeProvider>
    </AppConfigContext.Provider>
  )
}
