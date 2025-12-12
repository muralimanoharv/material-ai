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
  AppContext,
  type AppContextType,
} from '../../context'
import SettingsSwipeableDrawer from './drawers/SettingsSwipeableDrawer'
import MaterialDrawer, { drawerWidth } from '../material/MaterialDrawer'
import Header from './Header'
import Footer from './Footer'
import SessionHistorySection from './SessionHistorySection'
import NewChatButton from './buttons/NewChatButton'
import MenuButton from './buttons/MenuButton'
import SettingsButton from './buttons/SettingsButton'
import { useAgentId, useMobileHook } from '../../hooks'
import AgentsButton from './buttons/AgentsButton'
import DrawerSigninButton from '../DrawerSigninButton'

interface LayoutProps {
  children: React.ReactNode
  showFooter?: boolean
}

interface FlexibleDrawerProps {
  children: React.ReactNode
}

export default function Layout({ children, showFooter = true }: LayoutProps) {
  const [settingsDrawerOpen, setSettingsDrawerOpen] = React.useState(false)
  const [themeDrawerOpen, setThemeDrawerOpen] = React.useState(false)

  const isMobile = useMobileHook()
  const theme = useTheme()

  const agentId = useAgentId()

  const context = React.useContext(AppContext) as AppContextType

  const {
    drawerOpen: open,
    drawerHoverOpen: hoverOpen,
    setDrawerOpen: setOpen,
    setDrawerHoverOpen: setHoverOpen,
  } = context

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
  }, [context?.history])

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
            {context.user ? (
              <AgentsButton />
            ) : (
              <Box p={1}>
                <DrawerSigninButton />
              </Box>
            )}
            {agentId && <NewChatButton />}

            <Box
              onMouseLeave={() => setHoverOpen(false)}
              onMouseEnter={() => setHoverOpen(true)}
              sx={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                overflowY: isDrawerOpen() ? 'auto' : 'hidden',
                overflowX: 'hidden',
              }}
            >
              {agentId && <SessionHistorySection />}
            </Box>
            <SettingsButton />
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
              {children}
            </Box>
            {showFooter && <Footer />}
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
