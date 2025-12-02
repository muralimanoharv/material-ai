import { useState, useEffect, useContext, useRef } from 'react'
import { Routes, Route, useNavigate } from 'react-router'
import {
  AppContext,
  ThemeContext,
  type AppContextType,
  type ThemeContextType,
} from './context'
import { ApiService } from './service/api.service'
import { Snackbar } from '@mui/material'
import type { Agent, ChatItem, FileAttachment, Session, User } from './schema'
import { HistoryService } from './service/history.service'
import { ChatService } from './service/chat.service'
import AgentPage from './components/pages/AgentPage'
import AgentsPage from './components/pages/AgentsPage'

function App() {
  const { config } = useContext(ThemeContext) as ThemeContextType

  // const [session, setSession] = useState<string | undefined>()
  const [user, setUser] = useState<User | undefined>(undefined)
  const [health, setHealth] = useState<any>(undefined)

  const [history, setHistory] = useState<ChatItem[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [agents, setAgents] = useState<Agent[]>([])

  const [loading, setLoading] = useState(false)
  const [promptLoading, setPromptLoading] = useState(false)
  const [snack, setSnack] = useState<string>('')

  const [files, setFiles] = useState<FileAttachment[]>([])

  const navigate = useNavigate()

  const ref = useRef<{
    user: User | undefined
  }>({
    user,
  })
  ref.current = { user }

  const historyService = useRef(new HistoryService(setHistory))

  const getUser = () => ref.current.user
  const getConfig = () => config

  const apiService = useRef(
    new ApiService({
      getUser,
      getConfig,
      on401: () => {
        setUser(undefined)
        setHistory([])
      },
      on404: () => {
        setSnack(config.errorMessage)
        navigate("/")
      },
    }),
  )

  const chatService = useRef(
    new ChatService(apiService.current, historyService.current, {
      getConfig,
      getUser,
      setPromptLoading,
      setFiles,
      setSessions,
      navigate,
      setSnack,
    }),
  )

  const on_new_chat = (agent?: string) => {
    historyService.current.clear_history()

    if(!agent) {
      navigate("/")
      return;
    }

    navigate(`/agents/${agent}`)
    input_focus()
  }

  const input_focus = () => {
    document.getElementById('input-base')?.focus()
  }

  const fetchSession = async (agent: string, session_id: string) => {
    try {
      setLoading(true)
      const session = await apiService.current.fetch_session(agent, session_id)
      setHistory(session?.events || [])
      input_focus()
    } finally {
      setTimeout(() => {
        setLoading(false)
      }, 500)
    }
  }

  const appContext: AppContextType = {
    user,
    setUser,
    loading,
    setLoading,
    setSnack,
    files,
    setFiles,
    history,
    sessions,
    setSessions,
    agents,
    promptLoading,
    fetchSession,
    on_new_chat,
    input_focus,
    health,
    config,
    setPrompt: () => {},
    apiService: apiService.current,
    chatService: chatService.current,
  }

  const onAppLoad = async () => {
    try {
      setLoading(true)

      const healthData = await apiService.current.fetch_health()
      setHealth(healthData)

      const user = await apiService.current.fetch_user()

      if (!user) return

      setUser(user)

      const agents = await apiService.current.fetch_agents()

      setAgents(agents || [])
    } finally {
      setTimeout(() => {
        setLoading(false)
      }, 500)
    }
  }

  useEffect(() => {
    onAppLoad()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <AppContext.Provider value={appContext}>
        <Routes>
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/agents/:agentId" element={<AgentPage />}>
              <Route path="session/:sessionId" element={<AgentPage />} />
            </Route>
            <Route path="/" element={<AgentsPage />} />
          </Routes>
        <Snackbar
          open={!!snack}
          autoHideDuration={2000}
          onClose={() => {
            setSnack('')
          }}
          message={snack}
        />
      </AppContext.Provider>
    </>
  )
}

export default App
