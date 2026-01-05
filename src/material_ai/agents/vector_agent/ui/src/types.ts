import type React from 'react'
import type { ReactNode } from 'react'

export interface ArtifactDelta {
  [filename: string]: number | string
}

export interface FunctionCallPart {
  name: string
}

export interface FunctionResponsePart {
  name: string
}
export interface InlineData {
  mimeType: string
  data: string
}

export interface ChatPart {
  text?: string
  inlineData?: InlineData
  functionCall?: FunctionCallPart
  functionResponse?: FunctionResponsePart
}

export interface ChatItem {
  actions?: {
    artifactDelta?: ArtifactDelta
  }
  content: {
    role: 'user' | 'model'
    parts: ChatPart[]
  }
  loading?: boolean
  cancelled?: boolean
  prompt?: string
  id: string
  error?: string
}

export interface FileAttachment {
  name: string
  version: number
  type: 'upload'
  inlineData: InlineData
}

interface Options {
  submitted_files?: FileAttachment[]
  setPrompt?: React.Dispatch<React.SetStateAction<string>>
  session_id?: string
  agent: string
}

export interface ChatService {
  send_message: (prompt: string, options: Options) => Promise<void>
}

export interface MFEProps {
  history: ChatItem[]
  chatService: ChatService
  ChatSection: React.FC<{
    maxWidth?: string
    build: (data: any) => ReactNode | null
  }>
  Greeting: React.FC<{greeting?: string}>
}
