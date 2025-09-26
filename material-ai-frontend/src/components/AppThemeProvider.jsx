import { useState, useMemo } from 'react'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { lightTheme, darkTheme } from '../assets/themes.js';
import { ThemeToggleContext } from '../context.jsx';

export function AppThemeProvider({ children }) {
  const [mode, setMode] = useState('light');

  const setTheme = (theme) => {
    setMode(theme)
  }

  const theme = useMemo(() => (mode === 'light' ? lightTheme : darkTheme), [mode]);

  return (
    <ThemeToggleContext.Provider value={{theme: mode, setTheme}}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeToggleContext.Provider>
  )
}