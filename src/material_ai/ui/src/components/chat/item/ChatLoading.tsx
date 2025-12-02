import { Box, Typography } from '@mui/material'
import LoadingIndicator from './LoadingIndicator'
import { useContext } from 'react'
import { ChatItemContext, type ChatItemContextType } from '../../../context'
import ChatItemWrapper from './ChatItemWrapper'

function ChatLoading(): React.JSX.Element | null {
  const { chat } = useContext(ChatItemContext) as ChatItemContextType

  if (!chat.loading) return null

  return (
    <ChatItemWrapper role="model">
      <Box
        className="gemini-loader-container"
        sx={{
          borderRadius: '24px',
          padding: '2px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
        }}
      >
        <LoadingIndicator />
        <Typography className="gemini-spark" variant="p">
          Just a sec...
        </Typography>
      </Box>
    </ChatItemWrapper>
  )
}

export default ChatLoading
