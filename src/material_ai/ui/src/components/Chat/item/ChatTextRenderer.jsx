import { Typography } from '@mui/material'
import Markdown from '../Markdown'

export default function ChatTextRenderer(props) {
  if (props.isUser) return <UserMarkdownRenderer {...props} />

  return <Markdown>{props.part?.text}</Markdown>
}

function UserMarkdownRenderer(props) {
  if (!props.isLargeText())
    return <Typography variant="p">{props.part.text}</Typography>
  if (props.textExpand)
    return <Typography variant="p">{props.part.text}</Typography>
  return (
    <Typography variant="p">{props.part.text.substring(0, 116)}...</Typography>
  )
}
