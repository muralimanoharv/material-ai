import { useContext, useEffect } from 'react'
import { Box } from '@mui/material'
import { withLayout } from '../../hooks'
import { AppContext, type AppContextType } from '../../context'
import AgentCatalog from '../agents/AgentCatalog'
import Microfrontend from '../microfrontend/MicroFrontend'
import { HOST } from '../../service/api.service'

function AgentsPage() {
  const { agents, setSessions } = useContext(AppContext) as AppContextType

  useEffect(() => {
    setSessions([])
  }, [])

  const URL = `${HOST}/micro_frontend/agents_page`

  return (
    <Microfrontend url={URL} props={{ agents }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '10px',
        }}
      >
        <AgentCatalog agents={agents} />
      </Box>
    </Microfrontend>
  )
}

const AgentsPageWithLayout = withLayout(AgentsPage, { showFooter: false })

export default AgentsPageWithLayout
