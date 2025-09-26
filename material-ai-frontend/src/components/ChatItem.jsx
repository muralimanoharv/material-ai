
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
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useContext, useState, useMemo, useCallback } from "react";
import { AppContext, ChatItemContext, HistoryContext } from "../context";
import FileBox from "./FileBox";
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import KeyboardArrowUpOutlinedIcon from '@mui/icons-material/KeyboardArrowUpOutlined';




function TypographyParser(varient) {
  return (props) => <Typography variant={varient}>{props.children}</Typography>
}
export default function ChatItem(props) {
  const theme = useTheme()
  const { setSnack, setPrompt } = useContext(AppContext)
  const { chat } = useContext(ChatItemContext)
  let isUser = () => props.role == 'user'
  let originalText = props.part?.text ?? ''
  let isLargeText = originalText.length > 116
  let truncatedText = isUser() && isLargeText ? 
  `${originalText.substring(0, 116)}...` : originalText

  const [text, setText] = useState(truncatedText)
  const [textExpand, setTextExpand] = useState(false)

  let justifyContent = isUser() ? 'flex-end' : 'flex-start'
  let alignSelf = isUser() ? 'flex-end' : 'flex-start'
  let backgroundColor = isUser() ? theme.palette.background.paper : theme.palette.background.default;

  let content = useMemo(() => {
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
          h6: TypographyParser('h6'),
          pre: (props) => <pre style={{
            backgroundColor: theme.palette.background.paper,
            padding: '10px'
          }}>{props.children}</pre>
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
    if (chat.cancelled) {
      content = <Typography
        sx={{ opacity: '0.9' }}
        fontSize={'16px'} fontWeight={400}
        mt={1} variant="h5"><i>{props.part?.text}</i>
      </Typography>
    }
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
    return content
  }, [props.part])

  let isFunctionCall = false

  if (isFunctionCall) backgroundColor = theme.palette.background.default

  const classes = ["chat-item-box", `chat-item-box-${props.role}`]

  if (props)
    return <Box className={classes.join(' ')} sx={{
      '&:hover .actions-child': {
        opacity: '1',
        transition: 'opacity 0.2s ease'
      },
      display: 'flex',
      flexDirection: 'column',
      gap: props.fileNames?.length ? '5px' : undefined
    }}>
      <Box sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: '10px',
        alignSelf,
        justifyContent,
        width: '100%',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        {
          props.fileNames.map(fileName => <FileBox key={fileName} file={{ name: fileName }} />)
        }
      </Box>
      <Box sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: '10px',
        alignSelf,
        justifyContent,
        width: '100%',
        alignItems: 'flex-start'
      }}
      >
        {
          isUser() && <Box className="actions-child" sx={{
            marginLeft: '20px',
            opacity: '0',
            transition: 'opacity 0.5s ease'
          }}>
            <Tooltip title="Copy prompt">
              <IconButton onClick={async () => {
                await navigator.clipboard.writeText(chat.prompt);
                setSnack('Prompt copied')
              }}>
                <CopyAllOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit prompt">
              <IconButton onClick={() => {
                setPrompt(chat.prompt)
              }}>
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        }
        <Box sx={{
          backgroundColor,
          borderRadius: '24px',
          borderTopRightRadius: isUser() ? '0px' : undefined,
          borderTopLeftRadius: !isUser() ? '0px' : undefined,
          maxWidth: isUser() ? '452px' : undefined,
          padding: isUser() ? '12px 16px' : '2px 16px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '20px'
        }}
        >
          {!isUser() && !isFunctionCall ? <img src="/gemini.svg" /> : null}
          {content}
          {
            isUser() && isLargeText && <IconButton onClick={() => {
              if (textExpand) {
                setText(truncatedText)
              } else {
                setText(originalText)
              }
              setTextExpand(!textExpand)
            }}>
              {textExpand ? <KeyboardArrowUpOutlinedIcon /> : <KeyboardArrowDownOutlinedIcon />}
            </IconButton>
          }
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
        if (chat.selectedAction) {
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
        if (chat.selectedAction) {
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
    className="actions-child actions-child-model"
    sx={{
      marginLeft: '20px',
      opacity: chat.selectedAction ? '1' : '0',
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

