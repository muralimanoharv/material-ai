import { useContext } from 'react'
import { ChatItemContext } from '../../../context'
import FilesBox from './FilesBox'
import ChatItemWrapper from './ChatItemWrapper'

export default function ChatArtifactSection() {
    const { chat } = useContext(ChatItemContext)
    const artifactDelta = chat?.actions?.artifactDelta || {}
    if (!artifactDelta) return null
    const files = []
    for (let key in artifactDelta) {
        files.push({
            name: key,
            version: artifactDelta[key],
            type: 'artifact',
        })
    }
    if(!files.length) return null;
    return (
        <ChatItemWrapper role="model">
            <FilesBox
                alignSelf={'flex-start'}
                justifyContent={'flex-start'}
                files={files}
            />
        </ChatItemWrapper>

    )
}
