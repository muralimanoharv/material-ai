import React, { useContext, useEffect, useMemo, useState } from "react"
import { Box } from "@mui/material"
import { ChatItemContext, AppContext } from "../../context"
import ChatItem from "./ChatItem"
import { CHAT_SECTION_WIDTH } from "../../assets/themes"
import { isValidJson, send_feedback } from "../../api"
import { ERROR_MESSAGE } from "../../assets/config"

export default function ChatSection() {
  const { history } = useContext(AppContext)

  return <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center', position: 'relative' }}>
    <Box sx={
      {
        display: 'flex',
        gap: "10px",
        flexDirection: 'column',
        width: '100%',
        maxWidth: CHAT_SECTION_WIDTH,
        '& .chat-item-box:last-of-type .actions-child-model': {
          opacity: '1'
        },
        '& .chat-item-box:last-of-type': {
          marginBottom: '500px'
        },
      }
    }>
      {history.map(chat => {
        return <ChatItemSection chat={chat} key={chat.id} />
      })}
    </Box>
  </Box>

}

function ChatItemSection(props) {
  const context = useContext(AppContext)
  const [feedback, setFeedback] = useState()
  const [negativeFeedbackToggle, setNegativeFeedbackToggle] = useState(false)
  const chat = props.chat;

  const postPostiveFeedback = async ({ feedback_category, feedback_text }) => {
    try {
      const dto = { feedback_category, feedback_text, id: chat.id }
      await send_feedback(context)(dto)
      setFeedback(dto)
      context.setSnack('Thank you! Your feedback helps make Gemini better for everyone')
    } catch (e) {
      console.error(e);
      context.setSnack(ERROR_MESSAGE)
    }
  }

  const postNegativeFeedback = async ({ feedback_category, feedback_text }) => {
    try {
      const dto = { feedback_category, feedback_text, id: chat.id }
      await send_feedback(context)(dto)
      setFeedback(dto)
      setNegativeFeedbackToggle(false)
      context.setSnack('Thank you for helping improve Gemini')
    } catch (e) {
      console.error(e);
      context.setSnack(ERROR_MESSAGE)
    }
  }

  const [text_parts, fileNames] = useMemo(() => {
    let text_parts = []
    let fileNames = []

    for (let part of chat.parts) {
      if (part.text) {
        let text = part.text
        if (isValidJson(text)) {
          let json = JSON.parse(text)
          if (json.fileNames) fileNames = json.fileNames ?? []
        } else {
          text_parts.push(part);
        }
      } else if (!part.inlineData) {
        text_parts.push(part);
      }
    }
    return [text_parts, fileNames]
  }, [])



  return <ChatItemContext.Provider value={{
    chat,
    fileNames, postPostiveFeedback,
    feedback, setFeedback, postNegativeFeedback, negativeFeedbackToggle, setNegativeFeedbackToggle
  }} key={chat.id}>
    <React.Fragment key={chat.id}>
      {text_parts.map((part, idx) => {
        return <ChatItem key={idx} part={part} role={chat.role} fileNames={fileNames} />
      })}
    </React.Fragment>
  </ChatItemContext.Provider>
}