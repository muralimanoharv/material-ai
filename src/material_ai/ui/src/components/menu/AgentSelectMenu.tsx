import * as React from 'react'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { Box, Button, Tooltip, Typography } from '@mui/material'
import { AppContext, type AppContextType } from '../../context'
import { AutoAwesome } from '@mui/icons-material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { menuNeedsLogin } from './hoc'
import { useNavigate } from 'react-router'
import { useAgentId } from '../../hooks'
import type { Agent } from '../../schema'
import { formatModelName } from '../../utils'

interface AgentSelectMenuBodyProps {
  agents: Agent[]
  handleClose: () => void
}

interface AgentItemProps {
  agent: Agent
  handleClose: () => void
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
          data-testid="prompt-input-agent-menu"
          aria-controls={open ? 'agent-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
          startIcon={<AutoAwesome fontSize="small" />}
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

        <AgentSelectMenuBody agents={agents} handleClose={handleClose} />
      </Menu>
    </div>
  )
}

const AgentSelectMenuBody = menuNeedsLogin<AgentSelectMenuBodyProps>(
  (props) => {
    return (
      <Box>
        {props.agents.map((agent) => (
          <AgentItem
            key={agent.name}
            agent={agent}
            handleClose={props.handleClose}
          />
        ))}
      </Box>
    )
  },
  'Sign in to select agents',
)

function AgentItem({ agent, handleClose }: AgentItemProps) {
  const navigate = useNavigate()

  const selectedAgent = useAgentId()

  return (
    <MenuItem
      key={agent.id}
      onClick={async () => {
        navigate(`/agents/${agent.id}`)
        handleClose()
      }}
      data-testid={`prompt-input-agent-${agent.id}`}
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
          <Typography variant="h5">{agent.name}</Typography>
          <Typography variant="h6">{formatModelName(agent.model)}</Typography>
        </Box>
        {selectedAgent === agent.id ? (
          <Box mt={'5px'}>
            <CheckCircleIcon color="primary" />
          </Box>
        ) : null}
      </Box>
    </MenuItem>
  )
}
