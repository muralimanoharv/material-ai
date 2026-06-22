import {
  A2UIProvider,
  A2UIRenderer,
  type A2UIClientEventMessage,
  useA2UI,
  type ServerToClientMessage,
} from '@a2ui/react/v0_8'
import { useContext, useEffect } from 'react'
import { AppContext, type AppContextType } from '../../../context'
import { useAgentId, useSessionId } from '../../../hooks'
import { getMuiRegistry } from './registry'

export function Renderer({ messages }: { messages: ServerToClientMessage[] }) {
  const { processMessages } = useA2UI()

  let surfaceId = ''

  for (const message of messages) {
    if (message.beginRendering) {
      surfaceId = message.beginRendering.surfaceId
    }
  }

  useEffect(() => {
    processMessages(messages)
  }, [])

  if (!surfaceId) {
    console.warn(`Surface ID not found`, messages)
    return null
  }

  return (
    <A2UIRenderer
      surfaceId={surfaceId}
      registry={getMuiRegistry()}
      className="hello"
    />
  )
}

export function A2UIV8Render({
  messages,
}: {
  messages: ServerToClientMessage[]
}) {
  const context = useContext(AppContext) as AppContextType
  const agentId = useAgentId()
  const sessionId = useSessionId()

  const handleAction = async (action: A2UIClientEventMessage) => {
    await context.chatService.send_message(JSON.stringify(action), {
      session_id: sessionId,
      agent: agentId,
    })
  }
  return (
    <A2UIProvider onAction={handleAction}>
      <Renderer messages={messages} />
    </A2UIProvider>
  )
}
