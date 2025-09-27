
import { Box, useTheme } from "@mui/material"
import { useContext, useMemo, useState } from "react";
import { ChatItemContext } from "../../context";
import ModelButtons from "./ModelButtons";
import ChatBodyRenderer from "./ChatBodyRenderer"
import BoltIcon from '@mui/icons-material/Bolt';
import CheckIcon from '@mui/icons-material/Check';
import UserTextToggleButton from "./UserTextToggleButton";
import UserButtons from "./UserButtons";
import FilesBox from "./FilesBox";

export default function ChatItem(props) {
  const theme = useTheme()
  const { chat } = useContext(ChatItemContext)
  const [textExpand, setTextExpand] = useState(false)
  const text = props.part?.text ?? ''
  let isUser = () => props.role == 'user'
  let isLargeText = () => text.length > 116
  let isFunctionCall = () => props.part.functionResponse || props.part.functionCall
  let justifyContent = isUser() ? 'flex-end' : 'flex-start'
  let alignSelf = isUser() ? 'flex-end' : 'flex-start'
  let backgroundColor = isUser() && !isFunctionCall() ?
    theme.palette.background.paper : theme.palette.background.default;

  let textExpandToggle = () => {
    setTextExpand(!textExpand)
  }

  let content = useMemo(() => {
    if (chat.cancelled) {
      return <Typography
        sx={{ opacity: '0.9' }}
        fontSize={'16px'} fontWeight={400}
        mt={1} variant="h5">
        <i>{props.part?.text}</i>
      </Typography>
    }
    if (props.part.functionCall) {
      return <Box sx={{ display: 'flex', gap: '5px', justifyContent: 'center', alignItems: 'center' }}>
        <BoltIcon />
        {props.part.functionCall.name}
      </Box>
    }
    if (props.part.functionResponse) {
      return <Box sx={{ display: 'flex', gap: '5px', justifyContent: 'center', alignItems: 'center' }}>
        <CheckIcon />
        {props.part.functionResponse.name}
      </Box>
    }
    return <ChatBodyRenderer
      textExpand={textExpand}
      isUser={isUser}
      isLargeText={isLargeText}
      part={props.part}
    />
  }, [props.part, text, textExpand])

  return <Box className={["chat-item-box", `chat-item-box-${props.role}`].join(' ')}
    sx={
      {
        '&:hover .actions-child': {
          opacity: '1',
          transition: 'opacity 0.2s ease'
        },
        display: 'flex',
        flexDirection: 'column',
        gap: props.fileNames?.length ? '5px' : undefined
      }
    }>
    <FilesBox fileNames={props.fileNames} />
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
      {isUser() && <UserButtons />}
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
        {!isUser() && !isFunctionCall() ? <img src="/gemini.svg" /> : null}
        {content}
        {
          isUser() && isLargeText() && (
            <UserTextToggleButton
              textExpand={textExpand}
              textExpandToggle={textExpandToggle}
            />
          )
        }
      </Box>
    </Box>
    {!isUser() && !isFunctionCall() ? <ModelButtons {...props} /> : null}
  </Box>
}