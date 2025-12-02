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
import { AppContext } from '../../context'
import { fileToBase64 } from '../../utils'
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined'
import { menuNeedsLogin } from './hoc'
import { type FileAttachment } from '../../schema'

interface FileSelectMenuProps {
  files: FileAttachment[]
  setFiles: (files: FileAttachment[]) => void
}

interface FileSelectMenuBodyProps {
  onFileUpload: () => void
}

interface AppContextType {
  setSnack: (message: string) => void
}

const FILE_OPTIONS = [
  {
    title: 'Upload files',
    icon: <AttachFileOutlinedIcon fontSize="small" />,
  },
]

function FileSelectMenu(props: FileSelectMenuProps) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const { setSnack } = React.useContext(AppContext) as unknown as AppContextType

  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const onFileUpload = () => {
    fileInputRef.current?.click()
  }

  const fileExists = (name: string) => {
    const currentFiles = props.files ?? []
    return !!currentFiles.find((file) => file.name === name)
  }

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newFiles = [...(props.files || [])]

    if (event.target.files && event.target.files.length) {
      const selectedFiles = Array.from(event.target.files)

      for (const file of selectedFiles) {
        if (fileExists(file.name)) {
          setSnack(`You already uploaded a file named ${file.name}`)
          continue
        }

        try {
          const { data, type } = await fileToBase64(file)
          newFiles.push({
            name: file.name,
            version: 0,
            type: 'upload',
            inlineData: {
              data,
              mimeType: type,
            },
          })
        } catch (error) {
          console.error('Error processing file', file.name, error)
          setSnack(`Failed to process ${file.name}`)
        }
      }
    }

    props.setFiles([...newFiles])
    handleClose()

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div>
      <Tooltip title="Add files">
        <IconButton
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
      <input
        ref={fileInputRef}
        onChange={handleFileChange}
        type="file"
        id="file-upload"
        name="myFile"
        multiple
        style={{ display: 'none' }}
      />
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
        <FileSelectMenuBody onFileUpload={onFileUpload} />
      </Menu>
    </div>
  )
}

const FileSelectMenuBody = menuNeedsLogin<FileSelectMenuBodyProps>((props) => {
  return (
    <Box sx={{ width: 200 }}>
      {FILE_OPTIONS.map(({ title, icon }) => {
        return (
          <MenuItem onClick={() => props.onFileUpload()} key={title}>
            <ListItemIcon>{icon}</ListItemIcon>
            <Typography variant="h5">{title}</Typography>
          </MenuItem>
        )
      })}
    </Box>
  )
}, 'Sign in to upload files')

export default FileSelectMenu
