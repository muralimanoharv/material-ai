import * as React from 'react'
import {
  Menu,
  MenuItem,
  Box,
  Button,
  Tooltip,
  Typography,
  TextField,
  InputAdornment,
  Divider,
} from '@mui/material'
import {
  AutoAwesome,
  Search as SearchIcon,
  Close as CloseIcon,
} from '@mui/icons-material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { useNavigate } from 'react-router'
import { AppContext, type AppContextType } from '../../context'
import { menuNeedsLogin } from './hoc'
import { useAgentId } from '../../hooks'
import type { Agent } from '../../schema'
import { formatModelName } from '../../utils'

interface AgentSelectMenuBodyProps {
  agents: Agent[]
  handleClose: () => void
  searchQuery: string
}

interface AgentItemProps {
  agent: Agent
  handleClose: () => void
}

export default function AgentSelectMenu() {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null)
  const [searchQuery, setSearchQuery] = React.useState('')

  const { agents, config } = React.useContext(AppContext) as AppContextType

  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
    setSearchQuery('')
  }

  // Filter agents based on the search query
  const filteredAgents = React.useMemo(() => {
    return agents.filter(
      (agent) =>
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.model.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [agents, searchQuery])

  return (
    <div>
      <Tooltip title={config.get().buttons.selectAgent}>
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
            width: 'max-content',
          }}
        >
          {config.get().buttons.agents}
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
          sx: { p: 0 }, // Remove padding to keep header and search tight
        }}
      >
        <Box sx={{ width: 320 }}>
          <Typography
            sx={{
              padding: '12px 16px 8px 16px',
            }}
            variant="h4"
          >
            {config.get().agentsMenu.title}
          </Typography>

          {/* Search Bar Section */}
          <Box sx={{ px: 2, pb: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder={config.get().agentsMenu.placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              variant="outlined"
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <Button
                      onClick={() => setSearchQuery('')}
                      sx={{ minWidth: 0, p: 0.5, color: 'text.secondary' }}
                    >
                      <CloseIcon fontSize="small" />
                    </Button>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                },
              }}
            />
          </Box>
          <Divider />
        </Box>

        {/* Scrollable Container with Safety Rule applied */}
        <Box
          sx={{
            maxHeight: '300px',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr)',
            width: '100%',
            overflowY: 'auto',
          }}
        >
          <AgentSelectMenuBody
            agents={filteredAgents}
            handleClose={handleClose}
            searchQuery={searchQuery}
          />
        </Box>
      </Menu>
    </div>
  )
}

const AgentSelectMenuBody = menuNeedsLogin<AgentSelectMenuBodyProps>(
  (props) => {
    if (props.agents.length === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No agents found
          </Typography>
        </Box>
      )
    }

    return (
      <Box>
        {props.agents.map((agent) => (
          <AgentItem
            key={agent.id}
            agent={agent}
            handleClose={props.handleClose}
          />
        ))}
      </Box>
    )
  },
  (config) => config.agentsMenu.logOutTitle,
)

function AgentItem({ agent, handleClose }: AgentItemProps) {
  const { config } = React.useContext(AppContext) as AppContextType
  const navigate = useNavigate()
  const selectedAgentId = useAgentId()

  return (
    <MenuItem
      key={agent.id}
      onClick={async () => {
        navigate(`/agents/${agent.id}`)
        handleClose()
      }}
      data-testid={`prompt-input-agent-${agent.id}`}
      sx={{ py: 1 }}
    >
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <Typography
            variant="h5"
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {config.getAgent(agent.id)?.title || agent.name}
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {formatModelName(agent.model)}
          </Typography>
        </Box>
        {selectedAgentId === agent.id ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircleIcon color="primary" fontSize="small" />
          </Box>
        ) : null}
      </Box>
    </MenuItem>
  )
}
