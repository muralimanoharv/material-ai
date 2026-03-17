import { useContext, type ReactNode } from 'react'
import { ChatItemContext, type ChatItemContextType } from '../../../context'
import { Box } from '@mui/material'

interface ChatItemWrapperProps {
  children: ReactNode
  alignment?: 'flex-start' | 'flex-end'
  role?: string
  partIdx: string
  isThinkingSection?: boolean
}

function ChatItemWrapper({
  children,
  alignment = 'flex-start',
  role,
  partIdx,
  isThinkingSection,
}: ChatItemWrapperProps) {
  const { chat, chatIdx } = useContext(ChatItemContext) as ChatItemContextType

  const effectiveRole = role || chat?.content.role || 'model'

  return (
    <Box
      data-testid={`page-chat-${chatIdx}-part-${partIdx}`}
      className={`${isThinkingSection ? 'chat-item-box-thinking' : 'chat-item-box'} chat-item-box-${effectiveRole}`}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: '10px',
          alignSelf: alignment,
          justifyContent: alignment,
          width: '100%',
          alignItems: 'flex-start',
        }}
      >
        <Box>{children}</Box>
      </Box>
    </Box>
  )
}

export default ChatItemWrapper
