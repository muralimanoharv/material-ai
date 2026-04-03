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
  lightPalette: Palette
  darkPalette: Palette
}

export interface FeedbackConfig {
  negative: {
    value: string
    categories: string[]
  }
  positive: {
    value: string
  }
}

export interface AgentConfig {
  greeting: string
  title: string
  show_footer: boolean
  chat_section_width: string
  feedback: FeedbackConfig
}

export interface AppConfig {
  greeting: string
  title: string
  errorMessage: string
  theme: ThemeConfig
  agents: Record<string, AgentConfig>
}

export class AppConfigImpl {
  private config: AppConfig

  constructor(config: AppConfig) {
    this.config = config
  }

  getTitle(agentId: string | undefined) {
    if (!agentId) return this.config.title
    const agentConfig = this.config.agents[agentId]
    if (!agentConfig) return this.config.title
    return agentConfig.title
  }

  getGreeting(agentId: string | undefined) {
    if (!agentId) return this.config.greeting
    const agentConfig = this.config.agents[agentId]
    if (!agentConfig) return this.config.greeting
    return agentConfig.greeting
  }

  getAgent(agentId: string | undefined): AgentConfig | undefined {
    if (!agentId) {
      return undefined
    }
    if (!this.config.agents[agentId]) {
      return undefined
    }
    return this.config.agents[agentId]
  }

  getTheme() {
    return this.config.theme
  }

  getErrorMessage() {
    return this.config.errorMessage
  }
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
  id: string
  name: string
  args: Record<string, unknown>
}

export interface FunctionResponsePart {
  id: string
  name: string
  response: {
    result: unknown
  }
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
  loading_message?: string | null
  loading_finished?: boolean
  loading_id?: string
  chat_history?: ChatItem[]
  cancelled?: boolean
  prompt?: string
  id: string
  error?: string
  invocationId?: string
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
  name: string
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

export interface Tool {
  name: string
  description: string
  type: 'agent' | 'tool'
}

export interface Agent {
  id: string
  name: string
  type: 'agent' | 'tool'
  description: string
  status: 'active' | 'inactive'
  model: string
  lastUsed: string
  tools: Tool[]
  sub_agents: Agent[]
}

export interface AgentResponse {
  agents: Agent[]
}

export interface ArtifactResponse {
  inlineData: InlineData
}

export interface DeleteSessionResponse {
  id?: string
  status?: string
}

export interface Health {
  status: string
  uptime: string
  debug: boolean
  appName: string
  version: string
  system: {
    cpu_percent_used: number
    memory: {
      total: string
      available: string
      percent_used: number
    }
    disk: {
      total: string
      used: string
      free: string
      percent_used: number
    }
  }
}
