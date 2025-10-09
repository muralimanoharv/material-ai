import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { AppConfigProvider } from './components/AppConfigProvider.jsx'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppConfigProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </AppConfigProvider>
  </StrictMode>,
)
