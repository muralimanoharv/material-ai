import { useState, useEffect, type ReactNode } from 'react'
import { type AppConfig, AppConfigImpl } from '../schema'
import { AppThemeProvider } from './AppThemeProvider'
import { HOST } from '../service/api.service'
import { getI18n } from '../utils'

interface AppConfigProviderProps {
  children: ReactNode
}

export function AppConfigProvider({ children }: AppConfigProviderProps) {
  const [config, setConfig] = useState<AppConfigImpl | undefined>(undefined)

  const [error, setError] = useState<string | null>(null)

  const refreshConfig = async () => {
    try {
      const response = await fetch(`${HOST}/config`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': getI18n(),
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch config: ${response.statusText}`)
      }

      const data = (await response.json()) as AppConfig

      setConfig(new AppConfigImpl(data))
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Unknown error')
      }
    }
  }

  useEffect(() => {
    refreshConfig()
  }, [])

  if (error) return <div>Error loading application: {error}</div>
  if (!config) return null

  return (
    <AppThemeProvider config={config} refreshConfig={refreshConfig}>
      {children}
    </AppThemeProvider>
  )
}
