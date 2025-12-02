import * as React from 'react'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { Box, Button, Tooltip, Typography } from '@mui/material'
import { AppContext, type AppContextType } from '../../context'
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { menuNeedsLogin } from './hoc'
import { useNavigate } from 'react-router'
import { useAgentId } from '../../hooks'
import type { Agent } from '../../schema'

interface AgentSelectMenuBodyProps {
  agents: Agent[]
}

interface AgentItemProps {
  agent: Agent
}

export default function AgentSelectMenu() {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null)

  const { agents } = React.useContext(AppContext) as AppContextType

  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <div>
      <Tooltip title="Add files">
        <Button
          id="agent-button"
          aria-controls={open ? 'agent-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
          startIcon={<AutoAwesomeOutlinedIcon fontSize="small" />}
          sx={{
            borderRadius: '24px',
            padding: '0 16px',
            height: '40px',
            width: '120px',
          }}
        >
          Agents
        </Button>
      </Tooltip>
      <Menu
        id="agent-menu"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: -110,
          horizontal: 'left',
        }}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'agent-button',
        }}
      >
        <Box sx={{ width: 320 }}>
          <Typography
            sx={{
              padding: '8px 16px',
            }}
            variant="h4"
          >
            Choose your agent
          </Typography>
        </Box>

        <AgentSelectMenuBody agents={agents} />
      </Menu>
    </div>
  )
}

const AgentSelectMenuBody = menuNeedsLogin<AgentSelectMenuBodyProps>(
  (props) => {
    return (
      <Box sx={{ width: 300 }}>
        {props.agents.map((agent) => (
          <AgentItem key={agent.name} agent={agent} />
        ))}
      </Box>
    )
  },
  'Sign in to select agents',
)

function AgentItem({ agent }: AgentItemProps) {
  const navigate = useNavigate()

  const selectedAgent = useAgentId()

  return (
    <MenuItem
      key={agent.name}
      onClick={async () => {
        navigate(`/agents/${agent}`)
      }}
    >
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography textTransform="capitalize" variant="h5">
            {agent.name.replaceAll('_', ' ')}
          </Typography>
          <Typography variant="h6">{agent.model}</Typography>
        </Box>
        {selectedAgent === agent.name ? (
          <Box mt={'5px'}>
            <CheckCircleIcon color="primary" />
          </Box>
        ) : null}
      </Box>
    </MenuItem>
  )
}
