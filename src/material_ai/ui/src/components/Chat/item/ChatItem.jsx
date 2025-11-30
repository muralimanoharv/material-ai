import { useMemo, useState, useContext } from 'react'
import { Box, useTheme } from '@mui/material'
import { AppContext, ChatItemContext } from '../../../context'

import ModelButtons from './ModelButtons'
import ChatTextRenderer from './ChatTextRenderer'
import UserTextToggleButton from './UserTextToggleButton'
import UserButtons from './UserButtons'
import ChatNegativeFeebackSelection from './ChatNegativeFeebackSelection'

const MAX_COLLAPSED_LENGTH = 116

export default function ChatItem({ part }) {
  const theme = useTheme()
  const { config } = useContext(AppContext)
  const { feedback, negativeFeedbackToggle, chat, files } =
    useContext(ChatItemContext)

  const [isExpanded, setIsExpanded] = useState(false)

  const text = part?.text ?? ''
  const role = chat.content.role
  const isUserMessage = role === 'user'
  const isModelMessage = role === 'model'

  const isLargeText = text.length > MAX_COLLAPSED_LENGTH

  const alignment = isUserMessage ? 'flex-end' : 'flex-start'
  const bubbleColor = isUserMessage
    ? theme.palette.background.paper
    : theme.palette.background.default

  const showUserActions = isUserMessage
  const showModelActions = isModelMessage
  const showGeminiIcon = isModelMessage
  const showToggleBtn = isUserMessage && isLargeText
  const showNegativeFeedback =
    feedback?.feedback_category === config.feedback.negative.value &&
    negativeFeedbackToggle

  const bubbleStyles = {
    backgroundColor: bubbleColor,
    borderRadius: '24px',
    borderTopRightRadius: isUserMessage ? '0px' : undefined,
    borderTopLeftRadius: !isUserMessage ? '0px' : undefined,
    maxWidth: isUserMessage ? '452px' : undefined,
    padding: isUserMessage ? '12px 16px' : '2px 16px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '20px',
  }

  const content = useMemo(() => {
    return (
      <ChatTextRenderer
        textExpand={isExpanded}
        isUser={isUserMessage}
        isLargeText={() => isLargeText}
        part={part}
      />
    )
  }, [part, isExpanded, isUserMessage, isLargeText])

  return (
    <Box className={`chat-item-box chat-item-box-${chat.content.role}`}>
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
        {showUserActions && <UserButtons text={text} />}

        <Box sx={bubbleStyles}>
          {showGeminiIcon && <img src="/gemini.svg" alt="Gemini" />}

          {content}

          {showToggleBtn && (
            <UserTextToggleButton
              textExpand={isExpanded}
              textExpandToggle={() => setIsExpanded(!isExpanded)}
            />
          )}
        </Box>
      </Box>

      {showModelActions && (
        <ModelButtons part={part} role={role} files={files} />
      )}

      {showNegativeFeedback && <ChatNegativeFeebackSelection />}

    </Box>
  )
}
