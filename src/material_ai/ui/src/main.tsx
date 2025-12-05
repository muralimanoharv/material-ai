import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router'

import { AppConfigProvider } from './components/AppConfigProvider'
import App from './App'
import './index.css'

const rootElement = document.getElementById('root')!

createRoot(rootElement).render(
  <StrictMode>
    <AppConfigProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </AppConfigProvider>
  </StrictMode>,
)
