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

interface Buttons {
  stopResponse: string
  copyPrompt: string
  editPrompt: string
  thumbsUp: string
  thumbsDown: string
  redo: string
  share: string
  copyResponse: string
  addFiles: string
  selectAgent: string
  submit: string
  executeNext: string
  blueprint: string
  trace: string
  showThinking: string
  agentTrace: string
  reset: string
  reCenter: string
  uploadFile: string
  newChat: string
  signIn: string
  signOut: string
  settingsAndHelp: string
  theme: string
  lightTheme: string
  darkTheme: string
  systemTheme: string
  health: string
  agents: string
  backToRegistry: string
  interactWithAgent: string
  deployToGeminiEnterprize: string
  deployToAgentEngine: string
  deployToAgentCatalog: string
}

interface UploadFileMenu {
  logOutTitle: string
  title: string
}

interface AgentsMenu {
  title: string
  placeholder: string
  logOutTitle: string
}

interface Drawer {
  logOutTitle: string
  logOutSubTitle: string
}

interface Footer {
  title: string
}

interface PromptInput {
  placeholder: string
  logOutPlaceholder: string
}

interface LoginPage {
  title: string
  subTitle: string
}

interface AgentsPages {
  title: string
  subTitle: string
  countText: string
  placeholder: string
  agentIdentityCol: string
  agentDescriptionCol: string
  agentModelCol: string
  agentStatusCol: string
}

interface AgentInfoPage {
  agentOperations: string
  documentation: string
  trace: string
}

interface AgentTrace {
  blueprintTitle: string
  traceTitle: string
  systemEventLog: string
  initiatedFuncCall: string
  receivedFuncResp: string
  event: string
  arguments: string
  executionResponse: string
  agentCore: string
  awaitingPackets: string
}

interface ChatPage {
  negativeFeedbackTitle: string
  negativeFeedbackSubtitle: string
  other: string
  feedback: string
  placeholder: string
}

interface Pages {
  loginPage: LoginPage
  agentsPage: AgentsPages
  agentInfoPage: AgentInfoPage
  chatPage: ChatPage
}
export interface Language {
  code: string
  label: string
}

export interface AppConfig {
  greeting: string
  title: string
  errorMessage: string
  stopResponse: string
  promptCopyMessage: string
  responseCopyMessage: string
  feedbackSuccessMessage: string
  feedbackNegativeMessage: string
  buttons: Buttons
  uploadFileMenu: UploadFileMenu
  drawer: Drawer
  footer: Footer
  agentTrace: AgentTrace
  promptInput: PromptInput
  languages: Language[]
  agentsMenu: AgentsMenu
  pages: Pages
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

  get() {
    return this.config
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

  getStopResponseMessage() {
    return this.config.stopResponse
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

export interface InlineRequestData {
  mime_type: string
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
  inline_data?: InlineRequestData
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

export interface UIBug {
  app_name: string
  session_id: string
  error: string
  stack_trace?: string
  code: string
  id: string
}
