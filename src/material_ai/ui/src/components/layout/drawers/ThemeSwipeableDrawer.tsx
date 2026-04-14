import * as React from 'react'
import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { Typography } from '@mui/material'
import {
  AppContext,
  LayoutContext,
  type AppContextType,
  type LayoutContextType,
} from '../../../context'
import MaterialList from '../other/MaterialList'
import type { ThemeMode } from '../../../schema'

export default function ThemeSwipeableDrawer() {
  const { config } = React.useContext(AppContext) as AppContextType
  const {
    setThemeDrawerOpen,
    setSettingsDrawerOpen,
    themeDrawerOpen,
    currentTheme,
    setTheme,
  } = React.useContext(LayoutContext) as LayoutContextType

  const theme = useTheme()

  const handleClose = () => {
    setSettingsDrawerOpen(false)
    setThemeDrawerOpen(false)
  }

  const handleOpen = () => {
    setThemeDrawerOpen(true)
  }

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={themeDrawerOpen}
      onClose={handleClose}
      onOpen={handleOpen}
    >
      <Box p={2}>
        <Typography variant="h5">Select a theme</Typography>
        <MaterialList>
          {[
            {
              themeType: 'System',
              label: config.get().buttons.systemTheme,
            },
            {
              themeType: 'Light',
              label: config.get().buttons.lightTheme,
            },
            { themeType: 'Dark', label: config.get().buttons.darkTheme },
          ].map(({ themeType, label }) => {
            const value = themeType.toLowerCase() as ThemeMode
            return (
              <ListItem disablePadding key={themeType}>
                <ListItemButton
                  data-testid={`page-theme-${value}-button`}
                  sx={{
                    backgroundColor: theme.palette.background.default,
                  }}
                  onClick={() => {
                    setTheme(value)
                  }}
                >
                  <ListItemText primary={label} />
                  {currentTheme === value ? (
                    <CheckCircleOutlineIcon
                      data-testid={`page-theme-${value}-selected`}
                      fontSize="small"
                    />
                  ) : null}
                </ListItemButton>
              </ListItem>
            )
          })}
        </MaterialList>
      </Box>
    </SwipeableDrawer>
  )
}
