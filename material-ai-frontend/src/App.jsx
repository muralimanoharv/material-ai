import { useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { AppContext } from './context.jsx'
import { create_session, send_message, fetch_sessions, fetch_session, fetch_agents, fetch_user, UNAUTHORIZED, NOTFOUND } from './api.js'
import Layout from './components/Layout/Layout.jsx'
import { config } from './assets/config.js'
import { Snackbar } from '@mui/material'
import ChatPage from './components/pages/ChatPage.jsx';
import './App.css'

function App() {
  const [session, setSession] = useState()
  const [user, setUser] = useState(undefined)
  const [prompt, setPrompt] = useState('')
  const [history, setHistory] = useState([])
  const [sessions, setSessions] = useState([])
  const [agents, setAgents] = useState([])
  const [selectedAgent, setSelectedAgent] = useState('')
  const [loading, setLoading] = useState(false)
  const [promptLoading, setPromptLoading] = useState(false)
  const [snack, setSnack] = useState('')
  const [currentModel, setCurrentModel] = useState(config.models[0].model)
  const [files, setFiles] = useState([])
  const [showHeading, setShowHeading] = useState(false)
  const [controller, setController] = useState(undefined)
  const navigate = useNavigate();
  const location = useLocation();

  const isValidSession = () => !!session

  const cancelApi = async () => {
    return new Promise((resolve) => {
      if (!controller) {
        resolve();
        return;
      }
      add_history({
        role: 'model',
        id: `${new Date().getTime()}`,
        prompt,
        cancelled: true,
        parts: [{ text: 'You stopped this response' }]
      })
      controller.abort()
      setTimeout(() => {
        resolve()
      }, 100)
    })

  }

  const createNewSession = async () => {
    const session = await create_session(appContext)();
    const sessionId = session.session_id;
    setSession(sessionId);
    return sessionId
  }

  const createParts = ({ prompt, files }) => {
    const parts = [{ text: prompt }];
    if (files?.length) return;

    const fileParts = files.map((file) => ({
      inline_data: {
        ...file.inlineData
      }
    }));
    const fileNames = files.map((file) => file.name);
    parts.push(...fileParts)
    parts.push({ text: JSON.stringify({ fileNames }) })

    return parts
  }

  const send = async (prompt, options = { submittedFiles: [] }) => {
    if (!prompt) return
    let session_id = session;
    const isNewSession = !isValidSession()
    const id = `${new Date().getTime()}`
    try {
      setPromptLoading(true)
      // If user has no session, we then create a session for him
      if (isNewSession) {
        session_id = await createNewSession()
      }
      // Cancel any pending API request before making new request
      await cancelApi()
      const controller = new AbortController();
      setController(controller)

      const parts = createParts({ prompt, files: options.submittedFiles })

      setShowHeading(false)

      // Add user history with loading indicator
      add_history({
        role: 'user',
        id,
        prompt,
        parts,
        loading: true
      })


      setPrompt('')
      setFiles([])

      const messages = await send_message(appContext)({
        session_id,
        parts,
        controller
      })
      // Hide loading indicator
      update_history(id, { loading: false })

      // Update history      
      for (let message of messages) {
        add_history({
          ...message.content,
          role: 'model',
          id: message.id,
          prompt,
          actions: {
            ...message.actions
          }
        })
      }

      // Id new session was created we update path param
      if (isNewSession) {
        navigate(`/${session_id}`);
      }
    } catch (e) {
      // If request was aborted or cancelled by user
      if (e.name === 'AbortError') {
        update_history(id, { loading: false })
        return;
      }
      // If the request was not authorized 
      if (e.name === UNAUTHORIZED) {
        update_history(id, { loading: false })
        setHistory([])
        setShowHeading(true)
        return
      }
      setPrompt(prompt)
      setFiles(options.submittedFiles)
      console.error(e)
      setSnack(config.errorMessage)
    } finally {
      setController(undefined)
      setPromptLoading(false)
      if (isNewSession) {
        setSessions(prevSessions => {
          return [{ id: session_id }, ...prevSessions]
        })
      }
    }
  }

  const add_history = (newHistory) => {
    setHistory(prevHistory => {
      if (!prevHistory || !prevHistory.length) return [newHistory]
      return [
        ...prevHistory,
        newHistory
      ]
    })
  }
  const delete_history = (id) => {
    setHistory(prevHistory => {
      return [...prevHistory.filter(history => history.id !== id)]
    })
  }

  const update_history = (id, history) => {
    setHistory(prevHistory => {
      return [...prevHistory.map((hist) => {
        if (hist.id !== id) return hist
        return { ...hist, ...history }
      })]
    })
  }
  const clear_history = () => {
    setHistory([])
  }

  const input_focus = () => {
    document.getElementById('input-base')?.focus()
  }

  const on_new_chat = () => {
    clear_history()
    setSession()
    navigate('/')
    setShowHeading(true)
    input_focus()
  }

  const getSession = async ({ sessionId, selectedAgent, user }) => {
    try {
      setLoading(true)
      const sessionDto = await fetch_session(appContext)({
        session_id: sessionId,
        selected_agent: selectedAgent,
        user: user?.email
      })
      setShowHeading(false)
      let history = []
      let prevPrompt = ''
      if (sessionDto && sessionDto.events) {
        for (let event of sessionDto.events) {
          if (event.content.role == 'user') {
            prevPrompt = event?.content?.parts[0]?.text ?? prevPrompt
          }
          history.push({
            ...event.content,
            id: event.id,
            prompt: prevPrompt,
            actions: {
              ...event.actions
            }
          })
        }
      }

      setHistory(history)
      input_focus()
    } catch (e) {
      if (e.name == UNAUTHORIZED) return
      if (e.name == NOTFOUND) {
        on_new_chat()
        return;
      }
      console.error(e)
      setSnack(config.errorMessage)
    } finally {
      setTimeout(() => {
        setLoading(false)
      }, 500)
    }

  }

  const appContext = {
    session, setSession, user, setUser,
    prompt, setPrompt, isValidSession,
    send, loading, setLoading, currentModel,
    setCurrentModel, setSnack, files, setFiles,
    cancelApi, history, add_history, delete_history, sessions,
    clear_history, agents, selectedAgent, setSelectedAgent,
    promptLoading, getSession, showHeading,
    on_new_chat, input_focus
  }


  const onAppLoad = async () => {
    try {
      setLoading(true)
      const user_info = await fetch_user(appContext)()
      if (!user_info) {
        setShowHeading(true)
        return;
      }
      const user = user_info.user_response;
      setUser(user)
      const agents = await fetch_agents(appContext)()
      const selectedAgent = agents[0]
      setAgents(agents)
      setSelectedAgent(selectedAgent)
      const sessions = await fetch_sessions({ ...appContext, user })({ selectedAgent })
      setSessions([...sessions].reverse())
      if (location.pathname === '/') {
        setShowHeading(true)
        return;
      }
      let sessionId = location.pathname.substring(1)
      await getSession({ sessionId, selectedAgent, user })
      setSession(sessionId)
    } catch (e) {
      setShowHeading(true)
      if (e.name == UNAUTHORIZED) {
        navigate("/")
        return
      };
      console.error(e)
      setSnack(config.errorMessage)
    } finally {
      setTimeout(() => {
        setLoading(false)
      }, 500)
    }
  }

  useEffect(() => {
    onAppLoad()
  }, []);


  return (
    <>
      <AppContext.Provider value={appContext}>
        <Layout history={history}>
          <Routes>
            <Route path="/:sessionId" element={<ChatPage />} />
            <Route path="/" element={<ChatPage />} />
          </Routes>
        </Layout>
        <Snackbar
          open={!!snack}
          autoHideDuration={2000}
          onClose={() => {
            setSnack()
          }}
          message={snack}
        />
      </AppContext.Provider>
    </>
  )
}

export default App