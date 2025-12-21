import { useContext } from 'react'
import { ChatItemContext, type ChatItemContextType } from '../../../context'
import { type ArtifactFile } from '../../../schema'
import FilesBox from './FilesBox'
import ChatItemWrapper from './ChatItemWrapper'

export default function ChatArtifactSection() {
  const { chat } = useContext(ChatItemContext) as ChatItemContextType

  const artifactDelta = chat?.actions?.artifactDelta || {}

  const files: ArtifactFile[] = []

  for (const key in artifactDelta) {
    files.push({
      name: key,
      version: artifactDelta[key],
      type: 'artifact',
    })
  }

  if (!files.length) return null

  return (
    <ChatItemWrapper partIdx={'artifacts'} role="model">
      <FilesBox
        alignSelf={'flex-start'}
        justifyContent={'flex-start'}
        files={files}
      />
    </ChatItemWrapper>
  )
}
