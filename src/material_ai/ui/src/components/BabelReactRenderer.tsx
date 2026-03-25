/* eslint-disable */
import React, { useState, Component, useEffect, type ReactNode } from 'react'
import {
  Box,
  IconButton,
  Collapse,
  Typography,
  Stack,
  Paper,
} from '@mui/material'
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material'
import { styled } from '@mui/material/styles'
import * as Babel from '@babel/standalone'

const loaders: Record<string, () => Promise<any>> = {
  react: () => import('react'),
  'chart.js': () => import('chart.js'),
  'chart.js/auto': () => import('chart.js/auto'),
  '@mui/material': () => import('@mui/material'),
  'react-chartjs-2': () => import('react-chartjs-2'),
  '@mui/icons-material': () => import('@mui/icons-material'),
  'react-hook-form': () => import('react-hook-form'),
  '@xyflow/react': () => import('@xyflow/react'),
  '@xyflow/react/dist/style.css': () => import('@xyflow/react/dist/style.css'),
}

interface PreviewErrorBoundaryProps {
  code: string
  children: ReactNode
}

interface PreviewErrorBoundaryState {
  error: Error | null
}

class PreviewErrorBoundary extends Component<
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

  public componentDidCatch(error: Error, errorInfo: any): void {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render(): ReactNode {
    const { error } = this.state
    const { code, children } = this.props

    if (error) {
      return <ShowErrorMessage error={error.message} code={code} />
    }

    return children
  }
}

export default function BabelReactRenderer({ code }: { code: string }) {
  const [syntaxError, setSyntaxError] = useState<string | null>(null)
  const [Component, setComponent] = useState<React.FC | null>(null)

  const load = async () => {
    try {
      setSyntaxError(null)

      const transformed = Babel.transform(code, {
        filename: 'preview.tsx',
        presets: ['react', 'typescript'],
        plugins: [
          ({ types: t }) => ({
            visitor: {
              CallExpression(path: any) {
                if (path.node.callee.name === 'require') {
                  path.replaceWith(t.awaitExpression(path.node))
                  path.skip()
                }
              },
            },
          }),
          ['transform-modules-commonjs', { noInterop: true }],
        ],
      }).code

      const executeCode = new Function(
        'React',
        'exports',
        'require',
        `
          return (async () => {
            ${transformed}
          })();
        `,
      )

      const exportsObject: Record<string, any> = {}
      const requireFn = async (module: string) => {
        if (module in loaders) {
          return await loaders[module]()
        }
        setSyntaxError(`Unknown module: ${module}`)
      }

      await executeCode(React, exportsObject, requireFn)

      if (exportsObject.default) {
        setComponent(() => exportsObject.default)
      } else {
        setSyntaxError('No default export found')
      }
    } catch (err: any) {
      setSyntaxError(err.message)
      return null
    }
  }

  useEffect(() => {
    load()
  }, [code])

  return (
    <>
      {syntaxError ? (
        <ShowErrorMessage error={syntaxError} code={code} />
      ) : (
        <PreviewErrorBoundary code={code}>
          {Component && <Component />}
        </PreviewErrorBoundary>
      )}
    </>
  )
}

const ExpandIconWrapper = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'expand',
})<{ expand: boolean }>(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}))

function ShowErrorMessage({ error, code }: { error: string; code: string }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Box sx={{ width: '100%', my: 1 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ color: 'error.main' }}
      >
        <Typography variant="body2" fontWeight="medium">
          <b>Runtime Error:</b> {error}
        </Typography>
        <ExpandIconWrapper
          expand={expanded}
          onClick={() => setExpanded(!expanded)}
          size="small"
          aria-label="show more"
          data-testid="chat-function-response-toggle"
        >
          <ExpandMoreIcon fontSize="inherit" />
        </ExpandIconWrapper>
      </Stack>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Paper
          variant="outlined"
          sx={{
            p: 1.5,
            mt: 1,
            color: 'warning.main',
            borderColor: 'error.light',
          }}
        >
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
