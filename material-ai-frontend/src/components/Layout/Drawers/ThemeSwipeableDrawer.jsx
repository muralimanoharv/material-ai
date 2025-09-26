import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Typography } from '@mui/material';
import { LayoutContext } from '../../../context'


export default function ThemeSwipeableDrawer() {
    const {
        setThemeDrawerOpen,
        setSettingsDrawerOpen,
        themeDrawerOpen,
        currentTheme,
        setTheme,
    } = React.useContext(LayoutContext)
    const theme = useTheme()

    return <SwipeableDrawer
        anchor='bottom'
        open={themeDrawerOpen}
        onClose={() => {
            setSettingsDrawerOpen(false)
            setThemeDrawerOpen(false)
        }}>
        <Box p={2}>
            <Typography variant='h5'>
                Select a theme
            </Typography>
            <List sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                '& .MuiListItem-root:first-of-type': {
                    borderTopLeftRadius: '12px',
                    borderTopRightRadius: '12px',
                },
                '& .MuiListItem-root:last-of-type': {
                    borderBottomLeftRadius: '12px',
                    borderBottomRightRadius: '12px',
                },
            }}>
                {["System", "Light", "Dark"].map(themeType => {
                    return <ListItem
                        sx={{
                            backgroundColor: theme.palette.background.default,
                        }}
                        disablePadding key={themeType}>
                        <ListItemButton onClick={() => {
                            setTheme(themeType.toLowerCase())
                        }}>
                            <ListItemText primary={themeType} />
                            {currentTheme === themeType.toLowerCase() ? <CheckCircleOutlineIcon fontSize='small' /> : null}
                        </ListItemButton>
                    </ListItem>
                })}
            </List>
        </Box>
    </SwipeableDrawer>
}