import {
  Box,
  IconButton,
  Tooltip,
  Typography,
  useTheme,
  type TypographyProps,
} from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useContext, type ReactNode } from 'react'
import { renderDynamicUI, type UINode } from '../DynamicMuiLoader'
import {
  AppContext,
  ChatSectionContext,
  type AppContextType,
} from '../../context'

// 1. Define Props Interface
interface MarkdownProps {
  children: string | null | undefined
}

export default function Markdown(props: MarkdownProps) {
  const content = props.children || ''

  return (
    <div className="react-markdown" style={{ flexGrow: 1 }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: TypographyParser('p'),
          h1: TypographyParser('h1'),
          h2: TypographyParser('h2'),
          h3: TypographyParser('h3'),
          h4: TypographyParser('h4'),
          h5: TypographyParser('h5'),
          h6: TypographyParser('h6'),
          code: CustomCodeRenderer,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

function TypographyParser(variant: TypographyProps['variant']) {
  return ({ children }: { children?: ReactNode }) => (
    <Typography variant={variant}>{children}</Typography>
  )
}

const CustomCodeRenderer = ({
  className,
  children,
}: React.HTMLAttributes<HTMLElement>) => {
  const { mfeMarkdownJsonRenderer } = useContext(ChatSectionContext)
  const match = /language-(\w+)/.exec(className || '')
  const isJson = match && match[1] === 'json'
  const { setSnack } = useContext(AppContext) as AppContextType

  if (!isJson) return <PreBlock>{children}</PreBlock>

  let parsedData: Record<string, string> | null = null
  let isParsedSuccessfully = false

  try {
    const jsonString = String(children).replace(/\n$/, '')
    parsedData = JSON.parse(jsonString)
    isParsedSuccessfully = true
  } catch (error) {
    console.warn('Failed to parse JSON for UI:', error)
  }

  if (!isParsedSuccessfully) {
    return <PreBlock>{children}</PreBlock>
  }
  if (mfeMarkdownJsonRenderer) {
    const node = mfeMarkdownJsonRenderer(parsedData)
    if (node) return node
  }

  if (!parsedData?.componentName) {
    return (
      <PreBlock
        onCopy={async () => {
          await navigator.clipboard.writeText(
            JSON.stringify(parsedData, null, 2),
          )
          setSnack('Text copied to clipboard')
        }}
      >
        {JSON.stringify(parsedData, null, 2)}
      </PreBlock>
    )
  }

  // Success
  return <>{renderDynamicUI(parsedData as UINode)}</>
}

function PreBlock(props: { children: ReactNode; onCopy?: () => void }) {
  const theme = useTheme()
  return (
    <Box
      component={'pre'}
      sx={{
        fontSize: '14px',
        backgroundColor: theme.palette.background.card,
        padding: '8px',
        position: 'relative',
        '&:hover .json-copy': {
          opacity: '1',
        },
      }}
    >
      {props.onCopy && (
        <Tooltip title="Copy">
          <IconButton
            className="json-copy"
            onClick={async () => {}}
            sx={{
              position: 'absolute',
              right: 10,
              top: 10,
              fontSize: '8px',
              opacity: '0',
              transition: 'opacity 0.2s ease',
            }}
          >
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {props.children}
    </Box>
  )
}
