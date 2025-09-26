import { useState, useEffect, useRef } from 'react'
import { AppContext, HistoryContext } from './context.jsx'
import { INPUT_JSON, translate } from './translator.jsx'
import { create_session, send_message } from './api.js'
import './App.css'
import Layout from './components/Layout/Layout.jsx'
import ChatSection from './components/ChatSection.jsx'
import { MODELS } from './assets/models.js'
import { Snackbar } from '@mui/material'


function App() {
  const [state, setState] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [snack, setSnack] = useState('')
  const [currentModel, setCurrentModel] = useState(MODELS[0].model)


  const setPrompt = (prompt) => {
    setState(prevState => {
      return {
        ...prevState,
        prompt
      }
    })
  }

  const send = async (prompt, options = { ignoreUserHistory: false }) => {
    if (!prompt) return
    if (!options.ignoreUserHistory) {
      add_history({
        role: 'user',
        id: `${new Date().getTime()}`,
        prompt,
        parts: [
          {
            text: prompt
          }
        ]
      })
    }

    setPrompt('')
    try {
      const messages = await send_message(appContext)({ ...state, prompt })
      for (let message of messages) {
        add_history({
          ...message.content,
          role: 'model',
          id: message.id,
          prompt,
        })
      }
    } catch (e) {
      console.error(e)
      setPrompt(prompt)
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
    setCurrentModel, setSnack
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
