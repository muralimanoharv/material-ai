import { useContext, useEffect } from 'react'
import { AppContext, type AppContextType } from '../../context'
import ChatPage from './ChatPage'
import { useAgentId, useSessionId, withLayout } from '../../hooks'

function AgentPage() {
  const context = useContext(AppContext) as AppContextType

  const agent_id = useAgentId()

  if(!context.agents.length) return null;

  if (!agent_id) return null
  //TODO: Display page for this scenario
  if (!context.agents.find(agent => agent.name = agent_id)) return <>Agent Not Found</>

  return <AgentPageSection agent={agent_id} />
}

function AgentPageSection({ agent }: { agent: string }) {
  const { apiService, setSessions, fetchSession } = useContext(
    AppContext,
  ) as AppContextType
  const session_id = useSessionId()

  const onAgentLoad = async () => {
    const sessions = await apiService.fetch_sessions(agent)
    setSessions(sessions)
  }

  useEffect(() => {
    onAgentLoad()
  }, [agent])

  useEffect(() => {
    if (!session_id) return
    fetchSession(agent, session_id)
  }, [])

  return <ChatPage />
}

export default withLayout(AgentPage)
