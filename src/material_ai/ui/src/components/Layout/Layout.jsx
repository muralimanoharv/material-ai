import * as React from 'react'
import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import CssBaseline from '@mui/material/CssBaseline'
import Header from './Header'
import { AppConfigContext, LayoutContext } from '../../context'
import SettingsSwipeableDrawer from './Drawers/SettingsSwipeableDrawer'
import MenuButton from './Buttons/MenuButton'
import SettingsButton from './Buttons/SettingsButton'
import MaterialDrawer, { drawerWidth } from '../material/MaterialDrawer'
import Footer from './Footer'
import SessionHistorySection from './SessionHistorySection'
import NewChatButton from './Buttons/NewChatButton'
import { Drawer } from '@mui/material'
import { useMobileHook } from '../../hooks'

export default function Layout(props) {
  const [open, setOpen] = React.useState(false)
  const [hoverOpen, setHoverOpen] = React.useState(false)
  const [settingsDrawerOpen, setSettingsDrawerOpen] = React.useState(false)
  const [themeDrawerOpen, setThemeDrawerOpen] = React.useState(false)
  const isMobile = useMobileHook()
  const theme = useTheme()
  const { theme: currentTheme, setTheme } = React.useContext(AppConfigContext)

  const scrollableBoxRef = React.useRef(null)

  let isDrawerOpen = () => {
    if (isMobile) return open
    return open || hoverOpen
  }

  React.useEffect(() => {
    if (scrollableBoxRef.current) {
      // const scrollableElement = scrollableBoxRef.current;
      // scrollableElement.scrollTo({
      //     top: scrollableElement.scrollHeight,
      //     behavior: 'smooth'
      // });
      let last_model_box = document.querySelector(
        '.chat-item-box-user:last-of-type',
      )
      if (!last_model_box) return
      last_model_box.scrollIntoView({
        behavior: 'smooth',
        inline: 'start',
        block: 'start',
      })
    }
  }, [props.history])

  return (
    <LayoutContext.Provider
      value={{
        open,
        setOpen,
        setHoverOpen,
        isDrawerOpen,
        settingsDrawerOpen,
        setSettingsDrawerOpen,
        themeDrawerOpen,
        setThemeDrawerOpen,
        theme,
        currentTheme,
        setTheme,
      }}
    >
      <Box sx={{ display: 'flex', flexFlow: 1 }}>
        <CssBaseline />
        <FlexibleDrawer>
          <Box
            sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}
          >
            {!isMobile && <MenuButton />}
            <Box
              onMouseLeave={() => setHoverOpen(false)}
              onMouseEnter={() => setHoverOpen(true)}
              sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
            >
              <NewChatButton />
              <Box
                sx={{
                  flexGrow: 1,
                  display: 'flex',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                }}
              >
                <SessionHistorySection />
              </Box>
              <SettingsButton />
            </Box>
          </Box>
        </FlexibleDrawer>
        <SettingsSwipeableDrawer />
        <Box component="main" sx={{ flexGrow: 1 }}>
          <Box
            sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}
          >
            <Header />
            <Box
              sx={{ flexGrow: 1, overflowY: 'auto', padding: '0 16px' }}
              ref={scrollableBoxRef}
            >
              {props.children}
            </Box>
            <Footer />
          </Box>
        </Box>
      </Box>
    </LayoutContext.Provider>
  )
}

function FlexibleDrawer(props) {
  const { isDrawerOpen, setOpen } = React.useContext(LayoutContext)
  const isMobile = useMobileHook()

  if (isMobile) {
    return (
      <Drawer
        sx={{
          '& .MuiDrawer-paper': {
            minWidth: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        ModalProps={{
          keepMounted: true,
        }}
        onClose={() => {
          setOpen(false)
        }}
        open={isDrawerOpen()}
      >
        {props.children}
      </Drawer>
    )
  }
  return (
    <MaterialDrawer variant="permanent" open={isDrawerOpen()}>
      {props.children}
    </MaterialDrawer>
  )
}
