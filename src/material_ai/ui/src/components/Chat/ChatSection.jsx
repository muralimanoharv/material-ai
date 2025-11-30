import React, { useContext, useMemo, useState } from 'react'
import { Box } from '@mui/material'
import { ChatItemContext, AppContext } from '../../context'
import ChatItem from './item/ChatItem'
import { CHAT_SECTION_WIDTH } from '../../assets/themes'
import { send_feedback, UNAUTHORIZED } from '../../api'
import { isValidJson } from '../../utils'
import ChatArtifactSection from './item/ChatArtifactSection'
import ChatLoading from './item/ChatLoading'
import ChatFunctionCall from './item/ChatFunctionCall'
import ChatFunctionResponse from './item/ChatFunctionResponse'
import ChatUserFiles from './item/ChatUserFiles'

export default function ChatSection() {
  const context = useContext(AppContext)
  const history = useMemo(() => context.history, [context.history])
  return (
    <Box
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
          '& .chat-item-box:last-of-type .actions-child-model': {
            opacity: '1',
          },
          '& .chat-item-box:last-of-type': {
            marginBottom: '500px',
          },
        }}
      >
        {history.map((chat) => {
          return <ChatItemSection chat={chat} key={chat.id} />
        })}
      </Box>
    </Box>
  )
}

function ChatItemSection(props) {
  const context = useContext(AppContext)
  const { config } = context
  const [feedback, setFeedback] = useState()
  const [negativeFeedbackToggle, setNegativeFeedbackToggle] = useState(false)
  const chat = props.chat

  const postPostiveFeedback = async ({ feedback_category, feedback_text }) => {
    try {
      const dto = { feedback_category, feedback_text, id: chat.id }
      await send_feedback(context)(dto)
      setFeedback(dto)
      context.setSnack(
        `Thank you! Your feedback helps make ${config.title} better for everyone`,
      )
    } catch (e) {
      if (e.name == UNAUTHORIZED) return
      console.error(e)
      context.setSnack(config.errorMessage)
    }
  }

  const postNegativeFeedback = async ({ feedback_category, feedback_text }) => {
    try {
      const dto = { feedback_category, feedback_text, id: chat.id }
      await send_feedback(context)(dto)
      setFeedback(dto)
      setNegativeFeedbackToggle(false)
      context.setSnack(`Thank you for helping improve ${config.title}`)
    } catch (e) {
      if (e.name == UNAUTHORIZED) return
      console.error(e)
      context.setSnack(config.errorMessage)
    }
  }

  const chatContext = {
    chat,
    feedback,
    negativeFeedbackToggle,
    postPostiveFeedback,
    setFeedback,
    postNegativeFeedback,
    setNegativeFeedbackToggle,
  }

  return (
    <ChatItemContext.Provider value={chatContext} key={chat.id}>
      <React.Fragment key={chat.id}>
        {chat.content.parts.map((part, idx) => {
          return <ChatItemSectionBody part={part} key={`${chat.id}-${idx}`} />
        })}
      </React.Fragment>
      <ChatArtifactSection />
      <ChatLoading />
    </ChatItemContext.Provider>
  )
}

function ChatItemSectionBody({ part }) {
  if (part.inlineData) return null
  if (part.functionCall) return <ChatFunctionCall part={part}/>
  if (part.functionResponse) return <ChatFunctionResponse part={part}/>
  if (isValidJson(part.text)) return <ChatUserFiles part={part} />

  return <ChatItem part={part} />
}
