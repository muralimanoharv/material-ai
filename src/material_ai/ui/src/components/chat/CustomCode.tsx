import {
  AppBar,
  Box,
  Collapse,
  IconButton,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import { useState } from 'react'

function CustomCode(props: {
  content: string
  onCopy?: () => void
  title?: string
}) {
  const [showContent, setShowContent] = useState(true)
  const theme = useTheme()
  return (
    <Box
      sx={{
        display: 'block',
        flexGrow: 1,
        width: props.onCopy ? '100%' : undefined,
      }}
    >
      <AppBar
        position="sticky"
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: theme.palette.background.card,
          color: theme.palette.text.primary,
          padding: '8px 16px',
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px',
          marginBottom: '4px',
          boxShadow: 'none',
        }}
      >
        <Typography variant="h5">{props.title}</Typography>
        <Box>
          <IconButton onClick={() => setShowContent(!showContent)}>
            {showContent ? (
              <KeyboardArrowUpIcon fontSize="small" />
            ) : (
              <KeyboardArrowDownIcon fontSize="small" />
            )}
          </IconButton>

          {props.onCopy && (
            <Tooltip title="Copy">
              <IconButton
                className="json-copy"
                onClick={async () => {
                  if (props.onCopy) props.onCopy()
                }}
              >
                <ContentCopyIcon sx={{ fontSize: '16px' }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </AppBar>
      <Collapse in={showContent} timeout="auto">
        <Box
          sx={{
            backgroundColor: theme.palette.background.card,
            padding: '8px 16px',
            borderBottomLeftRadius: '12px',
            borderBottomRightRadius: '12px',
          }}
        >
          <Box sx={{ width: '100%', overflowX: 'auto' }}>
            <SyntaxHighlighter
              style={theme.palette.mode === 'dark' ? vscDarkPlus : vs}
              language="json"
              wrapLines={true}
              wrapLongLines={true}
              customStyle={{
                margin: 0,
                border: 'none',
                backgroundColor: theme.palette.background.card,
              }}
            >
              {props.content}
            </SyntaxHighlighter>
          </Box>
        </Box>
      </Collapse>
    </Box>
  )
}

export default CustomCode
