import { useContext, useMemo } from 'react'
import ChatItemWrapper from './ChatItemWrapper'
import { ChatItemContext, type ChatItemContextType } from '../../../context'
import FilesBox from './FilesBox'
import type { ChatPart, InlineData } from '../../../schema'

interface ChatUserFilesProps {
  part: ChatPart
}

export interface UploadedFile {
  name: string
  version: number
  type: 'upload'
  inlineData: InlineData
}

// 2. Component
function ChatUserFiles({ part }: ChatUserFilesProps) {
  const { chat } = useContext(ChatItemContext) as unknown as ChatItemContextType

  // Memoize the heavy lifting: parsing JSON and mapping arrays
  const files = useMemo((): UploadedFile[] | null => {
    // 1. Try Parse JSON
    let json: { fileNames?: string[] } = {}
    try {
      json = JSON.parse(part?.text || '')
    } catch (e) {
      console.error(e)
      return null
    }

    if (!json.fileNames || !Array.isArray(json.fileNames)) return null

    const fileNames = json.fileNames
    const fileData: InlineData[] = []

    // 2. Extract inline data
    // We use optional chaining in case chat.content is incomplete during loading
    const parts = (chat?.content?.parts || []) as ChatPart[]

    for (const inLinePart of parts) {
      if (inLinePart.inlineData) {
        fileData.push(inLinePart.inlineData)
      }
    }

    // 3. Map filenames to data
    const mappedFiles: UploadedFile[] = []

    for (let i = 0; i < fileData.length; i++) {
      mappedFiles.push({
        name: fileNames[i] || 'NA.pdf',
        version: 0,
        type: 'upload',
        inlineData: {
          ...fileData[i],
        },
      })
    }

    return mappedFiles.length > 0 ? mappedFiles : null
  }, [part.text, chat?.content?.parts]) // Only re-run if text or parts change

  if (!files) return null

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
