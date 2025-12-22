import React, { useContext, useMemo, useState } from 'react'
import { Box } from '@mui/material'
import {
  ChatItemContext,
  AppContext,
  type AppContextType,
  type ChatItemContextType,
} from '../../context'
import { CHAT_SECTION_WIDTH } from '../../assets/themes'
import { isValidJson } from '../../utils'
import ChatArtifactSection from './item/ChatArtifactSection'
import ChatLoading from './item/ChatLoading'
import ChatFunctionCall from './item/ChatFunctionCall'
import ChatFunctionResponse from './item/ChatFunctionResponse'
import ChatUserFiles from './item/ChatUserFiles'
import type { ChatItem, ChatPart, FeedbackDto } from '../../schema'
import ChatText from './item/ChatText'

export default function ChatSection() {
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
          gap: '10px',
          flexDirection: 'column',
          width: '100%',
          maxWidth: CHAT_SECTION_WIDTH,
          // CSS trick to show actions only on the very last message
          '& .chat-item-box:last-of-type .actions-child-model': {
            opacity: '1',
          },
          // Add spacing at bottom for the fixed footer input
          '& .chat-item-box:last-of-type': {
            marginBottom: '500px',
          },
        }}
      >
        {history.map((chat, idx) => {
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
        `Thank you! Your feedback helps make ${config.title} better for everyone`,
      )
    } catch (e: unknown) {
      console.error(e)
      context.setSnack(config.errorMessage)
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
      context.setSnack(`Thank you for helping improve ${config.title}`)
    } catch (e: unknown) {
      console.error(e)
      context.setSnack(config.errorMessage)
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
      <ChatArtifactSection />
      <ChatLoading />
    </ChatItemContext.Provider>
  )
}

interface ChatItemSectionBodyProps {
  part: ChatPart
  partIdx: number
}

function ChatItemSectionBody({ part, partIdx }: ChatItemSectionBodyProps) {
  // 1. Skip inline data (images/files are usually handled inside other wrappers or skipped here)
  if (part.inlineData) return null

  // 2. Handle Function Calls
  if (part.functionCall)
    return <ChatFunctionCall partIdx={partIdx} part={part} /> // Cast if ChatFunctionCall expects specific shape

  // 3. Handle Function Responses
  if (part.functionResponse)
    return <ChatFunctionResponse partIdx={partIdx} part={part} />

  // 4. Handle "Hidden" JSON Metadata (User Files)
  // We check if text exists and is valid JSON
  if (part.text && isValidJson(part.text) && JSON.parse(part.text)?.fileNames) {
    return <ChatUserFiles partIdx={partIdx} part={part} />
  }

  // 5. Default: Render Text Message
  return <ChatText partIdx={partIdx} part={part} />
}
