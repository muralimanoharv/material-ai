import { useContext } from 'react'
import { LayoutContext, type LayoutContextType } from '../context'
import { Box, Typography, useTheme } from '@mui/material'
import SigninButton from './SigninButton'

function DrawerSigninButton() {
  const { isDrawerOpen } = useContext(LayoutContext) as LayoutContextType
  const theme = useTheme()
  return (
    <Box
      width={isDrawerOpen() ? 'auto' : 0}
      display={isDrawerOpen() ? 'flex' : 'none'}
      className="fade-in-animation"
      sx={{
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '25px',
        // Cast to 'any' if 'cardHover' is not in your theme.d.ts
        background:
          (theme.palette.background).cardHover ||
          theme.palette.grey[100],
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
        <Typography variant="h5">Sign in to start saving your chats</Typography>
        <Typography variant="h6" sx={{ textWrap: 'wrap' }}>
          Once you're signed in, you can access your recent chats here.
        </Typography>
      </Box>
      <SigninButton varient="text" />
    </Box>
  )
}

export default DrawerSigninButton
