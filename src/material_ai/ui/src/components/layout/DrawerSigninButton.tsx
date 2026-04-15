import { useContext } from 'react'
import {
  AppContext,
  LayoutContext,
  type AppContextType,
  type LayoutContextType,
} from '../../context'
import { Box, Typography, useTheme } from '@mui/material'
import SigninButton from '../SigninButton'

function DrawerSigninButton() {
  const { isDrawerOpen } = useContext(LayoutContext) as LayoutContextType
  const { config } = useContext(AppContext) as AppContextType
  const theme = useTheme()
  return (
    <Box
      width={isDrawerOpen() ? 'auto' : 0}
      display={isDrawerOpen() ? 'flex' : 'none'}
      className="fade-in-animation"
      data-testid="drawer-signin-button"
      sx={{
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '25px',
        background:
          theme.palette.background.cardHover || theme.palette.grey[100],
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
        padding: '16px 20px',
      }}
    >
      <Box
        width="auto"
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          flexDirection: 'column',
          gap: '5px',
        }}
      >
        <Typography variant="h5">{config.get().drawer.logOutTitle}</Typography>
        <Typography variant="h6" sx={{ textWrap: 'wrap' }}>
          {config.get().drawer.logOutSubTitle}
        </Typography>
      </Box>
      <SigninButton varient="text" />
    </Box>
  )
}

export default DrawerSigninButton
