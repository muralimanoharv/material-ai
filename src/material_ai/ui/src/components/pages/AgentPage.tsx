import { useContext } from 'react'
import { AppContext, type AppContextType } from '../../context'
import { useAgentId, withLayout } from '../../hooks'
import PageNotFound from '../PageNotFound'
import AgentPageSection from '../AgentPageSection'
import Greeting from '../Greeting'

function AgentPage() {
  const context = useContext(AppContext) as AppContextType

  const agent_id = useAgentId()

  if (!context.user) {
    return <Greeting />
  }

  if (!context.agents.length) return null

  if (!agent_id) return null
  if (!context.agents.find((agent) => agent.id == agent_id))
    return <PageNotFound />

  return <AgentPageSection agent={agent_id} />
}

const AgentPageWithLayout = withLayout(AgentPage)

export default AgentPageWithLayout
