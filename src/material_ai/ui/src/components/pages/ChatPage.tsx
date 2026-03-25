import React, {
  lazy,
  useMemo,
  Suspense,
  useContext,
  Component,
  type ErrorInfo,
  type ReactNode,
} from 'react'
import * as MaterialUI from '@mui/material'
import * as MaterialUIIcons from '@mui/icons-material'
import * as ReactHookForm from 'react-hook-form'
import ChatSection from '../chat/ChatSection'
import Greeting from '../Greeting'
import { HOST } from '../../service/api.service'
import { AppContext, type AppContextType } from '../../context'
import { useAgentId, useSessionId } from '../../hooks'

declare global {
  interface Window {
    React: typeof React
    MaterialUI: typeof MaterialUI
    MaterialUIIcons: typeof MaterialUIIcons
    ReactHookForm: typeof ReactHookForm
  }
}

window.React = React
window.MaterialUI = MaterialUI
window.MaterialUIIcons = MaterialUIIcons
window.ReactHookForm = ReactHookForm

// --- Interfaces ---

interface ErrorBoundaryProps {
  agentId: string
  fallback: ReactNode
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  agentId: string
}

interface MFEProps extends AppContextType {
  agentId: string
  sessionId: string
  ChatSection: typeof ChatSection
  Greeting: typeof Greeting
}

class RemoteErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, agentId: props.agentId }
  }

  static getDerivedStateFromProps(
    props: ErrorBoundaryProps,
    state: ErrorBoundaryState,
  ): Partial<ErrorBoundaryState> | null {
    if (props.agentId !== state.agentId) {
      return { hasError: false, agentId: props.agentId }
    }
    return null
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('MFE Load/Runtime Error:', error, errorInfo)
    this.setState({ hasError: true })
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

export default function ChatPage() {
  const context = useContext(AppContext) as AppContextType
  const agentId = useAgentId()
  const sessionId = useSessionId()

  const REMOTE_URL = `${HOST}/apps/${agentId}/ui`

  const MicroFrontendAgentComponent = useMemo(() => {
    return lazy(
      () => import(/* @vite-ignore */ REMOTE_URL),
    ) as React.ComponentType<MFEProps>
  }, [agentId, REMOTE_URL])

  return (
    <RemoteErrorBoundary
      key={agentId}
      agentId={agentId}
      fallback={
        <>
          <Greeting />
          <ChatSection
            maxWidth={context.config.getAgent(agentId)?.chat_section_width}
          />
        </>
      }
    >
      <Suspense fallback={<div />}>
        <MicroFrontendAgentComponent
          {...context}
          agentId={agentId}
          sessionId={sessionId}
          ChatSection={ChatSection}
          Greeting={Greeting}
        />
      </Suspense>
    </RemoteErrorBoundary>
  )
}
