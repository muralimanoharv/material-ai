import React, { useContext, useEffect, useState } from "react"
import { Box } from "@mui/material"
import { ChatItemContext, HistoryContext } from "../context"
import ChatItem from "./ChatItem"
import { CHAT_SECTION_WIDTH } from "../assets/themes"
import { isValidJson } from "../api"

export default function ChatSection() {
  const { history } = useContext(HistoryContext)

  return <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center' }}>
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
  const [chat, setChat] = useState(props.chat)

  useEffect(() => {
    setChat(chat)
  }, [chat])

  let text_parts = []
  let fileNames = []

  for (let part of chat.parts) {
    if(part.text) {
      let text = part.text
      if(isValidJson(text)) {
        let json = JSON.parse(text)
        if(json.fileNames) fileNames = json.fileNames ?? []
      } else {
        text_parts.push(part);
      }
    }
  }

  return <ChatItemContext.Provider value={{ chat, setChat, fileNames }} key={chat.id}>
    <React.Fragment key={chat.id}>
      {text_parts.map((part, idx) => {
        return <ChatItem key={idx} part={part} role={chat.role} fileNames={fileNames}/>
      })}
    </React.Fragment>
  </ChatItemContext.Provider>
}