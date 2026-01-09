import { Box, Collapse, IconButton } from '@mui/material'
import BoltIcon from '@mui/icons-material/Bolt'
import ChatItemWrapper from './ChatItemWrapper'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import { type ChatPart } from '../../../schema'
import { useState } from 'react'

interface ChatFunctionCallProps {
  part: ChatPart
  partIdx: number
  isThinkingSection?: boolean
}

function ChatFunctionCall({
  part,
  partIdx,
  isThinkingSection,
}: ChatFunctionCallProps) {
  const [toggle, setToggle] = useState(false)
  const args = []
  for (const key in part.functionCall?.args) {
    args.push(`${key}=${part.functionCall?.args[key]}`)
  }
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
        <BoltIcon />
        <span data-testid="chat-function-call" className="truc-text">
          {part.functionCall?.name}
        </span>
        <IconButton onClick={() => setToggle(!toggle)}>
          {toggle ? (
            <KeyboardArrowUpIcon fontSize="small" />
          ) : (
            <KeyboardArrowDownIcon fontSize="small" />
          )}
        </IconButton>
      </Box>
      <Collapse in={toggle} timeout="auto" sx={{ marginLeft: '35px' }}>
        <span className="truc-text">
          {part.functionCall?.name}
          {`(${args.join(', ')})`}
        </span>
      </Collapse>
    </ChatItemWrapper>
  )
}

export default ChatFunctionCall
