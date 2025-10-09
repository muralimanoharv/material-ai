import * as React from 'react'
import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { Typography } from '@mui/material'
import { LayoutContext } from '../../../context'
import MaterialList from '../../material/MaterialList'

export default function ThemeSwipeableDrawer() {
  const {
    setThemeDrawerOpen,
    setSettingsDrawerOpen,
    themeDrawerOpen,
    currentTheme,
    setTheme,
  } = React.useContext(LayoutContext)
  const theme = useTheme()

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={themeDrawerOpen}
      onClose={() => {
        setSettingsDrawerOpen(false)
        setThemeDrawerOpen(false)
      }}
    >
      <Box p={2}>
        <Typography variant="h5">Select a theme</Typography>
        <MaterialList>
          {['System', 'Light', 'Dark'].map((themeType) => {
            return (
              <ListItem disablePadding key={themeType}>
                <ListItemButton
                  sx={{
                    backgroundColor: theme.palette.background.default,
                  }}
                  onClick={() => {
                    setTheme(themeType.toLowerCase())
                  }}
                >
                  <ListItemText primary={themeType} />
                  {currentTheme === themeType.toLowerCase() ? (
                    <CheckCircleOutlineIcon fontSize="small" />
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
