import * as React from 'react'
import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import { Drawer } from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'
import {
  ThemeContext,
  LayoutContext,
  type LayoutContextType,
  type ThemeContextType,
} from '../../context'
import SettingsSwipeableDrawer from './drawers/SettingsSwipeableDrawer'
import MaterialDrawer, { drawerWidth } from '../material/MaterialDrawer'
import Header from './Header'
import Footer from './Footer'
import SessionHistorySection from './SessionHistorySection'
import NewChatButton from './buttons/NewChatButton'
import MenuButton from './buttons/MenuButton'
import SettingsButton from './buttons/SettingsButton'
import { useMobileHook } from '../../hooks'

interface LayoutProps {
  children: React.ReactNode
  history?: any
}

interface FlexibleDrawerProps {
  children: React.ReactNode
}

export default function Layout(props: LayoutProps) {
  const [open, setOpen] = React.useState(false)
  const [hoverOpen, setHoverOpen] = React.useState(false)
  const [settingsDrawerOpen, setSettingsDrawerOpen] = React.useState(false)
  const [themeDrawerOpen, setThemeDrawerOpen] = React.useState(false)

  const isMobile = useMobileHook()
  const theme = useTheme()

  const { theme: currentTheme, setTheme } = React.useContext(
    ThemeContext,
  ) as ThemeContextType

  const scrollableBoxRef = React.useRef<HTMLDivElement>(null)

  const isDrawerOpen = () => {
    if (isMobile) return open
    return open || hoverOpen
  }

  React.useEffect(() => {
    if (scrollableBoxRef.current) {
      const parent = document.querySelector('.chat-items')

      if (parent) {
        const children = parent.children
        let lastUserMessage: Element | null = null

        for (let i = children.length - 1; i >= 0; i--) {
          if (children[i].classList.contains('chat-item-box-user')) {
            lastUserMessage = children[i]
            break
          }
        }

        if (!lastUserMessage) return

        lastUserMessage.scrollIntoView({
          behavior: 'smooth',
          inline: 'start',
          block: 'start',
        })
      }
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
      <Box sx={{ display: 'flex', flexFlow: 'row' }}>
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
                  height: '60vh',
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

function FlexibleDrawer(props: FlexibleDrawerProps) {
  const { isDrawerOpen, setOpen } = React.useContext(
    LayoutContext,
  ) as unknown as LayoutContextType
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
