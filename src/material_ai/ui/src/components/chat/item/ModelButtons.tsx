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
  dataTestId: string
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
    chatIdx,
    setNegativeFeedbackToggle,
  } = useContext(ChatItemContext) as ChatItemContextType

  const agent = useAgentId() as string
  const session_id = useSessionId() as string

  const actions: ActionItem[] = [
    {
      icon: <ThumbUpOffAltIcon fontSize="small" />,
      filledIcon: <ThumbUpIcon fontSize="small" />,
      value: config.getAgent(agent)?.feedback.positive.value,
      dataTestId: 'thumbs-up-button',
      tooltip: config.get().buttons.thumbsUp,
      onClick: async () => {
        if (
          feedback?.feedback_category ===
          config.getAgent(agent)?.feedback.positive.value
        ) {
          setFeedback(undefined) // Use undefined to clear
          return
        }
        const dto: FeedbackDto = {
          feedback_category: config.getAgent(agent)?.feedback.positive.value,
          feedback_text: '',
        }
        await postPostiveFeedback(dto)
      },
    },
    {
      icon: <ThumbDownOffAltIcon fontSize="small" />,
      filledIcon: <ThumbDownIcon fontSize="small" />,
      value: config.getAgent(agent)?.feedback.negative.value,
      dataTestId: 'thumbs-down-button',
      tooltip: config.get().buttons.thumbsDown,
      onClick: async () => {
        if (
          feedback?.feedback_category ===
          config.getAgent(agent)?.feedback.negative.value
        ) {
          setFeedback(undefined)
          return
        }
        const dto: FeedbackDto = {
          feedback_category: config.getAgent(agent)?.feedback.negative.value,
          feedback_text: '',
          id: chat.id,
        }
        setFeedback(dto)
        setNegativeFeedbackToggle(true)
      },
    },
    {
      icon: <RefreshIcon fontSize="small" />,
      tooltip: config.get().buttons.redo,
      dataTestId: 'redo-button',
      onClick: () => {
        let prompt = chat.prompt
        if (!prompt) {
          prompt = chatService.find_previous_prompt(chatIdx)
        }
        chatService.send_message(prompt!, {
          session_id,
          agent,
        })
      },
    },
    {
      icon: <ShareOutlinedIcon fontSize="small" />,
      tooltip: config.get().buttons.share,
      dataTestId: 'share-button',
      onClick: () => {
        // Implement share logic
      },
    },
    {
      icon: <CopyAllOutlinedIcon fontSize="small" />,
      tooltip: config.get().buttons.copyResponse,
      dataTestId: 'copy-button',
      onClick: async () => {
        await navigator.clipboard.writeText(props.part?.text || '')
        setSnack(config.get().responseCopyMessage)
      },
    },
  ]

  // Helper to determine button color
  const getColor = (action: ActionItem): IconButtonProps['color'] => {
    // Only apply color logic if the action has a 'value' (Thumb Up/Down)
    if (
      action.value &&
      [
        config.getAgent(agent)?.feedback.negative.value,
        config.getAgent(agent)?.feedback.positive.value,
      ].includes(action.value)
    ) {
      if (feedback?.feedback_category === action.value) return 'primary'
    }
    return 'default' // 'default' | 'inherit' | 'primary' etc.
  }

  // Helper to determine which icon to show (Outlined vs Filled)
  const getIcon = (action: ActionItem): ReactNode => {
    if (
      action.value &&
      [
        config.getAgent(agent)?.feedback.negative.value,
        config.getAgent(agent)?.feedback.positive.value,
      ].includes(action.value)
    ) {
      if (feedback?.feedback_category === action.value) return action.filledIcon
    }
    return action.icon
  }

  return (
    <Box
      className="actions-child actions-child-model"
      sx={{
        // Check if feedback exists to determine opacity
        opacity: feedback ? '1' : '0',
        transition: 'opacity 0.5s ease',
      }}
    >
      {actions.map((action) => {
        return (
          <Tooltip key={action.tooltip} title={action.tooltip}>
            <IconButton
              data-testid={action.dataTestId}
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
