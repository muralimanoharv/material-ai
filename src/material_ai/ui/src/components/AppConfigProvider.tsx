import { useState, useEffect, type ReactNode } from 'react'
import { type AppConfig } from '../schema'
import { AppThemeProvider } from './AppThemeProvider'
import { HOST } from '../service/api.service'

interface AppConfigProviderProps {
  children: ReactNode
}

export function AppConfigProvider({ children }: AppConfigProviderProps) {
  const [config, setConfig] = useState<AppConfig | undefined>()

  const fetch_config = async (): Promise<AppConfig> => {
    const response = await fetch(`${HOST}/config`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch config: ${response.statusText}`)
    }

    const body = (await response.json()) as AppConfig

    return body
  }

  const getConfig = async () => {
    try {
      const storedConfig = sessionStorage.getItem('config')

      if (storedConfig) {
        setConfig(JSON.parse(storedConfig) as AppConfig)
        return
      }

      const config_response = await fetch_config()

      sessionStorage.setItem('config', JSON.stringify(config_response))
      setConfig(config_response)
    } catch (e) {
      console.error(e)
      alert('Some error has occurred, Please try again later')
    }
  }

  useEffect(() => {
    getConfig()
  }, [])

  if (!config) return null

  return <AppThemeProvider config={config}>{children}</AppThemeProvider>
}
