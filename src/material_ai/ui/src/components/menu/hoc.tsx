import React, { useContext } from 'react'
import { Box, Typography } from '@mui/material'
import { AppContext, type AppContextType } from '../../context'
import SigninButton from '../SigninButton'
import type { AppConfig } from '../../schema'

export const menuNeedsLogin = <P extends object>(
  Component: React.ComponentType<P>,
  message: (config: AppConfig) => string,
) => {
  return (props: P) => {
    const { user, config } = useContext(AppContext) as AppContextType

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
          <Typography variant="h6">{message(config.get())}</Typography>
          <SigninButton />
        </Box>
      )
    }

    return <Component {...props} />
  }
}
