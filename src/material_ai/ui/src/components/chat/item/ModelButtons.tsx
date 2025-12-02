import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt'
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt'
import ThumbDownIcon from '@mui/icons-material/ThumbDown'
import ThumbUpIcon from '@mui/icons-material/ThumbUp'
import RefreshIcon from '@mui/icons-material/Refresh'
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined'
import CopyAllOutlinedIcon from '@mui/icons-material/CopyAllOutlined'
import { useContext, type ReactNode } from 'react'
import { Box, IconButton, Tooltip, type IconButtonProps } from '@mui/material'
import {
  AppContext,
  ChatItemContext,
  type AppContextType,
  type ChatItemContextType,
} from '../../../context'
import type { ChatPart, FeedbackDto } from '../../../schema'
import { useAgentId, useSessionId } from '../../../hooks'

interface ModelButtonsProps {
  part: ChatPart
}

interface ActionItem {
  icon: ReactNode
  filledIcon?: ReactNode
  value?: string
  tooltip: string
  onClick: () => void | Promise<void>
}

export default function ModelButtons(props: ModelButtonsProps) {
  const { chatService, setSnack, config } = useContext(
    AppContext,
  ) as AppContextType
  const {
    feedback,
    setFeedback,
    postPostiveFeedback,
    chat,
    setNegativeFeedbackToggle,
  } = useContext(ChatItemContext) as ChatItemContextType

  const agent = useAgentId() as string
  const session_id = useSessionId() as string

  const actions: ActionItem[] = [
    {
      icon: <ThumbUpOffAltIcon fontSize="small" />,
      filledIcon: <ThumbUpIcon fontSize="small" />,
      value: config.feedback.positive.value,
      tooltip: 'Good response',
      onClick: async () => {
        if (feedback?.feedback_category === config.feedback.positive.value) {
          setFeedback(undefined) // Use undefined to clear
          return
        }
        const dto: FeedbackDto = {
          feedback_category: config.feedback.positive.value,
          feedback_text: '',
        }
        await postPostiveFeedback(dto)
      },
    },
    {
      icon: <ThumbDownOffAltIcon fontSize="small" />,
      filledIcon: <ThumbDownIcon fontSize="small" />,
      value: config.feedback.negative.value,
      tooltip: 'Bad response',
      onClick: async () => {
        if (feedback?.feedback_category === config.feedback.negative.value) {
          setFeedback(undefined)
          return
        }
        const dto: FeedbackDto = {
          feedback_category: config.feedback.negative.value,
          feedback_text: '',
          id: chat.id,
        }
        setFeedback(dto)
        setNegativeFeedbackToggle(true)
      },
    },
    {
      icon: <RefreshIcon fontSize="small" />,
      tooltip: 'Redo',
      onClick: () => {
        const prompt = chat.prompt
        chatService.send_message(prompt!, {
          session_id,
          agent,
        })
      },
    },
    {
      icon: <ShareOutlinedIcon fontSize="small" />,
      tooltip: 'Share & export',
      onClick: () => {
        // Implement share logic
      },
    },
    {
      icon: <CopyAllOutlinedIcon fontSize="small" />,
      tooltip: 'Copy response',
      onClick: async () => {
        await navigator.clipboard.writeText(props.part?.text || '')
        setSnack('Copied to clipboard')
      },
    },
  ]

  // Helper to determine button color
  const getColor = (action: ActionItem): IconButtonProps['color'] => {
    // Only apply color logic if the action has a 'value' (Thumb Up/Down)
    if (
      action.value &&
      [config.feedback.negative.value, config.feedback.positive.value].includes(
        action.value,
      )
    ) {
      if (feedback?.feedback_category === action.value) return 'primary'
    }
    return 'default' // 'default' | 'inherit' | 'primary' etc.
  }

  // Helper to determine which icon to show (Outlined vs Filled)
  const getIcon = (action: ActionItem): ReactNode => {
    if (
      action.value &&
      [config.feedback.negative.value, config.feedback.positive.value].includes(
        action.value,
      )
    ) {
      if (feedback?.feedback_category === action.value) return action.filledIcon
    }
    return action.icon
  }

  return (
    <Box
      className="actions-child actions-child-model"
      sx={{
        marginLeft: '60px',
        // Check if feedback exists to determine opacity
        opacity: feedback ? '1' : '0',
        transition: 'opacity 0.5s ease',
      }}
    >
      {actions.map((action) => {
        return (
          <Tooltip key={action.tooltip} title={action.tooltip}>
            <IconButton
              color={getColor(action)}
              onClick={action.onClick}
              // It's good practice to keep key on the outermost element of map
            >
              {getIcon(action)}
            </IconButton>
          </Tooltip>
        )
      })}
    </Box>
  )
}
