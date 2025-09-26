import * as React from 'react';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import PromptInput from '../PromptInput';
import Header from './Header';
import { ThemeToggleContext, LayoutContext } from '../../context';
import SettingsSwipeableDrawer from './Drawers/SettingsSwipeableDrawer';
import MenuButton from './Buttons/MenuButton';
import SettingsButton from './Buttons/SettingsButton';

const drawerWidth = 240;

const openedMixin = (theme) => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

const closedMixin = (theme) => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
});



const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme }) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        variants: [
            {
                props: ({ open }) => open,
                style: {
                    ...openedMixin(theme),
                    '& .MuiDrawer-paper': openedMixin(theme),
                },
            },
            {
                props: ({ open }) => !open,
                style: {
                    ...closedMixin(theme),
                    '& .MuiDrawer-paper': closedMixin(theme),
                },
            },
        ],
    }),
);

export default function Layout(props) {
    const [open, setOpen] = React.useState(false);
    const [settingsDrawerOpen, setSettingsDrawerOpen] = React.useState(false);
    const [themeDrawerOpen, setThemeDrawerOpen] = React.useState(false);
    const theme = useTheme();
    const { theme: currentTheme, setTheme } = React.useContext(ThemeToggleContext)

    const scrollableBoxRef = React.useRef(null);

    React.useEffect(() => {
        if (scrollableBoxRef.current) {
            const scrollableElement = scrollableBoxRef.current;
            scrollableElement.scrollTo({
                top: scrollableElement.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [props.history]);


    return (
        <LayoutContext.Provider value={
            {
                open,
                setOpen,
                settingsDrawerOpen,
                setSettingsDrawerOpen,
                themeDrawerOpen,
                setThemeDrawerOpen,
                theme,
                currentTheme,
                setTheme
            }
        }>
            <Box sx={{ display: 'flex', flexFlow: 1 }}>
                <CssBaseline />
                <Drawer variant="permanent" open={open}>
                    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
                        <Box>
                            <List>
                                <MenuButton />
                            </List>
                        </Box>
                        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'flex-end' }}>
                            <List sx={{ flexGrow: 1 }}>
                                <SettingsButton />
                            </List>
                        </Box>

                    </Box>
                </Drawer>
                <SettingsSwipeableDrawer />
                <Box component="main" sx={{ flexGrow: 1 }}>
                    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
                        <Header />
                        <Box sx={{ flexGrow: 1, overflowY: 'auto', padding: '0 16px' }} ref={scrollableBoxRef}>
                            {props.children}
                        </Box>
                        <Box sx={{ flexShrink: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <PromptInput />
                        </Box>
                    </Box>
                </Box>
            </Box>
        </LayoutContext.Provider>
    );
}







