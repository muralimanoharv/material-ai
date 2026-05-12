/* eslint-disable */
import React, {
  useState,
  Component,
  useEffect,
  type ReactNode,
  useContext,
} from 'react'
import {
  Box,
  IconButton,
  Collapse,
  Typography,
  Stack,
  Paper,
} from '@mui/material'
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material'
import { styled, useTheme } from '@mui/material/styles'
import * as Babel from '@babel/standalone'
import ShowReactCode from './ShowReactCode'
import { ContentCopy as CopyIcon } from '@mui/icons-material'
import { AppContext, type AppContextType } from '../context'

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
        // 1. Check for an exact match first (e.g., 'react' or 'chart.js')
        if (module in loaders) {
          return await loaders[module]()
        }

        // 2. Resolve subpaths dynamically (e.g., '@mui/icons-material/InfoOutlined')
        const matchedLoaderKey = Object.keys(loaders).find((key) => {
          // Ensure we match whole path segments (e.g., '@mui/material' shouldn't match '@mui/material-next')
          return module.startsWith(key + '/')
        })

        if (matchedLoaderKey) {
          // Load the base/root package (e.g., loads '@mui/icons-material')
          const baseModule = await loaders[matchedLoaderKey]()

          // Extract the subpath segment (e.g., "InfoOutlined")
          const subpath = module.slice(matchedLoaderKey.length + 1)

          // If there is no nested subpath (just a direct export name like InfoOutlined)
          if (!subpath.includes('/')) {
            if (baseModule && subpath in baseModule) {
              // Return it wrapped as a default export to satisfy: import InfoOutlinedIcon from '...'
              return {
                default: baseModule[subpath],
                ...baseModule[subpath], // Spread in case they destructure
              }
            }
          }
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
    <Box
      sx={{
        '&:hover .show-code-button': {
          opacity: '1',
        },
      }}
    >
      {syntaxError ? (
        <ShowErrorMessage error={syntaxError} code={code} />
      ) : (
        <PreviewErrorBoundary code={code}>
          <ShowReactCode code={code} />
          {Component && <Component />}
        </PreviewErrorBoundary>
      )}
    </Box>
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
  const { setSnack } = useContext(AppContext) as AppContextType
  const [expanded, setExpanded] = useState(false)
  const theme = useTheme()

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
