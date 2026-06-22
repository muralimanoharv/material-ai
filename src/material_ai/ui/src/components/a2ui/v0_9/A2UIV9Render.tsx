import { useState, useEffect, useContext } from 'react'
import {
  MessageProcessor,
  type ActionListener,
  type A2uiClientAction,
  type A2uiMessage,
} from '@a2ui/web_core/v0_9'
import { renderMarkdown } from '@a2ui/markdown-it'
import { A2uiSurface, MarkdownContext } from '@a2ui/react/v0_9'
import { muiCatalog } from './catalog'
import { useAgentId, useSessionId } from '../../../hooks'
import { AppContext, type AppContextType } from '../../../context'

const BASIC_FUNCTIONS = new Set(['MODAL_TRIGGERED'])

export function A2UIV9Render({ messages }: { messages: A2uiMessage[] }) {
  // 1. Create the processor and feed it messages.
  const agentId = useAgentId()
  const sessionId = useSessionId()
  const context = useContext(AppContext) as AppContextType

  const listener: ActionListener = async (action: A2uiClientAction) => {
    if (BASIC_FUNCTIONS.has(action.name)) return
    await context.chatService.send_message(JSON.stringify(action), {
      session_id: sessionId,
      agent: agentId,
    })
  }

  const [processor] = useState(() => {
    const p = new MessageProcessor([muiCatalog], listener)
    p.processMessages(messages)
    return p
  })

  // 2. Set up listeners to keep the UI up to date as messages arrive.
  const [surfaces, setSurfaces] = useState(() =>
    Array.from(processor.model.surfacesMap.values()),
  )
  useEffect(() => {
    const sync = () =>
      setSurfaces(Array.from(processor.model.surfacesMap.values()))

    const createdSub = processor.onSurfaceCreated(sync)
    const deletedSub = processor.onSurfaceDeleted(sync)

    return () => {
      createdSub.unsubscribe()
      deletedSub.unsubscribe()
    }
  }, [processor])

  // 3. Render every surface the agent has created.
  return (
    <div className="a2ui-container">
      <MarkdownContext value={renderMarkdown}>
        {surfaces.length === 0 && <div>Waiting for agent...</div>}
        {surfaces.map((surface) => (
          <A2uiSurface key={surface.id} surface={surface} />
        ))}
      </MarkdownContext>
    </div>
  )
}
