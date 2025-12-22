import * as React from 'react'
import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { Typography } from '@mui/material'
import { LayoutContext, type LayoutContextType } from '../../../context'
import MaterialList from '../../material/MaterialList'
import type { ThemeMode } from '../../../schema'

export default function ThemeSwipeableDrawer() {
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
          {['System', 'Light', 'Dark'].map((themeType) => {
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
                  <ListItemText primary={themeType} />
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
