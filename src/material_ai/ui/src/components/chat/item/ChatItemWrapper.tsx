import { useContext, type ReactNode } from 'react'
import { ChatItemContext, type ChatItemContextType } from '../../../context'
import { Box } from '@mui/material'

interface ChatItemWrapperProps {
  children: ReactNode
  alignment?: 'flex-start' | 'flex-end'
  role?: string
  partIdx: string
}

function ChatItemWrapper({
  children,
  alignment = 'flex-start',
  role,
  partIdx,
}: ChatItemWrapperProps) {
  const { chat, chatIdx } = useContext(ChatItemContext) as ChatItemContextType

  const effectiveRole = role || chat.content.role

  return (
    <Box
      data-testid={`page-chat-${chatIdx}-part-${partIdx}`}
      className={`chat-item-box chat-item-box-${effectiveRole}`}
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
        <Box
          sx={{
            padding: '2px 16px',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  )
}

export default ChatItemWrapper
