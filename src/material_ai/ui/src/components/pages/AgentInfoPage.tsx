import { useContext } from 'react'
import { AppContext, type AppContextType } from '../../context'
import { useAgentId, withLayout } from '../../hooks'
import AgentInfo from '../agents/AgentInfo'
import PageNotFound from './PageNotFound'

function AgentInfoPage() {
  const { agents, loading } = useContext(AppContext) as AppContextType
  const agentId = useAgentId()
  if (loading) return null
  const agent = agents.find((agent) => agent.id == agentId)
  if (!agent) return <PageNotFound />
  return <AgentInfo agent={agent} />
}

const AgentPageWithLayout = withLayout(AgentInfoPage, { showFooter: false })
export default AgentPageWithLayout
