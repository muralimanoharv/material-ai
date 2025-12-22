import { createContext } from 'react'
import { type Theme } from '@mui/material/styles'
import type {
  Agent,
  AppConfig,
  ChatItem,
  FeedbackDto,
  FileAttachment,
  Health,
  Session,
  ThemeMode,
  User,
} from './schema'
import { ApiService } from './service/api.service'
import { ChatService } from './service/chat.service'
import type { HistoryService } from './service/history.service'

export interface AppContextType {
  // User State
  user: User | undefined
  setUser: React.Dispatch<React.SetStateAction<User | undefined>>

  // UI State
  loading: boolean
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
  promptLoading: boolean
  input_focus: () => void
  setSnack: (message: string) => void

  // Models & Agents
  agents: Agent[]

  // Files
  files: FileAttachment[]
  setFiles: React.Dispatch<React.SetStateAction<FileAttachment[]>>

  // History & Chat Data
  history: ChatItem[]

  // Sidebar / Session List
  sessions: Session[]
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>

  // Navigation / Flow
  on_new_chat: (agent?: string) => void
  fetchSession: (agent: string, session_id: string) => Promise<void>
  setPrompt: (text: string) => void

  // Configuration & Meta
  health: Health | undefined
  config: AppConfig

  //service
  apiService: ApiService
  chatService: ChatService
  historyService: HistoryService

  //Drawer
  drawerHoverOpen: boolean
  drawerOpen: boolean
  setDrawerHoverOpen: React.Dispatch<React.SetStateAction<boolean>>
  setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>
  setPromptRef: React.RefObject<
    React.Dispatch<React.SetStateAction<string>> | undefined
  >
}

export interface ThemeContextType {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  config: AppConfig
}

export interface LayoutContextType {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  setHoverOpen: React.Dispatch<React.SetStateAction<boolean>>
  isDrawerOpen: () => boolean
  settingsDrawerOpen: boolean
  setSettingsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>
  themeDrawerOpen: boolean
  setThemeDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>
  theme: Theme
  currentTheme: string
  setTheme: (theme: ThemeMode) => void
}

export interface ChatItemContextType {
  chat: ChatItem
  chatIdx: number
  feedback?: FeedbackDto
  setFeedback: (feedback?: FeedbackDto) => void
  postPostiveFeedback: (dto: FeedbackDto) => Promise<void>
  setNegativeFeedbackToggle: (open: boolean) => void
  negativeFeedbackToggle: boolean
  postNegativeFeedback: (feedback: FeedbackDto) => void
}

export const AppContext = createContext<AppContextType | null>(null)

export const ThemeContext = createContext<ThemeContextType | null>(null)

export const LayoutContext = createContext<LayoutContextType | null>(null)

export const ChatItemContext = createContext<ChatItemContextType | null>(null)
