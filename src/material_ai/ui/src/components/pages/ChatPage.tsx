import React, { useState, lazy, useMemo, Suspense, useContext } from 'react'
import * as MaterialUI from '@mui/material'
import * as MaterialUIIcons from '@mui/icons-material'
import * as ReactHookForm from 'react-hook-form'
import ChatSection from '../chat/ChatSection'
import Greeting from '../Greeting'
import { HOST } from '../../service/api.service'
import { AppContext, type AppContextType } from '../../context'
import { useAgentId, useSessionId } from '../../hooks'

window.React = React
// @ts-expect-error we get and error here when we assign to window object
window.MaterialUI = MaterialUI
// @ts-expect-error we get and error here when we assign to window object
window.MaterialUIIcons = MaterialUIIcons
// @ts-expect-error we get and error here when we assign to window object
window.ReactHookForm = ReactHookForm

export default function ChatPage() {
  const context = useContext(AppContext) as AppContextType
  const agentId = useAgentId()
  const sessionId = useSessionId()
  const [hasRemoteError, setHasRemoteError] = useState(false)
  const REMOTE_URL = `${HOST}/apps/${agentId}/ui`
  const MicroFrontendAgentComponent = useMemo(() => {
    return lazy(() =>
      import(/* @vite-ignore */ REMOTE_URL).catch((err) => {
        console.warn('MFE Load Failed:', err)
        setHasRemoteError(true)
        return { default: () => null }
      }),
    )
  }, [REMOTE_URL])
  return (
    <>
      <Suspense fallback={<div></div>}>
        {hasRemoteError ? (
          <>
            <Greeting />
            <ChatSection
              maxWidth={context.config.getAgent(agentId)?.chat_section_width}
            />
          </>
        ) : (
          <MicroFrontendAgentComponent
            {...context}
            agentId={agentId}
            sessionId={sessionId}
            ChatSection={ChatSection}
            Greeting={Greeting}
          />
        )}
      </Suspense>
    </>
  )
}
