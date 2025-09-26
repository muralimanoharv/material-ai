import React, { useContext, useEffect, useState } from "react"
import { Box } from "@mui/material"
import { ChatItemContext, HistoryContext } from "../context"
import ChatItem from "./ChatItem"
import { CHAT_SECTION_WIDTH } from "../assets/themes"

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
        '& .chat-item-box:last-of-type .actions-child': {
          opacity: '1'
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

  return <ChatItemContext.Provider value={{ chat, setChat }} key={chat.id}>
    <React.Fragment key={chat.id}>
      {chat.parts.map((part, idx) => {
        return <ChatItem key={idx} part={part} role={chat.role} />
      })}
    </React.Fragment>
  </ChatItemContext.Provider>
}