import * as React from 'react'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { Box, Button, Tooltip, Typography } from '@mui/material'
import { AppContext } from '../../context'
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { menuNeedsLogin } from '../../hoc'

export default function AgentSelectMenu() {
  const [anchorEl, setAnchorEl] = React.useState(null)
  const { agents } = React.useContext(AppContext)
  const open = Boolean(anchorEl)
  const handleClick = (event) => {
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
        slotProps={{
          list: {
            'aria-labelledby': 'agent-button',
          },
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

const AgentSelectMenuBody = menuNeedsLogin((props) => {
  return (
    <Box sx={{ width: 300 }}>
      {props.agents.map((agent) => (
        <AgentItem key={agent} agent={agent} />
      ))}
    </Box>
  )
}, 'Sign in to select agents')

function AgentItem({ agent }) {
  const { selectedAgent, setSelectedAgent } = React.useContext(AppContext)
  return (
    <MenuItem key={agent} onClick={() => setSelectedAgent(agent)}>
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
            {agent.replaceAll('_', ' ')}
          </Typography>
          <Typography variant="h6">{agent}</Typography>
        </Box>
        {selectedAgent == agent ? (
          <Box mt={'5px'}>
            <CheckCircleIcon color="primary" />
          </Box>
        ) : null}
      </Box>
    </MenuItem>
  )
}
