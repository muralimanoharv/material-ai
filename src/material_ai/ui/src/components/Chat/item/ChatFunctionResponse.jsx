import { Box } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import ChatItemWrapper from './ChatItemWrapper'

function ChatFunctionResponse({ part }) {
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
        <CheckIcon />
        {part.functionResponse.name}
      </Box>
    </ChatItemWrapper>
  )
}

export default ChatFunctionResponse
