import * as React from 'react'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { Box, Typography } from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { AppContext, type AppContextType } from '../../context'
import { useAgentId } from '../../hooks'

interface ModelItemProps {
  model: string
  tagline: string
}

export default function ModelSelectMenu() {
  const { user, config, agents } = React.useContext(AppContext) as AppContextType

  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null)

  const open = Boolean(anchorEl)

  const agent_id = useAgentId()

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  // Safety check: if config isn't loaded yet, return null
  if (!user || !config || !config.models) return null

  // Calculate vertical offset
  const verticalOffset = -100 - (config.models.length - 1) * 50

  return (
    <React.Fragment>
      <Button
        id="model-button"
        aria-controls={open ? 'model-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon fontSize="small" />}
        sx={{
          borderRadius: '24px',
          padding: '0 16px',
          height: '40px',
          width: '120px',
        }}
      >
        {agents.find(agent => agent.name = agent_id)?.model}
      </Button>
      <Menu
        id="model-menu"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: verticalOffset,
          horizontal: 'left',
        }}
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            // Standard slot for menu styles
          },
        }}
        MenuListProps={{
          'aria-labelledby': 'model-button',
        }}
      >
        <Box sx={{ width: 320 }}>
          <Typography
            sx={{
              padding: '8px 16px',
            }}
            variant="h4"
          >
            Choose your model
          </Typography>
          {config.models.map(({ model, tagline }) => (
            <ModelItem model={model} tagline={tagline} key={model} />
          ))}
        </Box>
      </Menu>
    </React.Fragment>
  )
}

function ModelItem({ model, tagline }: ModelItemProps) {
  return (
    <MenuItem key={model}>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h5">{tagline}</Typography>
          <Typography variant="h6">{model}</Typography>
        </Box>
      </Box>
    </MenuItem>
  )
}
