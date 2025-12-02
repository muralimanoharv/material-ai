import { Box, IconButton, Tooltip } from '@mui/material'
import CopyAllOutlinedIcon from '@mui/icons-material/CopyAllOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import { useContext } from 'react'
import { AppContext, type AppContextType } from '../../../context'

interface UserButtonsProps {
  text: string
}

export default function UserButtons(props: UserButtonsProps) {
  const { setSnack, setPrompt, input_focus } = useContext(
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
      <Tooltip title="Copy prompt">
        <IconButton
          onClick={async () => {
            await navigator.clipboard.writeText(props.text)
            setSnack('Prompt copied')
          }}
        >
          <CopyAllOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Edit prompt">
        <IconButton
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
