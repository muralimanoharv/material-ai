import { useContext, useEffect } from 'react'
import { useSearchParams } from 'react-router'
import { AppContext, type AppContextType } from '../context'
import { useSessionId } from '../hooks'
import ChatPage from './pages/ChatPage'

function AgentPageSection({ agent }: { agent: string }) {
  const { apiService, setSessions, fetchSession, historyService } = useContext(
    AppContext,
  ) as AppContextType
  const session_id = useSessionId()
  const [searchParams] = useSearchParams()

  const onAgentLoad = async () => {
    const sessions = await apiService.fetch_sessions(agent)
    setSessions(sessions)
  }

  useEffect(() => {
    historyService.clear_history()
    onAgentLoad()
  }, [agent])

  useEffect(() => {
    if (!session_id) return

    const isNewSession = searchParams.get('is_new_session')
    if (isNewSession && isNewSession == 'true') return

    fetchSession(agent, session_id)
  }, [session_id])

  return <ChatPage />
}

export default AgentPageSection
