import Box from '@mui/material/Box'
import {
  useContext,
  useState,
  type SyntheticEvent,
  type KeyboardEvent,
  type ClipboardEvent,
} from 'react'
import { AppContext, type AppContextType } from '../../context'
import {
  InputBase,
  IconButton,
  Typography,
  useTheme,
  Tooltip,
} from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import StopRoundedIcon from '@mui/icons-material/StopRounded'
import FullscreenOutlinedIcon from '@mui/icons-material/FullscreenOutlined'
import FullscreenExitOutlinedIcon from '@mui/icons-material/FullscreenExitOutlined'
import { CHAT_SECTION_WIDTH } from '../../assets/themes'
import ModelSelectMenu from '../menu/ModelSelectMenu'
import FileSelectMenu from '../menu/FileSelectMenu'
import AgentSelectMenu from '../menu/AgentSelectMenu'
import FileBox from '../chat/item/FileBox'

// =============================================================================
// 2. Component
// =============================================================================

export default function PromptInput() {
  const { promptLoading, files, setFiles, user, config, chatService } =
    useContext(AppContext) as AppContextType

  const theme = useTheme()
  const [fullScreen, setFullScreen] = useState(false)
  const [prompt, setPrompt] = useState('')

  const handleSubmit = (event?: SyntheticEvent) => {
    event?.preventDefault()
    chatService.send_message(prompt, { submittedFiles: [...files], setPrompt })
  }

  const handleKeyDown = (
    event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event?.preventDefault()
      handleSubmit(event)
    }
  }

  const onClearFile = (name: string) => {
    setFiles((prevFiles) => {
      return [...prevFiles.filter((file) => file.name !== name)]
    })
  }

  // Theme logic
  let boxShadow = '0 -25px 15px -5px rgba(255, 255, 255, 1)'
  if (theme.palette.mode === 'dark') {
    boxShadow = '0 -25px 15px -5px rgba(19, 19, 20, 0.5)'
  }

  let border = '1px solid #c4c7c5'
  if (theme.palette.mode === 'dark') {
    border = '1px solid #4a5050'
  }

  const handlePaste = (e: ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    const currentPrompt = prompt
    const newPrompt = currentPrompt + text
    setPrompt(newPrompt)
  }

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: CHAT_SECTION_WIDTH,
        margin: '0 16px',
        transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
        boxShadow,
        zIndex: '999',
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: '8px',
          flexDirection: 'column',
          display: 'flex',
          border,
          borderRadius: '24px',
          boxSizing: 'border-box',
          transition:
            'box-shadow 0.3s ease, border-radius .1s cubic-bezier(.2,0,0,1), height .15s cubic-bezier(.2,0,0,1)',
        }}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {files.map((file) => (
            <FileBox
              key={file.name}
              file={file}
              showClear
              onClearFile={onClearFile}
            />
          ))}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <InputBase
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            disabled={!user}
            autoFocus
            multiline
            fullWidth
            id="input-base"
            autoComplete="off"
            sx={{
              padding: '2px 12px',
              flex: 1,
              '& .MuiInputBase-inputMultiline': {
                transition: 'height 0.3s ease',
                maxHeight: '500px',
                minHeight: '25px',
                height: '25px',
                padding: '10px 0px',
                overflowY: 'auto !important',
                '&::placeholder': {
                  opacity: 0.8,
                },
              },
            }}
            placeholder={
              user ? `Ask ${config.title}` : `Sign in to ask ${config.title}`
            }
            inputProps={{
              'aria-label': `Ask ${config.title}`,
              style: {
                height: fullScreen ? '500px' : undefined,
              },
            }}
          />
          {prompt?.length > 164 || fullScreen ? (
            <Box sx={{ position: 'relative', width: '15px', height: '15px' }}>
              <Tooltip title="Fullscreen">
                <IconButton
                  sx={{ position: 'absolute', left: '-20px', top: '-5px' }}
                  onClick={() => setFullScreen(!fullScreen)}
                >
                  {fullScreen ? (
                    <FullscreenExitOutlinedIcon />
                  ) : (
                    <FullscreenOutlinedIcon />
                  )}
                </IconButton>
              </Tooltip>
            </Box>
          ) : null}
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'flex-start', gap: '5px' }}
          >
            <FileSelectMenu setFiles={setFiles} files={files} />
            {/* Note: AgentSelectMenu in previous steps didn't accept props, 
                but we pass them here based on the original JSX. 
                If typescript complains, update AgentSelectMenu definition. */}
            <AgentSelectMenu />
          </Box>
          <Box
            sx={{
              display: 'flex',
              gap: '5px',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <ModelSelectMenu />
            {promptLoading ? (
              <Tooltip title="Stop response">
                <IconButton
                  onClick={() => chatService.cancel_api()}
                  sx={{ backgroundColor: theme.palette.background.paper }}
                  color="primary"
                  aria-label="directions"
                >
                  <StopRoundedIcon
                    sx={{
                      color:
                        (theme.palette.text as any).selected ||
                        theme.palette.primary.main,
                    }}
                    fontSize="medium"
                  />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Submit">
                <IconButton
                  disabled={!prompt || !user}
                  // We can pass the event handler directly
                  onClick={handleSubmit}
                  sx={{ backgroundColor: theme.palette.background.paper }}
                  // 'default' color removed in v5, use 'inherit' or remove prop
                  color="inherit"
                  aria-label="directions"
                >
                  <SendIcon fontSize="medium" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      </Box>
      <Box
        sx={{ textAlign: 'center', marginTop: '16px', marginBottom: '16px' }}
      >
        <Typography variant="h6">
          {config.title} can make mistakes, so double-check it
        </Typography>
      </Box>
    </Box>
  )
}
