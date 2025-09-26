
import { Box, IconButton, Tooltip, Typography, useTheme } from "@mui/material"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import BoltIcon from '@mui/icons-material/Bolt';
import CheckIcon from '@mui/icons-material/Check';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import RefreshIcon from '@mui/icons-material/Refresh';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import CopyAllOutlinedIcon from '@mui/icons-material/CopyAllOutlined';
import { useContext, useState } from "react";
import { AppContext, ChatItemContext, HistoryContext } from "../context";



function TypographyParser(varient) {
  return (props) => <Typography variant={varient}>{props.children}</Typography>
}
export default function ChatItem(props) {
  const theme = useTheme()
  let isUser = () => props.role == 'user'
  let justifyContent = isUser() ? 'flex-end' : 'flex-start'
  let alignSelf = isUser() ? 'flex-end' : 'flex-start'
  let backgroundColor = isUser() ? theme.palette.background.paper : theme.palette.background.default;
  let content = <div className='react-markdown'>
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: TypographyParser('p'),
        h1: TypographyParser('h1'),
        h2: TypographyParser('h2'),
        h3: TypographyParser('h3'),
        h4: TypographyParser('h4'),
        h5: TypographyParser('h5'),
        h6: TypographyParser('h6')
      }}
    >
      {props.part?.text}
    </ReactMarkdown>
  </div>
  let isFunctionCall = false

  if (props.part.functionCall) {
    isFunctionCall = true
    content = <Box sx={{ display: 'flex', gap: '5px', justifyContent: 'center', alignItems: 'center' }}>
      <BoltIcon />
      {props.part.functionCall.name}
    </Box>
  }
  if (props.part.functionResponse) {
    isFunctionCall = true
    content = <Box sx={{ display: 'flex', gap: '5px', justifyContent: 'center', alignItems: 'center' }}>
      <CheckIcon />
      {props.part.functionResponse.name}
    </Box>
  }
  if (isFunctionCall) backgroundColor = theme.palette.background.default

  if (props)
    return <Box className="chat-item-box" sx={{
      '&:hover .actions-child': {
        opacity: '1',
        transition: 'opacity 0.2s ease'
      },
    }}>
      <Box sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: '10px',
        alignSelf,
        justifyContent,
        width: '100%',
        alignItems: 'center'
      }}
      >

        <Box sx={{
          backgroundColor,
          borderRadius: '24px',
          borderTopRightRadius: isUser() ? '0px' : undefined,
          borderTopLeftRadius: !isUser() ? '0px' : undefined,
          maxWidth: isUser() ? '452px' : undefined,
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '20px'
        }}
        >
          {!isUser() && !isFunctionCall ? <img src="/gemini.svg" /> : null}
          {content}
        </Box>
      </Box>
      {!isUser() && !isFunctionCall ? <ModelButtons {...props} /> : null}
    </Box>
}





function ModelButtons(props) {

  const { send, setSnack } = useContext(AppContext)
  const { delete_history } = useContext(HistoryContext);
  const { chat, setChat } = useContext(ChatItemContext)

  const actions = [
    {
      icon: <ThumbUpOffAltIcon fontSize="small" />,
      tooltip: 'Good response',
      onClick: (action) => {
        if(chat.selectedAction) {
          setChat({ ...chat, selectedAction: undefined })
          return
        }
        setChat({ ...chat, selectedAction: action.tooltip })
        setSnack('Thank you! Your feedback helps make Gemini better for everyone')
      },
    },
    {
      icon: <ThumbDownOffAltIcon fontSize="small" />,
      tooltip: 'Bad response',
      onClick: (action) => {
        if(chat.selectedAction) {
          setChat({ ...chat, selectedAction: undefined })
          return
        }
        setChat({ ...chat, selectedAction: action.tooltip })
        setSnack('Thank you for helping improve Gemini')
      },
    },
    {
      icon: <RefreshIcon fontSize="small" />,
      tooltip: 'Redo',
      onClick: () => {
        let prompt = chat.prompt
        delete_history(chat.id)
        send(prompt, { ignoreUserHistory: true })
      },
    },
    {
      icon: <ShareOutlinedIcon fontSize="small" />,
      tooltip: 'Share & export',
      onClick: () => { }
    },
    {
      icon: <CopyAllOutlinedIcon fontSize="small" />,
      tooltip: 'Copy response',
      onClick: async () => {
        await navigator.clipboard.writeText(props.part.text);
        setSnack('Copied to clipboard')
      },
    }
  ]
  let getColor = (action) => {
    if (chat?.selectedAction == action.tooltip) return 'primary'
    return "default"
  }
  return <Box
    className="actions-child"
    sx={{
      marginLeft: '20px',
      opacity: chat.selectedAction ? '1': '0',
      transition: 'opacity 0.5s ease'
    }}>
    {actions.map((action) => {
      return <Tooltip key={action.tooltip} title={action.tooltip}>
        <IconButton color={getColor(action)} onClick={() => {
          action.onClick(action)
        }} key={action.tooltip}>{action.icon}</IconButton>
      </Tooltip>
    })}
  </Box>
}

