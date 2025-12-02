import { Box } from '@mui/material'
import React from 'react'
import PromptInput from './PromptInput'

export default function Footer(): React.JSX.Element {
  return (
    <Box
      sx={{
        flexShrink: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <PromptInput />
    </Box>
  )
}
