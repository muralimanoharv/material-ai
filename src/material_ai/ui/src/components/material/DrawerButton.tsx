import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import { List, ListItemText, Tooltip, Typography } from '@mui/material'
import React, { useContext } from 'react'
import { LayoutContext, type LayoutContextType } from '../../context'

interface DrawerButtonProps {
  icon: React.ReactNode
  title: string
  onClick: () => void
  tooltip?: string
  disabled?: boolean
}

export default function DrawerButton({
  icon,
  title,
  onClick,
  tooltip = '',
  disabled = false,
}: DrawerButtonProps) {
  const { isDrawerOpen } = useContext(LayoutContext) as LayoutContextType

  const open = isDrawerOpen()

  return (
    <List>
      <ListItem disablePadding sx={{ display: 'block' }}>
        <ListItemButton
          onClick={onClick}
          disableRipple
          disabled={disabled}
          sx={[
            {
              minHeight: 48,
              px: 2.5,
            },
            open
              ? {
                  justifyContent: 'initial',
                }
              : {
                  justifyContent: 'center',
                },
          ]}
        >
          <Tooltip title={tooltip}>
            <ListItemIcon
              sx={[
                {
                  minWidth: 0,
                  justifyContent: 'center',
                },
                open
                  ? {
                      mr: 3,
                    }
                  : {
                      mr: 'auto',
                    },
              ]}
            >
              {icon}
            </ListItemIcon>
          </Tooltip>

          <ListItemText>
            <Typography
              fontWeight={300}
              variant="h5"
              sx={[
                open
                  ? {
                      opacity: 1,
                    }
                  : {
                      opacity: 0,
                    },
              ]}
            >
              {title}
            </Typography>
          </ListItemText>
        </ListItemButton>
      </ListItem>
    </List>
  )
}
