import { useContext } from 'react'
import { AppContext } from './context'
import { Box, Typography } from '@mui/material'
import SigninButton from './components/SigninButton'

export const menuNeedsLogin = (Component, message) => {
  return (props) => {
    const { user } = useContext(AppContext)

    if (!user)
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '4px 16px',
            gap: '35px',
          }}
        >
          <Typography variant="h6">{message}</Typography>
          <SigninButton />
        </Box>
      )

    return <Component {...props} />
  }
}
