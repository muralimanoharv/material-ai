import { useState, useEffect, useContext, useRef } from 'react'
import { Routes, Route, useNavigate } from 'react-router'
import {
  AppContext,
  ThemeContext,
  type AppContextType,
  type ThemeContextType,
} from './context'
import { ApiService } from './service/api.service'
import Layout from './components/layout/Layout'
import { Snackbar } from '@mui/material'
import ChatPage from './components/pages/ChatPage'
import type { ChatItem, FileAttachment, Session, User } from './schema'
import { getPathParams } from './utils'
import { HistoryService } from './service/history.service'
import { ChatService } from './service/chat.service'

function App() {
  const { config } = useContext(ThemeContext) as ThemeContextType

  const [session, setSession] = useState<string | undefined>()
  const [user, setUser] = useState<User | undefined>(undefined)
  const [health, setHealth] = useState<any>(undefined)

  const [history, setHistory] = useState<ChatItem[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [agents, setAgents] = useState<string[]>([])
  const [selectedAgent, setSelectedAgent] = useState<string>('')

  const [loading, setLoading] = useState(false)
  const [promptLoading, setPromptLoading] = useState(false)
  const [snack, setSnack] = useState<string>('')

  const [files, setFiles] = useState<FileAttachment[]>([])

  const navigate = useNavigate()

  const ref = useRef<{
    user: User | undefined
    selectedAgent: string
    session: string | undefined
  }>({
    user,
    selectedAgent,
    session,
  })
  ref.current = { user, selectedAgent, session }

  const historyService = useRef(new HistoryService(setHistory))

  const getUser = () => ref.current.user
  const getSelectedAgent = () => ref.current.selectedAgent
  const getConfig = () => config
  const getSession = () => ref.current.session

  const apiService = useRef(
    new ApiService({
      getUser,
      getSelectedAgent,
      getConfig,
      on401: () => {
        setUser(undefined)
        setHistory([])
      },
      on404: () => {
        setSnack(config.errorMessage)
        on_new_chat()
      },
    }),
  )

  const chatService = useRef(
    new ChatService(apiService.current, historyService.current, {
      getSession,
      getConfig,
      getSelectedAgent,
      getUser,
      setPromptLoading,
      setFiles,
      setSessions,
      navigate,
      setSnack,
    }),
  )

  const on_new_chat = () => {
    historyService.current.clear_history()
    setSession(undefined)
    navigate(`/agents/${selectedAgent}`)
    input_focus()
  }

  const input_focus = () => {
    document.getElementById('input-base')?.focus()
  }

  const fetchSession = async ({ sessionId }: { sessionId: string }) => {
    try {
      setLoading(true)
      const session = await apiService.current.fetch_session(sessionId)
      setHistory(session?.events || [])
      input_focus()
    } finally {
      setTimeout(() => {
        setLoading(false)
      }, 500)
    }
  }

  const appContext: AppContextType = {
    session,
    setSession,
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
    selectedAgent,
    setSelectedAgent,
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

      if (!user) {
        return
      }

      setUser(user)

      const agentList = await apiService.current.fetch_agents()
      const pathParams = getPathParams()

      const defaultAgent = pathParams['agentId'] || agentList[0]
      setAgents(agentList)
      setSelectedAgent(defaultAgent)

      const history = await apiService.current.fetch_history(defaultAgent)

      setSessions(history || [])

      if (!pathParams['sessionId']) {
        return
      }

      const sessionId = pathParams['sessionId']
      await fetchSession({
        sessionId,
      })
      setSession(sessionId)
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
        <Layout history={history}>
          <Routes>
            <Route path="/agents" element={<>Agents</>} />
            <Route
              path="/agents/:agentId/session/:sessionId"
              element={<ChatPage />}
            />
            <Route path="/agents/:agentId" element={<ChatPage />} />
            <Route path="/" element={<ChatPage />} />
          </Routes>
        </Layout>
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
