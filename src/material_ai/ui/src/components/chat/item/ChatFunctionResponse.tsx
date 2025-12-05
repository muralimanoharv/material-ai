import { Box } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import ChatItemWrapper from './ChatItemWrapper'
import { type ChatPart } from '../../../schema'

interface ChatFunctionResponseProps {
  part: ChatPart
}

function ChatFunctionResponse({ part }: ChatFunctionResponseProps) {
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
        {part.functionResponse?.name}
      </Box>
    </ChatItemWrapper>
  )
}

export default ChatFunctionResponse
