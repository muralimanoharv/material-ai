import React, { useContext } from 'react'
import { Box, Typography } from '@mui/material'
import { AppContext, type AppContextType } from '../../context'
import SigninButton from '../SigninButton'

export const menuNeedsLogin = <P extends object>(
  Component: React.ComponentType<P>,
  message: string,
) => {
  return (props: P) => {
    const { user } = useContext(AppContext) as AppContextType

    if (!user) {
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
    }

    return <Component {...props} />
  }
}
