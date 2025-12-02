import { type Palette } from '@mui/material/styles'

export interface Session {
  id: string
  app_name: string
  user_id: string
  last_update_time: number
  title?: string
  events?: ChatItem[]
}

export interface ThemeConfig {
  theme: {
    lightPalette: Palette
    darkPalette: Palette
  }
}

export interface FeedbackConfig {
  feedback: {
    negative: {
      value: string
      categories: string[]
    }
    positive: {
      value: string
    }
  }
}

export interface AppConfig extends ThemeConfig, FeedbackConfig {
  greeting: string
  title: string
  models: { model: string; tagline: string }[]
  errorMessage: string
}

export interface FileAttachment {
  name: string
  version: number
  type: 'upload'
  inlineData: InlineData
}

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
}

export interface ArtifactFile {
  name: string
  version: number | string
  type: 'artifact'
}

export interface FeedbackDto {
  feedback_category?: string
  feedback_text?: string
  id?: string
}

export interface User {
  sub: string
  given_name: string
  picture: string
  email: string
}

export interface UserResponse {
  user_response: User
}

export interface RequestPart {
  text?: string
  inline_data?: InlineData
}

export interface SendOptions {
  submittedFiles: FileAttachment[]
  setPrompt: (val: string) => void
}

export type ThemeMode = 'light' | 'dark' | 'system'

export interface Agent {
  name: string
  id?: string
  description?: string
}

export interface HealthResponse {
  status?: string
  version?: string
}

export interface ArtifactResponse {
  inlineData: InlineData
}

export interface DeleteSessionResponse {
  id?: string
  status?: string
}
