import * as React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Box, IconButton, ListItemIcon, Tooltip, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { AppContext } from '../../context';
import { fileToBase64 } from '../../utils';
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined';
import { menuNeedsLogin } from '../../hoc';



const FILE_OPTIONS = [
    {
        title: 'Upload files',
        icon: AttachFileOutlinedIcon
    },
]

function FileSelectMenu(props) {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const fileInputRef = React.useRef(null);
    const { setSnack } = React.useContext(AppContext)
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const onFileUpload = () => {
        fileInputRef.current.click();
    }

    const fileExists = (name) => {
        const currentFiles = props.files ?? []
        return !!currentFiles.find(file => file.name === name)
    }

    const handleFileChange = async (event) => {
        const newFiles = [...props.files]
        if (event.target.files && event.target.files.length) {
            for (let file of event.target.files) {
                if (fileExists(file.name)) {
                    setSnack(`You already uploaded a file named ${file.name}`)
                    continue;
                }
                const { data, type } = await fileToBase64(file)
                newFiles.push({
                    name: file.name,
                    version: 0,
                    type: 'upload',
                    inlineData: {
                        data,
                        mimeType: type
                    }
                })
            }
        }
        props.setFiles([...newFiles])
        handleClose()
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div>
            <Tooltip title="Add files">
                <IconButton
                    id='file-button'
                    color="default"
                    aria-label="add file"
                    aria-controls={open ? 'file-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    onClick={handleClick}
                >
                    <AddIcon fontSize='medium' />
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
                slotProps={{
                    list: {
                        'aria-labelledby': 'file-button',
                    },
                }}
            >
                <FileSelectMenuBody onFileUpload={onFileUpload} />

            </Menu>
        </div>
    );
}


const FileSelectMenuBody = menuNeedsLogin((props) => {
    return <Box sx={{ width: 200 }}>
        {FILE_OPTIONS.map(({ title, icon: Icon }) => {
            return <MenuItem onClick={() => props.uploadFile()} key={title}>
                <ListItemIcon>
                    {<Icon fontSize='small' />}
                </ListItemIcon>
                <Typography variant='h5'>{title}</Typography>
            </MenuItem>
        })}

    </Box>
}, 'Sign in to upload files')


export default FileSelectMenu