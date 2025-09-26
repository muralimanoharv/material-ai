import { useState, useEffect, useRef } from 'react'
import { AppContext, HistoryContext } from './context.jsx'
import { INPUT_JSON, translate } from './translator.jsx'
import { create_session, send_message, fileToBase64 } from './api.js'
import './App.css'
import Layout from './components/Layout/Layout.jsx'
import ChatSection from './components/ChatSection.jsx'
import { MODELS } from './assets/config.js'
import { Snackbar } from '@mui/material'


function App() {
  const [state, setState] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [snack, setSnack] = useState('')
  const [currentModel, setCurrentModel] = useState(MODELS[0].model)
  const [files, setFiles] = useState([])
  const [controller, setController] = useState(undefined)

  const setPrompt = (prompt) => {
    setState(prevState => {
      return {
        ...prevState,
        prompt
      }
    })
  }

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

      const messages = await send_message(appContext)({ ...state, parts, controller })
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
    ...state, setPrompt,
    send, loading, setLoading, currentModel,
    setCurrentModel, setSnack, files, setFiles,
    cancelApi
  }


  useEffect(() => {
    create_session({ user_id: 'user' })
      .then(session => {
        setState({
          ...session,
          prompt: ''
        })
      })
  }, []);

  if (!state) return null;

  return (
    <>
      <AppContext.Provider value={appContext}>
        <Layout history={history}>
          <HistoryContext.Provider value={{ history, add_history, delete_history }}>
            <ChatSection />
          </HistoryContext.Provider>
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
