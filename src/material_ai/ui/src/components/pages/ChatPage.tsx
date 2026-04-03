import { useContext } from 'react'
import ChatSection from '../chat/ChatSection'
import Greeting from '../Greeting'
import { HOST } from '../../service/api.service'
import { AppContext, type AppContextType } from '../../context'
import { useAgentId, useSessionId } from '../../hooks'
import Microfrontend from '../microfrontend/MicroFrontend'

export default function ChatPage() {
  const context = useContext(AppContext) as AppContextType
  const agentId = useAgentId()
  const sessionId = useSessionId()

  const REMOTE_URL = `${HOST}/apps/${agentId}/ui`

  return (
    <Microfrontend
      url={REMOTE_URL}
      props={{
        agentId,
        sessionId,
        ChatSection,
        Greeting,
      }}
    >
      <Greeting />
      <ChatSection
        maxWidth={context.config.getAgent(agentId)?.chat_section_width}
      />
    </Microfrontend>
  )
}
