import { useContext, useEffect, useState } from 'react'
import { AppContext, LayoutContext } from '../../context'
import {
  delete_session,
  fetch_session,
  NOTFOUND,
  UNAUTHORIZED,
} from '../../api'
import { Box, IconButton, Tooltip, Typography, useTheme } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { drawerWidth } from '../material/MaterialDrawer'
import { useNavigate } from 'react-router-dom'
import { useMobileHook } from '../../hooks'
import SigninButton from '../SigninButton'
import { config } from '../../assets/config'

export default function SessionHistorySection() {
  const context = useContext(AppContext)
  const { isDrawerOpen } = useContext(LayoutContext)
  const theme = useTheme()
  return (
    <>
      <Box display={'flex'} flexDirection="column" padding="0 16px" gap="2px">
        <Typography
          display={isDrawerOpen() ? 'block' : 'none'}
          fontSize={'14px'}
          variant="h6"
          pb={'8px'}
          className="fade-in-animation"
        >
          Recent
        </Typography>
        {context.user ? (
          context.sessions.map((session) => (
            <SessionItem key={session.id} session={session} />
          ))
        ) : (
          <Box
            width={isDrawerOpen() ? 'auto' : 0}
            display={isDrawerOpen() ? 'flex' : 'none'}
            className="fade-in-animation"
            sx={{
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '25px',
              background: theme.palette.background.cardHover,
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              padding: '16px 20px',
            }}
          >
            <Box
              width="auto"
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                flexDirection: 'column',
                gap: '5px',
              }}
            >
              <Typography variant="h5">
                Sign in to start saving your chats
              </Typography>
              <Typography variant="h6" sx={{ textWrap: 'wrap' }}>
                Once you're signed in, you can access your recent chats here.
              </Typography>
            </Box>
            <SigninButton varient="text" />
          </Box>
        )}
      </Box>
    </>
  )
}

function SessionItem(props) {
  const context = useContext(AppContext)
  const theme = useTheme()
  const navigate = useNavigate()
  const session = props.session
  const [title, setTitle] = useState(session.id)
  const { isDrawerOpen, setOpen } = useContext(LayoutContext)
  const isMobile = useMobileHook()

  const fetchSession = async () => {
    try {
      const dto = await fetch_session(context)({ session_id: session.id })
      const events = dto.events.filter((event) => event.content.role == 'user')
      const firstEvent = events[0]
      const parts = firstEvent.content.parts.filter((part) => part['text'])
      const firstPart = parts[0]
      setTitle(firstPart.text)
    } catch (e) {
      if (e.name == UNAUTHORIZED) return
      console.debug(`Unable to parse title for session ${session.id}`)
      console.debug(e)
      setTitle(session.id)
    }
  }

  const isSelected = context.session === session.id

  const deleteSession = async (e) => {
    e?.stopPropagation()
    try {
      await delete_session(context)(session.id)
      context.setSessions((prevSessions) => {
        return [
          ...prevSessions.filter(
            (prevSession) => prevSession.id !== session.id,
          ),
        ]
      })
      if (isSelected) context.on_new_chat()
    } catch (e) {
      if (e.name == UNAUTHORIZED) return
      if (e.name == NOTFOUND) {
        context.on_new_chat()
        return
      }
      console.error(e)
      context.setSnack(config.errorMessage)
    }
  }

  useEffect(() => {
    fetchSession()
  }, [])

  return (
    <Box
      className="session-history"
      key={session.id}
      height={isDrawerOpen() ? 'auto' : 0}
      width={isDrawerOpen() ? drawerWidth - 35 : 0}
      onClick={async () => {
        await context.getSession({ sessionId: session.id })
        await navigate(`/${session.id}`)
        context.setSession(session.id)
        if (isMobile) setOpen(false)
      }}
      sx={{
        opacity: isDrawerOpen() ? '1' : '0',
        cursor: 'pointer',
        padding: '8px 8px 8px 12px',
        borderRadius: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: isDrawerOpen()
          ? isSelected
            ? theme.palette.background.history
            : undefined
          : undefined,
        '&:hover': {
          backgroundColor: isSelected
            ? theme.palette.background.history
            : theme.palette.background.cardHover,
          '.session-trash-button': {
            opacity: 1,
          },
        },
      }}
    >
      <Tooltip
        placement="right"
        title={title}
        slotProps={{
          popper: {
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [0, 24],
                },
              },
            ],
          },
        }}
      >
        <Typography
          sx={{ flexGrow: 1 }}
          color={isSelected ? theme.palette.text.selected : undefined}
          fontWeight={500}
          fontSize={'14px'}
          lineHeight={'20px'}
          variant="h6"
          noWrap
        >
          {title}
        </Typography>
      </Tooltip>
      <IconButton
        onClick={deleteSession}
        className="session-trash-button session-history"
        sx={{
          opacity: '0',
          padding: '4px',
          '&:hover': {
            background: isSelected
              ? theme.palette.background.default
              : undefined,
          },
        }}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    </Box>
  )
}
