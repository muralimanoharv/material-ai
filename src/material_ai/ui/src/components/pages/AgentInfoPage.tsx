import { useContext } from 'react'
import { AppContext, type AppContextType } from '../../context'
import { useAgentId, withLayout } from '../../hooks'
import AgentInfo from '../agents/AgentInfo'

function AgentInfoPage() {
  const { agents } = useContext(AppContext) as AppContextType
  const agentId = useAgentId()
  const agent = agents.find((agent) => agent.id == agentId)
  if (!agent) return null
  return <AgentInfo agent={agent} />
}

const AgentPageWithLayout = withLayout(AgentInfoPage, { showFooter: false })
export default AgentPageWithLayout
