import * as React from 'react'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import {
  Box,
  IconButton,
  ListItemIcon,
  Tooltip,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined'
import { menuNeedsLogin } from './hoc'

interface FileSelectMenuProps {
  onFileUpload: () => void
}

interface FileSelectMenuBodyProps {
  onFileUpload: () => void
}

const FILE_OPTIONS = [
  {
    title: 'Upload files',
    icon: <AttachFileOutlinedIcon fontSize="small" />,
    dataTestId: 'prompt-input-upload-files',
  },
]

function FileSelectMenu(props: FileSelectMenuProps) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null)

  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <div>
      <Tooltip title="Add files">
        <IconButton
          data-testid="prompt-input-file-menu"
          id="file-button"
          color="inherit"
          aria-label="add file"
          aria-controls={open ? 'file-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
        >
          <AddIcon fontSize="medium" />
        </IconButton>
      </Tooltip>

      <Menu
        id="file-menu"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: -50,
          horizontal: 'left',
        }}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'file-button',
        }}
      >
        <FileSelectMenuBody onFileUpload={props.onFileUpload} />
      </Menu>
    </div>
  )
}

const FileSelectMenuBody = menuNeedsLogin<FileSelectMenuBodyProps>((props) => {
  return (
    <Box sx={{ width: 200 }}>
      {FILE_OPTIONS.map(({ title, icon, dataTestId }) => {
        return (
          <MenuItem
            data-testid={dataTestId}
            onClick={() => props.onFileUpload()}
            key={title}
          >
            <ListItemIcon>{icon}</ListItemIcon>
            <Typography variant="h5">{title}</Typography>
          </MenuItem>
        )
      })}
    </Box>
  )
}, 'Sign in to upload files')

export default FileSelectMenu
