import { Box, Typography } from '@mui/material'
import Markdown from '../Markdown'
import type { ChatPart } from '../../../schema'

interface ChatTextRendererProps {
  isUser?: boolean
  part?: ChatPart
  isLargeText?: () => boolean
  textExpand?: boolean
  isCancelled?: boolean
}

export default function ChatTextRenderer(props: ChatTextRendererProps) {
  if (props.isUser) return <UserMarkdownRenderer {...props} />
  if (props.isCancelled)
    return (
      <Box sx={{ flexGrow: 1 }} data-testid="chat-text">
        <Typography fontStyle="italic" fontWeight={300}>
          {props.part?.text}
        </Typography>
      </Box>
    )

  return (
    <Box sx={{ flexGrow: 1 }} data-testid="chat-text">
      <Markdown>{props.part?.text}</Markdown>
    </Box>
  )
}

function UserMarkdownRenderer(props: ChatTextRendererProps) {
  if (!props.part) return null

  const isLarge = props.isLargeText ? props.isLargeText() : false

  if (!isLarge) {
    return (
      <Typography data-testid="chat-text" variant="p">
        {props.part.text}
      </Typography>
    )
  }

  if (props.textExpand) {
    return (
      <Typography data-testid="chat-text" variant="p">
        {props.part.text}
      </Typography>
    )
  }

  return (
    <Typography data-testid="chat-text" variant="p">
      {props.part.text?.substring(0, 116)}...
    </Typography>
  )
}
