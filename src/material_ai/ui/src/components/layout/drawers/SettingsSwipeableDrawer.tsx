import * as React from 'react'
import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart'
import PaletteIcon from '@mui/icons-material/Palette'
import ArrowRightIcon from '@mui/icons-material/ArrowRight'
import ThemeSwipeableDrawer from './ThemeSwipeableDrawer'
import {
  AppContext,
  LayoutContext,
  type AppContextType,
} from '../../../context'
import MaterialList from '../other/MaterialList'
import { useNavigate } from 'react-router'

// Define the Context shape
interface LayoutContextType {
  setThemeDrawerOpen: (open: boolean) => void
  setSettingsDrawerOpen: (open: boolean) => void
  settingsDrawerOpen: boolean
}

export default function SettingsSwipeableDrawer() {
  const { config } = React.useContext(AppContext) as AppContextType
  const { setThemeDrawerOpen, setSettingsDrawerOpen, settingsDrawerOpen } =
    React.useContext(LayoutContext) as unknown as LayoutContextType

  const theme = useTheme()
  const navigate = useNavigate()

  return (
    <>
      <SwipeableDrawer
        anchor="bottom"
        open={settingsDrawerOpen}
        onClose={() => {
          setSettingsDrawerOpen(false)
        }}
        // 'onOpen' is required by the TypeScript definition of SwipeableDrawer
        onOpen={() => {
          setSettingsDrawerOpen(true)
        }}
      >
        <Box p={2}>
          <MaterialList>
            <ListItem disablePadding>
              <ListItemButton
                data-testid="page-theme-button"
                sx={{
                  backgroundColor: theme.palette.background.default,
                }}
                onClick={() => setThemeDrawerOpen(true)}
              >
                <ListItemIcon>
                  <PaletteIcon />
                </ListItemIcon>
                <ListItemText primary={config.get().buttons.theme} />
                <ArrowRightIcon />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                data-testid="page-health-button"
                sx={{
                  backgroundColor: theme.palette.background.default,
                }}
                onClick={() => {
                  setSettingsDrawerOpen(false)
                  navigate('/health')
                }}
              >
                <ListItemIcon>
                  <MonitorHeartIcon />
                </ListItemIcon>
                <ListItemText primary={config.get().buttons.health} />
                <ArrowRightIcon />
              </ListItemButton>
            </ListItem>
          </MaterialList>
        </Box>
      </SwipeableDrawer>
      <ThemeSwipeableDrawer />
    </>
  )
}
