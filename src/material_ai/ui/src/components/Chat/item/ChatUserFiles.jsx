import { useContext } from 'react'
import ChatItemWrapper from './ChatItemWrapper'
import { ChatItemContext } from '../../../context'
import FilesBox from './FilesBox'

function ChatUserFiles({ part }) {
  const { chat } = useContext(ChatItemContext)
  const json = JSON.parse(part.text)
  if (!json.fileNames) return null
  const fileNames = json.fileNames
  const fileData = []
  for (let inLinePart of chat.content.parts) {
    if (inLinePart.inlineData) {
      fileData.push(inLinePart.inlineData)
    }
  }
  const files = []
  for (let i = 0; i < fileData.length; i++) {
    files.push({
      name: fileNames[i] || 'NA.pdf',
      version: 0,
      type: 'upload',
      inlineData: {
        ...fileData[i],
      },
    })
  }
  if(!files.length) return null;
  return (
    <ChatItemWrapper alignment="flex-end">
      <FilesBox
        alignSelf={'flex-start'}
        justifyContent={'flex-start'}
        files={files}
      />
    </ChatItemWrapper>
  )
}

export default ChatUserFiles
