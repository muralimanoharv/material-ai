import { useEffect, useState } from 'react'
import { EmbeddingChart } from './Embeddings'
import { VectorInput } from './VectorInput'
import MUI from '@mui/material'
import { VectorConnection } from './VectorConnection'

const VectorAgentUI = (props) => {
  const [state, setState] = useState({ nodes: [], connections: [] })
  const [sessionId, setSessionId] = useState(props.sessionId)

  useEffect(() => {
    if (!sessionId) {
      props.apiService.create_session(props.agentId).then((session) => {
        setSessionId(session.id)
      })
    }
  }, [])

  const onDrawConnection = async (source, target) => {
    const response = await props.apiService.send_message_api({
      parts: [{ text: `Draw Connections '${source} to ${target}` }],
      sub: props.user.sub,
      app_name: props.agentId,
      session_id: sessionId,
    })
    if (response[0]?.content.parts[0]?.text) {
      setState(JSON.parse(response[0]?.content.parts[0]?.text))
    }
  }

  const onWordSubmit = async (word) => {
    const response = await props.apiService.send_message_api({
      parts: [{ text: `'Add Word '${word}` }],
      sub: props.user.sub,
      app_name: props.agentId,
      session_id: sessionId,
    })
    if (response[0]?.content.parts[0]?.text) {
      setState(JSON.parse(response[0]?.content.parts[0]?.text))
    }
  }

  if (!sessionId) return null

  return (
    <>
      <MUI.Grid
        container
        spacing={2}
        justifyContent="center"
        alignItems="start"
      >
        <MUI.Grid size={{ md: 6, xs: 12 }} data-testid="vector-input">
          <VectorInput onClick={onWordSubmit} />
        </MUI.Grid>
        <MUI.Grid size={{ md: 6, xs: 12 }} data-testid="vector-connection">
          <VectorConnection
            nodes={state.nodes.map((node) => node.label)}
            onDrawConnection={onDrawConnection}
          />
        </MUI.Grid>
        <MUI.Grid size={{ xs: 12 }} data-testid="vector-chart">
          <EmbeddingChart coords={state} />
        </MUI.Grid>
      </MUI.Grid>
    </>
  )
}

export default VectorAgentUI
