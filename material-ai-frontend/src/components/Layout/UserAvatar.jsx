import { useContext, useState } from "react";
import { AppContext } from "../../context";
import { Avatar, Box, IconButton, Menu, Tooltip, Typography } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import SignoutButton from "../SignoutButton";




export default function UserAvatar() {
    const { user } = useContext(AppContext);
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <Tooltip title={user.given_name}>
                <IconButton
                    id="user-profile-button"
                    aria-controls={open ? 'user-profile-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    onClick={handleClick}
                >
                    <Avatar
                        sx={{
                            cursor: 'pointer'
                        }}
                        alt={user?.given_name}
                        src={user.picture}
                    />
                </IconButton>
            </Tooltip>
            <Menu
                id="user-profile-menu"
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: 60,
                    horizontal: 'left',
                }}
                open={open}
                onClose={handleClose}
                slotProps={{
                    list: {
                        'aria-labelledby': 'agent-button',
                    },
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '25px', position: 'relative' }} width={400} padding={'8px 16px'}>
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                        <Typography textAlign={'center'} flexGrow={1} fontStyle={700} variant="h5">
                            <b>{user.email}</b>
                        </Typography>
                        <IconButton sx={{ position: 'absolute', right: 10 }} onClick={handleClose}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                        <Avatar
                            sx={{ width: 70, height: 70 }}
                            alt={user?.given_name}
                            src={user.picture}
                        />
                        <Typography fontSize={'22px'} variant="h1">Hi, {user.given_name}!</Typography>
                        <Box>
                            <SignoutButton />
                        </Box>
                    </Box>




                </Box>
            </Menu>
        </>
    )
}