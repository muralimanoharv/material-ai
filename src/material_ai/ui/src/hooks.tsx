import { useMediaQuery, useTheme } from '@mui/material'
import { useParams } from 'react-router'
import Layout from './components/layout/Layout'

export const useMobileHook = (): boolean => {
  const theme = useTheme()

  // TypeScript needs to know that 'app' exists on the theme.
  // See the "Module Augmentation" section below if this line errors.
  const isMobile = useMediaQuery(theme.app.isMobileQuery(theme))

  return isMobile
}

export const useSessionId = (): string => {
  const params = useParams()
  return params["sessionId"] as string
}

export const useAgentId = (): string => {
  const params = useParams()
  return params["agentId"] as string
}


export const withLayout = (Component: React.FC, options?: {showFooter?: boolean}) => {
  return (props: any) => {
    return <Layout showFooter={options?.showFooter == undefined ? true : options.showFooter}>
      <Component {...props}/>
    </Layout>
  }
} 
