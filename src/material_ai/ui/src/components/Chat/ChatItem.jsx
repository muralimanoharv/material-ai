import { Box, CircularProgress, Typography, useTheme } from '@mui/material'
import { useContext, useMemo, useState } from 'react'
import { AppContext, ChatItemContext } from '../../context'
import ModelButtons from './ModelButtons'
import ChatBodyRenderer from './ChatBodyRenderer'
import BoltIcon from '@mui/icons-material/Bolt'
import CheckIcon from '@mui/icons-material/Check'
import UserTextToggleButton from './UserTextToggleButton'
import UserButtons from './UserButtons'
import FilesBox from './FilesBox'
import ChatNegativeFeebackSelection from './ChatNegativeFeebackSelection'

export default function ChatItem(props) {
  const theme = useTheme()
  const { config } = useContext(AppContext)
  const { chat, feedback, negativeFeedbackToggle } = useContext(ChatItemContext)
  const [textExpand, setTextExpand] = useState(false)
  const text = props.part?.text ?? ''
  let isUser = () => props.role == 'user'
  let isLargeText = () => text.length > 116
  let isFunctionCall = () =>
    props.part.functionResponse || props.part.functionCall
  let justifyContent = isUser() && !isFunctionCall() ? 'flex-end' : 'flex-start'
  let alignSelf = isUser() && !isFunctionCall() ? 'flex-end' : 'flex-start'
  let backgroundColor =
    isUser() && !isFunctionCall()
      ? theme.palette.background.paper
      : theme.palette.background.default

  let textExpandToggle = () => {
    setTextExpand(!textExpand)
  }

  let content = useMemo(() => {
    if (chat.cancelled) {
      return (
        <Typography
          sx={{ opacity: '0.9' }}
          fontSize={'16px'}
          fontWeight={400}
          mt={1}
          variant="h5"
        >
          <i>{props.part?.text}</i>
        </Typography>
      )
    }
    if (props.part.functionCall) {
      return (
        <Box
          sx={{
            display: 'flex',
            gap: '25px',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <BoltIcon />
          {props.part.functionCall.name}
        </Box>
      )
    }
    if (props.part.functionResponse) {
      return (
        <Box
          sx={{
            display: 'flex',
            gap: '25px',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <CheckIcon />
          {props.part.functionResponse.name}
        </Box>
      )
    }
    return (
      <ChatBodyRenderer
        textExpand={textExpand}
        isUser={isUser}
        isLargeText={isLargeText}
        part={props.part}
      />
    )
  }, [props.part, text, textExpand])

  return (
    <Box
      className={['chat-item-box', `chat-item-box-${props.role}`].join(' ')}
      sx={{
        '&:hover .actions-child': {
          opacity: '1',
          transition: 'opacity 0.2s ease',
        },
        display: 'flex',
        flexDirection: 'column',
        gap: props.files?.length ? '5px' : undefined,
      }}
    >
      <FilesBox
        alignSelf={alignSelf}
        justifyContent={justifyContent}
        files={props.files}
      />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: '10px',
          alignSelf,
          justifyContent,
          width: '100%',
          alignItems: 'flex-start',
        }}
      >
        {isUser() && !isFunctionCall() && <UserButtons text={text} />}
        <Box
          sx={{
            backgroundColor,
            borderRadius: '24px',
            borderTopRightRadius: isUser() ? '0px' : undefined,
            borderTopLeftRadius: !isUser() ? '0px' : undefined,
            maxWidth: isUser() ? '452px' : undefined,
            padding: isUser() ? '12px 16px' : '2px 16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '20px',
          }}
        >
          {!isUser() && !isFunctionCall() ? <img src="/gemini.svg" /> : null}
          {content}
          {isUser() &&
            isLargeText() &&
            !isFunctionCall()(
              <UserTextToggleButton
                textExpand={textExpand}
                textExpandToggle={textExpandToggle}
              />,
            )}
        </Box>
      </Box>
      {!isUser() && !isFunctionCall() ? <ModelButtons {...props} /> : null}
      {feedback &&
        feedback.feedback_category == config.feedback.negative.value &&
        negativeFeedbackToggle && <ChatNegativeFeebackSelection />}
      {chat?.loading && (
        <Box
          className="gemini-loader-container"
          sx={{
            borderRadius: '24px',
            padding: '2px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          <LoadingIndicator />
          <Typography className="gemini-spark" variant="p">
            Just a sec...
          </Typography>
        </Box>
      )}
    </Box>
  )
}

function LoadingIndicator() {
  const GradientSVG = () => (
    <svg width={0} height={0}>
      <linearGradient id="linearColors" x1={0} y1={0} x2={1} y2={1}>
        <stop offset="0%" stopColor="#4285F4" />
        <stop offset="25%" stopColor="#34A853" />
        <stop offset="50%" stopColor="#FBBC05" />
        <stop offset="75%" stopColor="#EA4335" />
        <stop offset="100%" stopColor="#4285F4" />
      </linearGradient>
    </svg>
  )
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <GradientSVG />
      <CircularProgress
        variant="indeterminate"
        size={30}
        sx={{
          '& .MuiCircularProgress-circle': {
            stroke: 'url(#linearColors)',
          },
        }}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src="/gemini.svg"
          alt="Loading icon"
          style={{ width: '50%', height: '50%', borderRadius: '50%' }}
        />
      </Box>
    </Box>
  )
}
