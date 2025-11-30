import { Box } from '@mui/material'
import BoltIcon from '@mui/icons-material/Bolt'
import ChatItemWrapper from './ChatItemWrapper'

function ChatFunctionCall({ part }) {
  return (
    <ChatItemWrapper role="model">
      <Box
        sx={{
          display: 'flex',
          gap: '25px',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <BoltIcon />
        {part.functionCall.name}
      </Box>
    </ChatItemWrapper>
  )
}

export default ChatFunctionCall
