import { useContext, useEffect } from 'react'
import { Box } from '@mui/material'
import { withLayout } from '../../hooks'
import { AppContext, type AppContextType } from '../../context'
import Greeting from '../Greeting'
import AgentList from '../AgentList'

function AgentsPage() {
  const { agents, user, setSessions } = useContext(AppContext) as AppContextType

  useEffect(() => {
    if (!user) return
    setSessions([])
  }, [])

  if (!user) {
    return <Greeting />
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '10px',
      }}
    >
      <AgentList agents={agents} />
    </Box>
  )
}

const AgentsPageWithLayout = withLayout(AgentsPage, { showFooter: false })

export default AgentsPageWithLayout
