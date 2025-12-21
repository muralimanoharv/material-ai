import { Box } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import ChatItemWrapper from './ChatItemWrapper'
import { type ChatPart } from '../../../schema'

interface ChatFunctionResponseProps {
  part: ChatPart
  partIdx: number
}

function ChatFunctionResponse({ part, partIdx }: ChatFunctionResponseProps) {
  return (
    <ChatItemWrapper partIdx={`${partIdx}`} role="model">
      <Box
        sx={{
          display: 'flex',
          gap: '25px',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CheckIcon />
        <span data-testid="chat-function-response">
          {part.functionResponse?.name}
        </span>
      </Box>
    </ChatItemWrapper>
  )
}

export default ChatFunctionResponse
