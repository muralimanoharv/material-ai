import React, { useContext, useMemo, useState } from "react"
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

  const [text_parts, files] = useMemo(() => {
    let textParts = []
    let fileNames = []
    let fileData = []
    let filesList = []

    for (let part of chat.parts) {
      if (part.text) {
        let text = part.text
        if (isValidJson(text)) {
          let json = JSON.parse(text)
          if (json.fileNames) fileNames = json.fileNames ?? []
        } else {
          textParts.push(part);
        }
      } else if (part.inline_data || part.inlineData) {
        fileData.push(part.inline_data || part.inlineData)
      } else {
        textParts.push(part)
      }
    }
    for(let i = 0; i < fileNames.length; i++) {
      let fileDto = {
        name: fileNames[i],
        version: 0,
        type: 'upload',
      }
      if(fileData[i]) {
        fileDto = {...fileDto, inlineData: {...fileData[i]}}
      }
      filesList.push(fileDto)
    }

    if (chat?.actions?.artifact_delta) {
      Object.keys(chat.actions.artifact_delta)
        .forEach(key => {
          filesList.push({
            name: key,
            version: chat.actions.artifact_delta[key],
            type: 'artifact'
          })
        })
    }
    return [textParts, filesList]
  }, [])


  const chatContext = {
    chat,
    files, postPostiveFeedback,
    feedback, setFeedback, postNegativeFeedback, negativeFeedbackToggle, setNegativeFeedbackToggle
  }

  return <ChatItemContext.Provider value={chatContext} key={chat.id}>
    <React.Fragment key={chat.id}>
      {text_parts.map((part, idx) => {
        return <ChatItem key={idx} part={part} role={chat.role} files={files} />
      })}
    </React.Fragment>
  </ChatItemContext.Provider>
}