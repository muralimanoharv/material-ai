import * as React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Box, IconButton, ListItemIcon, Tooltip, Typography, useTheme } from '@mui/material';
import { FILE_OPTIONS } from '../../assets/config';
import AddIcon from '@mui/icons-material/Add';
import { AppContext } from '../../context';

export default function FileSelectMenu(props) {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const fileInputRef = React.useRef(null);
    const theme = useTheme()
    const { setSnack } = React.useContext(AppContext)
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const uploadFile = () => {
        fileInputRef.current.click();
    }

    const fileExists = (name) => {
        const currentFiles = props.files ?? []
        return !!currentFiles.find(file => file.name === name)
    }

    const handleFileChange = (event) => {
        const newFiles = [...props.files]
        if (event.target.files && event.target.files.length) {
            for (let file of event.target.files) {
                if (fileExists(file.name)) {
                    setSnack(`You already uploaded a file named ${file.name}`)
                    continue;
                }
                newFiles.push(file)
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
                <Box sx={{ width: 200 }}>
                    {FILE_OPTIONS.map(({ title, icon: Icon }) => {
                        return <MenuItem onClick={() => uploadFile()} key={title}>
                            <ListItemIcon>
                                {<Icon fontSize='small' />}
                            </ListItemIcon>
                            <Typography variant='h5'>{title}</Typography>
                        </MenuItem>
                    })}

                </Box>
            </Menu>
        </div>
    );
}
