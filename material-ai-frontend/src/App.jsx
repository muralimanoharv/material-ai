import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom';
import { useNavigate, useParams } from 'react-router-dom';

import { AppContext } from './context.jsx'
// import { INPUT_JSON, translate } from './translator.jsx'
import { create_session, send_message, fileToBase64, get_sessions, fetch_session } from './api.js'
import Layout from './components/Layout/Layout.jsx'
import { MODELS } from './assets/config.js'
import { Snackbar } from '@mui/material'
import ChatPage from './components/pages/ChatPage.jsx';
import './App.css'


function App() {
  const [session, setSession] = useState()
  const [user, setUser] = useState('user')
  const [prompt, setPrompt] = useState('')
  const [history, setHistory] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(false)
  const [snack, setSnack] = useState('')
  const [currentModel, setCurrentModel] = useState(MODELS[0].model)
  const [files, setFiles] = useState([])
  const [controller, setController] = useState(undefined)
  const navigate = useNavigate();

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

  const send = async (prompt, options = { ignoreUserHistory: false, submittedFiles: [] }) => {
    if (!prompt) return
    try {
      let session_id = session;
      let user_id = user;
      if (!isValidSession()) {
        session_id = (await create_session({ user_id })).session_id
        setSession(session_id)
        navigate(`/${session_id}`);
      }
      await cancelApi()
      const controller = new AbortController();
      setController(controller)
      const parts = [{ text: prompt }]
      if (options.submittedFiles?.length) {
        let submittedFiles = options.submittedFiles;
        const fileDataPromises = submittedFiles.map(fileToBase64);
        const resolvedFileData = await Promise.all(fileDataPromises);
        const fileParts = resolvedFileData.map((file) => ({
          inline_data: {
            mime_type: file.type,
            data: file.data
          }
        }));
        const fileNames = resolvedFileData.map((file) => file.name);
        parts.push(...fileParts)
        parts.push({ text: JSON.stringify({ fileNames }) })
      }
      if (!options.ignoreUserHistory) {
        add_history({
          role: 'user',
          id: `${new Date().getTime()}`,
          prompt,
          parts
        })
      }

      setPrompt('')
      setFiles([])

      const messages = await send_message(appContext)(
        {
          session_id,
          user_id,
          parts,
          controller
        })
      for (let message of messages) {
        add_history({
          ...message.content,
          role: 'model',
          id: message.id,
          prompt,
        })
      }
    } catch (e) {
      if (e.name === 'AbortError') {
        return;
      }
      console.error(e)
      setPrompt(prompt)
      setFiles(options.submittedFiles)
      setSnack('Some error has occured, Please try again later')
    } finally {
      setController(undefined)
    }
  }

  const add_history = (history) => {
    setHistory(prevHistory => {
      return [
        ...prevHistory,
        history
      ]
    })
  }
  const delete_history = (id) => {
    setHistory(prevHistory => {
      return [...prevHistory.filter(history => history.id !== id)]
    })
  }

  const appContext = {
    session, setSession, user, setUser,
    prompt, setPrompt, isValidSession,
    send, loading, setLoading, currentModel,
    setCurrentModel, setSnack, files, setFiles,
    cancelApi, history, add_history, delete_history, sessions
  }


  useEffect(() => {
    get_sessions(appContext)({ user_id: user })
      .then(sessions => {
        setSessions(sessions)
      })
  }, []);

  useEffect(() => {
    if(!session) return;
    setHistory([])
    fetch_session(appContext)({session_id: session, user_id: user})
    .then(sessionDto => {
      setHistory(sessionDto.events.map(event => {
        return {
          ...event.content,
          id: event.id,
          prompt: ''
        }
      }))
    })
  }, [session])

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
