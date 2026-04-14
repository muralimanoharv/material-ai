import { Box, IconButton, Tooltip } from '@mui/material'
import CopyAllOutlinedIcon from '@mui/icons-material/CopyAllOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import { useContext } from 'react'
import { AppContext, type AppContextType } from '../../../context'

interface UserButtonsProps {
  text: string
}

export default function UserButtons(props: UserButtonsProps) {
  const { setSnack, setPrompt, input_focus, config } = useContext(
    AppContext,
  ) as AppContextType

  return (
    <Box
      className="actions-child"
      sx={{
        marginLeft: '20px',
        opacity: '0',
        transition: 'opacity 0.5s ease',
      }}
    >
      <Tooltip title={config.get().buttons.copyPrompt}>
        <IconButton
          data-testid="copy-prompt-button"
          onClick={async () => {
            await navigator.clipboard.writeText(props.text)
            setSnack(config.get().promptCopyMessage)
          }}
        >
          <CopyAllOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title={config.get().buttons.editPrompt}>
        <IconButton
          data-testid="edit-prompt-button"
          onClick={() => {
            setPrompt(props.text)
            input_focus()
          }}
        >
          <EditOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  )
}
