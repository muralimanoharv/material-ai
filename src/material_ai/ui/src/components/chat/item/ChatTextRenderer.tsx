import { Typography } from '@mui/material'
import Markdown from '../Markdown'
import type { ChatPart } from '../../../schema'

interface ChatTextRendererProps {
  isUser?: boolean
  part?: ChatPart
  isLargeText?: () => boolean
  textExpand?: boolean
}

export default function ChatTextRenderer(props: ChatTextRendererProps) {
  if (props.isUser) return <UserMarkdownRenderer {...props} />

  return <Markdown>{props.part?.text}</Markdown>
}

function UserMarkdownRenderer(props: ChatTextRendererProps) {
  if (!props.part) return null

  const isLarge = props.isLargeText ? props.isLargeText() : false

  if (!isLarge) {
    return <Typography variant="p">{props.part.text}</Typography>
  }

  if (props.textExpand) {
    return <Typography variant="p">{props.part.text}</Typography>
  }

  return (
    <Typography variant="p">{props.part.text?.substring(0, 116)}...</Typography>
  )
}
