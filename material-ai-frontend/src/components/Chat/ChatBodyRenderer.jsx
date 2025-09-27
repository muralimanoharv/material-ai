import { Typography } from '@mui/material'
import { useMemo } from 'react'
import Markdown from './Markdown'


export default function ChatBodyRenderer(props) {
    const MarkdownMemo = useMemo(() => <Markdown>{props.part?.text}</Markdown>)
    if (props.isUser()) return <UserMarkdownRenderer {...props} />

    return <>{MarkdownMemo}</>
}

function UserMarkdownRenderer(props) {
    if(!props.isLargeText()) return <Typography variant='p'>{props.part.text}</Typography>
    if(props.textExpand) return <Typography variant='p'>{props.part.text}</Typography>
    return <Typography variant='p'>{props.part.text.substring(0, 116)}...</Typography>

}