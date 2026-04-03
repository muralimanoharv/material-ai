import React, { useContext, useMemo, useState } from 'react'
import { Box } from '@mui/material'
import {
  ChatItemContext,
  AppContext,
  type AppContextType,
  type ChatItemContextType,
} from '../../context'
import { CHAT_SECTION_WIDTH } from '../../assets/themes'
import { does_chat_has_func, isValidJson } from '../../utils'
import ChatArtifactSection from './item/ChatArtifactSection'
import ChatLoading from './item/ChatLoading'
import ChatUserFiles from './item/ChatUserFiles'
import type { ChatItem, ChatPart, FeedbackDto } from '../../schema'
import ChatText from './item/ChatText'
import { useAgentId } from '../../hooks'

export default function ChatSection({
  maxWidth = CHAT_SECTION_WIDTH,
}: {
  maxWidth?: string
}) {
  const context = useContext(AppContext) as AppContextType
  const history = useMemo(() => context.history, [context.history])
  return (
    <Box
      data-testid="page-chat-section"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      <Box
        className="chat-items"
        sx={{
          display: 'flex',
          gap: '4px',
          flexDirection: 'column',
          width: '100%',
          maxWidth,
          // CSS trick to show actions only on the very last message
          '& .chat-item-box:last-of-type .actions-child-model': {
            opacity: '1',
          },
          '& .chat-item-box:last-of-type .agent-trace-button': {
            opacity: '1',
          },
          '& .chat-item-box:nth-last-of-type(2) .agent-trace-button': {
            opacity: '1',
          },
          // Add spacing at bottom for the fixed footer input
          '& .chat-item-box:last-of-type': {
            marginBottom: '500px',
          },
        }}
      >
        {history
          .filter((chat) => !does_chat_has_func(chat, true))
          .map((chat, idx) => {
            return <ChatItemSection chat={chat} chatIdx={idx} key={chat.id} />
          })}
      </Box>
    </Box>
  )
}

interface ChatItemSectionProps {
  chat: ChatItem
  chatIdx: number
}

function ChatItemSection(props: ChatItemSectionProps) {
  const context = useContext(AppContext) as AppContextType
  const { config } = context

  const [feedback, setFeedback] = useState<FeedbackDto | undefined>()
  const [negativeFeedbackToggle, setNegativeFeedbackToggle] = useState(false)

  const { chat, chatIdx } = props

  const agentId = useAgentId()

  const postPostiveFeedback = async ({
    feedback_category,
    feedback_text,
  }: FeedbackDto) => {
    try {
      const dto = { feedback_category, feedback_text, id: chat.id }
      // send_feedback returns a curried function: (context) => (data) => Promise
      await context.apiService.send_feedback(dto)

      setFeedback(dto)
      context.setSnack(
        `Thank you! Your feedback helps make ${config.getTitle(agentId)} better for everyone`,
      )
    } catch (e: unknown) {
      console.error(e)
      context.setSnack(config.getErrorMessage())
    }
  }

  const postNegativeFeedback = async ({
    feedback_category,
    feedback_text,
  }: FeedbackDto) => {
    try {
      const dto = { feedback_category, feedback_text, id: chat.id }
      await context.apiService.send_feedback(dto)

      setFeedback(dto)
      setNegativeFeedbackToggle(false)
      context.setSnack(
        `Thank you for helping improve ${config.getTitle(agentId)}`,
      )
    } catch (e: unknown) {
      console.error(e)
      context.setSnack(config.getErrorMessage())
    }
  }

  const chatContext: ChatItemContextType = {
    chat,
    chatIdx,
    feedback,
    negativeFeedbackToggle,
    postPostiveFeedback,
    setFeedback,
    postNegativeFeedback,
    setNegativeFeedbackToggle,
  }

  const parts = chat?.content?.parts || []

  return (
    <ChatItemContext.Provider value={chatContext} key={chat.id}>
      <ChatLoading />
      <ChatArtifactSection />
      <React.Fragment key={chat.id}>
        {parts.map((part, idx) => {
          return (
            <ChatItemSectionBody
              partIdx={idx}
              part={part}
              key={`${chat.id}-${idx}`}
            />
          )
        })}
      </React.Fragment>
    </ChatItemContext.Provider>
  )
}

interface ChatItemSectionBodyProps {
  part: ChatPart
  partIdx: number
}

function ChatItemSectionBody({ part, partIdx }: ChatItemSectionBodyProps) {
  if (part.inlineData) return null

  if (part.functionCall) return null

  if (part.functionResponse) return null

  if (part.text && isValidJson(part.text) && JSON.parse(part.text)?.fileNames) {
    return <ChatUserFiles part={part} />
  }

  return <ChatText partIdx={partIdx} part={part} />
}
