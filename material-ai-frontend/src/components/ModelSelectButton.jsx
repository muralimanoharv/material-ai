import * as React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Box, Typography, useTheme } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { MODELS } from '../assets/models';
import { AppContext } from '../context';

export default function ModelSelectButton() {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const { currentModel, setCurrentModel } = React.useContext(AppContext)
    const open = Boolean(anchorEl);
    const theme = useTheme()
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const verticle = -100 - (MODELS.length - 1) * 50

    return (
        <div>
            <Button
                id="basic-button"
                aria-controls={open ? 'basic-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
                endIcon={<KeyboardArrowDownIcon fontSize='small' />}
                sx={{
                    borderRadius: '24px',
                    padding: '0 16px',
                    height: '40px',
                    width: '120px'
                }}
            >
                {currentModel}
            </Button>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: verticle,
                    horizontal: 'left',
                }}

                open={open}
                onClose={handleClose}
                slotProps={{
                    list: {
                        'aria-labelledby': 'basic-button',
                    },
                }}
            >
                <Box sx={{ width: 320 }}>
                    <Typography
                        sx={{
                            padding: '8px 16px'
                        }}
                        variant='h5'>
                        Choose your model
                    </Typography>
                    {MODELS.map(({ model, tagline }) => {
                        return <MenuItem
                            onClick={() => {
                                // setCurrentModel(model)
                            }} key={model}>
                            <Box sx={{
                                width: '100%',
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                    <Typography variant='h5'><strong>{tagline}</strong></Typography>
                                    <Typography variant='h6'>{model}</Typography>
                                </Box>
                                {
                                    currentModel == model ?
                                        <Box>
                                            <CheckCircleIcon color='primary' />
                                        </Box> : null
                                }
                            </Box>
                        </MenuItem>
                    })}

                </Box>
            </Menu>
        </div>
    );
}
