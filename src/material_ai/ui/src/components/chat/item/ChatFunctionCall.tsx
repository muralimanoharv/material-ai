import { Box } from '@mui/material'
import BoltIcon from '@mui/icons-material/Bolt'
import ChatItemWrapper from './ChatItemWrapper'
import { type ChatPart } from '../../../schema'

interface ChatFunctionCallProps {
  part: ChatPart
}

function ChatFunctionCall({ part }: ChatFunctionCallProps) {
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
        {part.functionCall?.name}
      </Box>
    </ChatItemWrapper>
  )
}

export default ChatFunctionCall
