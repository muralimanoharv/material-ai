import React, { useMemo } from 'react'
import { Routes, Route } from 'react-router'
import MUI from '@mui/material'

// Import components
import GlobalHeader from './components/GlobalHeader'
import HomePage from './pages/HomePage'
import PromptsPage from './pages/PromptsPage'
import CompanyPage from './pages/CompanyPage'
import HelpPage from './pages/HelpPage'
import HealthPage from './pages/HealthPage'

const { ThemeProvider, createTheme, CssBaseline, useMediaQuery } = MUI

export default function App(props) {
  const { user, agents = [], health, theme: themeProp } = props

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
  const activeMode =
    themeProp === 'system'
      ? prefersDarkMode
        ? 'dark'
        : 'light'
      : themeProp || 'light'

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: activeMode,
          primary: { main: '#4285F4' },
          background: {
            default: activeMode === 'dark' ? '#121212' : '#F8F9FA',
            paper: activeMode === 'dark' ? '#1E1E1E' : '#FFFFFF',
          },
        },
        typography: { fontFamily: 'system-ui, sans-serif' },
      }),
    [activeMode],
  )

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalHeader user={user} />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="prompts" element={<PromptsPage />} />
        <Route path="company" element={<CompanyPage agents={agents} />} />
        <Route path="help" element={<HelpPage />} />
        <Route path="health" element={<HealthPage health={health} />} />
      </Routes>
    </ThemeProvider>
  )
}
