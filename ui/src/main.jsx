import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import { AppThemeProvider } from './components/AppThemeProvider.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppThemeProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </AppThemeProvider>
  </StrictMode>,
)
