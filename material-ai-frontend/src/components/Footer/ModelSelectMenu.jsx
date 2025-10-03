import * as React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Box, Typography } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { AppContext } from '../../context';
import { config } from '../../assets/config';
import { menuNeedsLogin } from '../../hoc';

export default function ModelSelectMenu() {
    const { currentModel, user } = React.useContext(AppContext)
    const [anchorEl, setAnchorEl] = React.useState(null); 
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const verticle = -100 - (config.models.length - 1) * 50

    if(!user) return null;

    return (
        <React.Fragment>
            <Button
                id="model-button"
                aria-controls={open ? 'model-menu' : undefined}
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
                id="model-menu"
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: verticle,
                    horizontal: 'left',
                }}
                open={open}
                onClose={handleClose}
                slotProps={{
                    list: {
                        'aria-labelledby': 'model-button',
                    },
                }}
            >
                <Box sx={{ width: 320 }}>
                    <Typography
                        sx={{
                            padding: '8px 16px'
                        }}
                        variant='h4'>
                        Choose your model
                    </Typography>
                    {config.models.map(({ model, tagline }) =>
                        <ModelItem model={model} tagline={tagline} key={model} />)}
                </Box>
            </Menu>
        </React.Fragment>
    );
}

function ModelItem({ model, tagline }) {
    const { currentModel } = React.useContext(AppContext)
    return <MenuItem key={model}>
        <Box sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant='h5'>{tagline}</Typography>
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
}
