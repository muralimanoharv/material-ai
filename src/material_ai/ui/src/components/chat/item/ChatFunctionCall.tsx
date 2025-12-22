import { Box } from '@mui/material'
import BoltIcon from '@mui/icons-material/Bolt'
import ChatItemWrapper from './ChatItemWrapper'
import { type ChatPart } from '../../../schema'

interface ChatFunctionCallProps {
  part: ChatPart
  partIdx: number
}

function ChatFunctionCall({ part, partIdx }: ChatFunctionCallProps) {
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
        <BoltIcon />
        <span data-testid="chat-function-call">{part.functionCall?.name}</span>
      </Box>
    </ChatItemWrapper>
  )
}

export default ChatFunctionCall
