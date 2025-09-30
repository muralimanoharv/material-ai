import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import RefreshIcon from '@mui/icons-material/Refresh';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import CopyAllOutlinedIcon from '@mui/icons-material/CopyAllOutlined';
import { useContext } from 'react';
import { AppContext, ChatItemContext } from '../../context';
import { Box, IconButton, Tooltip } from '@mui/material';
import { FEEDBACK } from '../../assets/config';


export default function ModelButtons(props) {

  const { send, setSnack, delete_history } = useContext(AppContext)
  const { feedback, setFeedback, postPostiveFeedback, chat, setNegativeFeedbackToggle } = useContext(ChatItemContext)

  const actions = [
    {
      icon: <ThumbUpOffAltIcon fontSize="small" />,
      filledIcon: <ThumbUpIcon fontSize='small' />,
      value: FEEDBACK.positive.value,
      tooltip: 'Good response',
      onClick: async () => {
        if (feedback?.feedback_category === FEEDBACK.positive.value) {
          setFeedback()
          return
        }
        const dto = {
          feedback_category: FEEDBACK.positive.value,
          feedback_text: ''
        }
        await postPostiveFeedback(dto)
      },
    },
    {
      icon: <ThumbDownOffAltIcon fontSize="small" />,
      filledIcon: <ThumbDownIcon fontSize='small' />,
      value: FEEDBACK.negative.value,
      tooltip: 'Bad response',
      onClick: async () => {
        if (feedback?.feedback_category === FEEDBACK.negative.value) {
          setFeedback()
          return
        }
        const dto = {
          feedback_category: FEEDBACK.negative.value,
          feedback_text: '',
          id: chat.id
        }
        setFeedback(dto)
        setNegativeFeedbackToggle(true)
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
      icon: <CopyAllOutlinedIcon  fontSize="small" />,
      tooltip: 'Copy response',
      onClick: async () => {
        await navigator.clipboard.writeText(props.part.text);
        setSnack('Copied to clipboard')
      },
    }
  ]
  let getColor = (action) => {
    if ([FEEDBACK.negative.value, FEEDBACK.positive.value].includes(action.value)) {
      if (feedback?.feedback_category == action.value) return 'primary';
    }
    return "default"
  }
  let getIcon = (action) => {
    if ([FEEDBACK.negative.value, FEEDBACK.positive.value].includes(action.value)) {
      if (feedback?.feedback_category == action.value) return action.filledIcon;
    }
    return action.icon
  }
  return <Box
    className="actions-child actions-child-model"
    sx={{
      marginLeft: '60px',
      opacity: !!feedback ? '1' : '0',
      transition: 'opacity 0.5s ease'
    }}>
    {actions.map((action) => {
      return <Tooltip key={action.tooltip} title={action.tooltip}>
        <IconButton
          color={getColor(action)}
          onClick={action.onClick}
          key={action.tooltip}>
          {getIcon(action)}
        </IconButton>
      </Tooltip>
    })}
  </Box>
}