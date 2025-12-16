import { useState, useEffect, type ReactNode } from 'react'
import { type AppConfig } from '../schema'
import { AppThemeProvider } from './AppThemeProvider'
import { HOST } from '../service/api.service'

interface AppConfigProviderProps {
  children: ReactNode
}

export function AppConfigProvider({ children }: AppConfigProviderProps) {
  const [config, setConfig] = useState<AppConfig | undefined>(() => {
    try {
      const storedConfig = sessionStorage.getItem('config')
      return storedConfig ? JSON.parse(storedConfig) : undefined
    } catch {
      return undefined
    }
  })

  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initConfig = async () => {
      if (config) return

      try {
        const response = await fetch(`${HOST}/config`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch config: ${response.statusText}`)
        }

        const data = (await response.json()) as AppConfig
        
        sessionStorage.setItem('config', JSON.stringify(data))
        setConfig(data)
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('Unknown error')
        }
      }
    }

    initConfig()
  }, [])

  if (error) return <div>Error loading application: {error}</div>
  if (!config) return null

  return <AppThemeProvider config={config}>{children}</AppThemeProvider>
}
