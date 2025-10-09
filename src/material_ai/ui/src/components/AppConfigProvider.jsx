import { useState, useEffect } from 'react'
import { fetch_config } from '../api.js'
import { AppThemeProvider } from './AppThemeProvider.jsx'

export function AppConfigProvider({ children }) {
  const [config, setConfig] = useState()

  let getConfig = async () => {
    try {
      if (sessionStorage.getItem('config')) {
        setConfig(JSON.parse(sessionStorage.getItem('config')))
        return
      }
      let config_response = await fetch_config()
      sessionStorage.setItem('config', JSON.stringify(config_response))
      setConfig(config_response)
    } catch (e) {
      console.error(e)
      alert('Some error has occured, Please try again later')
    }
  }

  useEffect(() => {
    getConfig()
  }, [])

  if (!config) return null

  return <AppThemeProvider config={config}>{children}</AppThemeProvider>
}
