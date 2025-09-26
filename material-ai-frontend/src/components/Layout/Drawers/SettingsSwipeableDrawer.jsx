
import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import PaletteIcon from '@mui/icons-material/Palette';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ThemeSwipeableDrawer from './ThemeSwipeableDrawer';
import { LayoutContext } from '../../../context';


export default function SettingsSwipeableDrawer() {
    const {
        setThemeDrawerOpen,
        setSettingsDrawerOpen,
        settingsDrawerOpen,
    } = React.useContext(LayoutContext)

    return <>
        <SwipeableDrawer
            anchor='bottom'
            open={settingsDrawerOpen}
            onClose={() => {
                setSettingsDrawerOpen(false)
            }}
        >
            <Box p={2} >
                <List>
                    <ListItem
                        disablePadding>
                        <ListItemButton
                            sx={{
                                '&:hover': {
                                    backgroundColor: 'transparent',
                                },
                            }}

                            onClick={() => setThemeDrawerOpen(true)}>
                            <ListItemIcon>
                                <PaletteIcon />
                            </ListItemIcon>
                            <ListItemText primary={"Theme"} />
                            <ArrowRightIcon />
                        </ListItemButton>
                    </ListItem>
                </List>
            </Box>

        </SwipeableDrawer>
        <ThemeSwipeableDrawer />
    </>
}