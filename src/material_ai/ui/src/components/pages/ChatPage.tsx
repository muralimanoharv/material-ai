import React, { useState, lazy, useMemo, Suspense, useContext } from 'react'
import * as MaterialUI from '@mui/material'
import * as MaterialUIIcons from '@mui/icons-material'
import ChatSection from '../chat/ChatSection'
import Greeting from '../Greeting'
import { HOST } from '../../service/api.service'
import { AppContext, type AppContextType } from '../../context'
import { useAgentId } from '../../hooks'

window.React = React
// @ts-ignore
window.MaterialUI = MaterialUI
// @ts-ignore
window.MaterialUIIcons = MaterialUIIcons

export default function ChatPage() {
  const context = useContext(AppContext) as AppContextType
  const agentId = useAgentId()
  const [hasRemoteError, setHasRemoteError] = useState(false)
  const REMOTE_URL = `${HOST}/apps/${agentId}/ui`
  const MicroFrontendAgentComponent = useMemo(() => {
    return lazy(() =>
      import(/* @vite-ignore */ REMOTE_URL).catch((err) => {
        console.error('MFE Load Failed:', err)
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
            <ChatSection />
          </>
        ) : (
          <MicroFrontendAgentComponent 
            {...context} 
            ChatSection={ChatSection}
            Greeting={Greeting}
          />
        )}
      </Suspense>
    </>
  )
}
