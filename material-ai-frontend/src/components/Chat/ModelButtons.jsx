import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import RefreshIcon from '@mui/icons-material/Refresh';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import CopyAllOutlinedIcon from '@mui/icons-material/CopyAllOutlined';
import { useContext } from 'react';
import { AppContext, ChatItemContext } from '../../context';
import { Box, IconButton, Tooltip } from '@mui/material';


export default function ModelButtons(props) {

  const { send, setSnack, delete_history } = useContext(AppContext)
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