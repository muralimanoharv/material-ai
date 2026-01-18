import { Box, Collapse, IconButton } from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import CheckIcon from '@mui/icons-material/Check'
import ChatItemWrapper from './ChatItemWrapper'
import { type ChatPart } from '../../../schema'
import { useState } from 'react'

interface ChatFunctionResponseProps {
  part: ChatPart
  partIdx: number
  isThinkingSection?: boolean
}

function ChatFunctionResponse({
  part,
  partIdx,
  isThinkingSection,
}: ChatFunctionResponseProps) {
  const [toggle, setToggle] = useState(false)
  const result = part.functionResponse?.response
  return (
    <ChatItemWrapper
      partIdx={`${partIdx}`}
      role="model"
      isThinkingSection={isThinkingSection}
    >
      <Box
        sx={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-start',
          alignItems: 'center',
        }}
      >
        <CheckIcon />
        <span data-testid="chat-function-response-name" className="truc-text">
          {part.functionResponse?.name}
        </span>
        <IconButton
          data-testid="chat-function-response-toggle"
          onClick={() => setToggle(!toggle)}
        >
          {toggle ? (
            <KeyboardArrowUpIcon fontSize="small" />
          ) : (
            <KeyboardArrowDownIcon fontSize="small" />
          )}
        </IconButton>
      </Box>
      <Collapse in={toggle} timeout="auto" sx={{ marginLeft: '35px' }}>
        <span data-testid="chat-function-response-result" className="truc-text">
          {part.functionResponse?.name + ' -> '}
          {result ? JSON.stringify(result, null, 2) : 'null'}
        </span>
      </Collapse>
    </ChatItemWrapper>
  )
}

export default ChatFunctionResponse
