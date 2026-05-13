import { useState, Component, type ReactNode, useContext } from 'react'
import {
  Box,
  IconButton,
  Collapse,
  Typography,
  Stack,
  Paper,
  Tooltip,
} from '@mui/material'
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material'
import { styled, useTheme } from '@mui/material/styles'
import {
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
  BugReport,
} from '@mui/icons-material'
import {
  AppContext,
  ChatItemContext,
  type AppContextType,
  type ChatItemContextType,
} from '../context'
import { useAgentId, useSessionId } from '../hooks'

interface PreviewErrorBoundaryProps {
  code: string
  children: ReactNode
}

interface PreviewErrorBoundaryState {
  error: Error | null
}

export class PreviewErrorBoundary extends Component<
  PreviewErrorBoundaryProps,
  PreviewErrorBoundaryState
> {
  public state: PreviewErrorBoundaryState = {
    error: null,
  }

  public static getDerivedStateFromError(
    error: Error,
  ): PreviewErrorBoundaryState {
    return { error }
  }

  public componentDidUpdate(prevProps: PreviewErrorBoundaryProps): void {
    if (prevProps.code !== this.props.code && this.state.error !== null) {
      this.setState({ error: null })
    }
  }

  public componentDidCatch(error: Error, errorInfo: never): void {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render(): ReactNode {
    const { error } = this.state
    const { code, children } = this.props

    if (error) {
      return <ShowErrorMessage error={error} code={code} />
    }

    return children
  }
}

const ExpandIconWrapper = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'expand',
})<{ expand: boolean }>(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}))

export function ShowErrorMessage({
  error,
  code,
}: {
  error: Error
  code: string
}) {
  const { setSnack, chatService, apiService } = useContext(
    AppContext,
  ) as AppContextType
  const agnetId = useAgentId()
  const sessionId = useSessionId()
  const { chat } = useContext(ChatItemContext) as ChatItemContextType
  const [expanded, setExpanded] = useState(false)
  const theme = useTheme()

  const retryFn = () => {
    chatService.send_message(
      `
            Getting this error message for the rendered UI "Runtime Error: ${error}" can you fix and retry
          `,
      { agent: agnetId, session_id: sessionId },
    )
  }

  const reportBug = async () => {
    await apiService.ui_render_bug({
      app_name: agnetId,
      error: error.message,
      code: code,
      stack_trace: error.stack,
      session_id: sessionId,
      id: chat.id,
    })
    setSnack('Bug report sent successfully!')
  }

  return (
    <Box sx={{ width: '100%', my: 1 }}>
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        gap="10px"
        sx={{ color: 'error.main' }}
      >
        <Typography
          sx={{ marginTop: '10px' }}
          flexGrow={1}
          variant="body2"
          fontWeight="medium"
        >
          <b>Runtime Error:</b> {error.message}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: '2px',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Tooltip title="RETRY">
            <IconButton color="error" onClick={retryFn}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Report Bug">
            <IconButton color="primary" onClick={reportBug}>
              <BugReport fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Show Code">
            <ExpandIconWrapper
              expand={expanded}
              onClick={() => setExpanded(!expanded)}
              size="small"
              aria-label="show more"
              data-testid="chat-function-response-toggle"
            >
              <ExpandMoreIcon fontSize="inherit" />
            </ExpandIconWrapper>
          </Tooltip>
        </Box>
      </Stack>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Paper
          variant="outlined"
          sx={{
            p: 1.5,
            mt: 1,
            color: 'warning.main',
            borderColor: 'error.light',
            position: 'relative',
          }}
        >
          <IconButton
            onClick={async () => {
              await navigator.clipboard.writeText(code)
              setSnack('Copied to clipboard')
            }}
            sx={{
              position: 'absolute',
              top: 12,
              right: 25,
              zIndex: 1,
              backgroundColor: theme.palette.background.paper,
              boxShadow: theme.shadows[2],
              '&:hover': { backgroundColor: theme.palette.background.default },
            }}
            size="small"
          >
            {<CopyIcon fontSize="small" />}
          </IconButton>
          <Typography
            component="pre"
            sx={{
              whiteSpace: 'pre-wrap',
              fontSize: '0.75rem',
              fontFamily: 'monospace',
              m: 0,
            }}
          >
            {code}
          </Typography>
        </Paper>
      </Collapse>
    </Box>
  )
}
