import { useMemo, useState, useContext } from 'react'
import { Box, useTheme, type SxProps, type Theme } from '@mui/material'
import {
  AppContext,
  ChatItemContext,
  type AppContextType,
  type ChatItemContextType,
} from '../../../context'

import ModelButtons from './ModelButtons'
import ChatTextRenderer from './ChatTextRenderer'
import UserTextToggleButton from './UserTextToggleButton'
import UserButtons from './UserButtons'
import ChatNegativeFeebackSelection from './ChatNegativeFeebackSelection'
import type { ChatPart } from '../../../schema'

const MAX_COLLAPSED_LENGTH = 116

interface ChatItemProps {
  part: ChatPart
}

export default function ChatText({ part }: ChatItemProps) {
  const theme = useTheme()
  const { config } = useContext(AppContext) as AppContextType
  const { feedback, negativeFeedbackToggle, chat } = useContext(
    ChatItemContext,
  ) as ChatItemContextType

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

  // Define styles with SxProps for type safety on CSS properties
  const bubbleStyles: SxProps<Theme> = {
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
          display: chat.content.role == 'user' ? 'flex' : 'block',
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

      {showModelActions && <ModelButtons part={part} />}

      {showNegativeFeedback && <ChatNegativeFeebackSelection />}
    </Box>
  )
}
