import { useState } from 'react'
import {
  Box,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Tooltip,
  useTheme,
} from '@mui/material'
import {
  Code as CodeIcon,
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon,
} from '@mui/icons-material'

/**
 * CodeViewerModule updated to prevent horizontal scrolling by wrapping long lines.
 */
const ShowReactCode = ({ code: codeSnippet }: { code: string }) => {
  const [open, setOpen] = useState<boolean>(false)
  const [copied, setCopied] = useState<boolean>(false)
  const theme = useTheme()

  const handleOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeSnippet)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  return (
    <Grid container spacing={3} sx={{ position: 'relative' }}>
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', p: 1 }}>
          {/* Transparent Button with Primary Icon */}
          <Button
            variant="text"
            onClick={handleOpen}
            startIcon={<CodeIcon sx={{ color: 'primary.main' }} />}
            className="show-code-button"
            sx={{
              textTransform: 'none',
              backgroundColor: 'transparent',
              position: 'absolute',
              right: 0,
              borderRadius: '30px',
              opacity: 0,
              transition: 'opacity 0.2s ease-in-out',
              padding: '12px 24px',
              color: 'text.primary',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            Show Code
          </Button>
        </Box>

        {/* Modal Popup with Wrap logic */}
        <Dialog
          open={open}
          onClose={handleClose}
          maxWidth="md"
          fullWidth
          aria-labelledby="source-code-dialog-title"
        >
          <DialogTitle
            id="source-code-dialog-title"
            sx={{
              m: 0,
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CodeIcon sx={{ color: 'primary.main' }} />
              <Typography variant="h6" fontWeight="600">
                Source Code
              </Typography>
            </Box>
            <IconButton onClick={handleClose} size="small" aria-label="close">
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers sx={{ p: 0 }}>
            <Box
              sx={{
                padding: '10px',
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr)',
                width: '100%',
                position: 'relative',
                backgroundColor: theme.palette.action.hover,
              }}
            >
              {/* Copy Action Overlay */}
              <Tooltip title={copied ? 'Copied!' : 'Copy code'}>
                <IconButton
                  onClick={handleCopy}
                  sx={{
                    position: 'absolute',
                    top: 12,
                    right: 25,
                    zIndex: 1,
                    backgroundColor: theme.palette.background.paper,
                    boxShadow: theme.shadows[2],
                    '&:hover': {
                      backgroundColor: theme.palette.background.default,
                    },
                  }}
                  size="small"
                >
                  {copied ? (
                    <CheckIcon fontSize="small" color="success" />
                  ) : (
                    <CopyIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>

              {/* Code Content with Wrap Logic */}
              <Box
                component="pre"
                sx={{
                  margin: 0,
                  display: 'block',
                  fontFamily:
                    'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
                  fontSize: '0.85rem',
                  lineHeight: 1.6,
                  color: theme.palette.text.primary,
                  // Logic to prevent horizontal scroll
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  overflowX: 'hidden',
                }}
              >
                {codeSnippet.trim()}
              </Box>
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleClose} variant="outlined" color="primary">
              Dismiss
            </Button>
          </DialogActions>
        </Dialog>
      </Grid>
    </Grid>
  )
}

export default ShowReactCode
