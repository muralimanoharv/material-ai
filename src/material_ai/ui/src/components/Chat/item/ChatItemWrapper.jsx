import { useContext } from 'react'
import { ChatItemContext } from '../../../context'
import { Box } from '@mui/material'

function ChatItemWrapper({ children, alignment = 'flex-start', role }) {
  const { chat } = useContext(ChatItemContext)
  role = role || chat.content.role
  return (
    <Box className={`chat-item-box chat-item-box-${role}`}>
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
