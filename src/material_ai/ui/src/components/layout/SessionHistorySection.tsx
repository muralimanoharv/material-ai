import { useContext, type MouseEvent } from 'react'
import { AppContext, LayoutContext } from '../../context'
import { Box, IconButton, Typography, useTheme, Tooltip } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { drawerWidth } from '../material/MaterialDrawer'
import { useNavigate } from 'react-router'
import { useAgentId, useMobileHook } from '../../hooks'
import { type Session } from '../../schema'
import { type AppContextType, type LayoutContextType } from '../../context'
import { useSessionId } from '../../hooks'

interface SessionItemProps {
  session: Session
}

export default function SessionHistorySection() {
  const context = useContext(AppContext) as AppContextType
  const { isDrawerOpen } = useContext(LayoutContext) as LayoutContextType

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
        {context.user
          ? context.sessions.map((session) => (
              <SessionItem key={session.id} session={session} />
            ))
          : null}
      </Box>
    </>
  )
}

function SessionItem({ session }: SessionItemProps) {
  const context = useContext(AppContext) as AppContextType
  const { config, apiService } = context

  const theme = useTheme()
  const navigate = useNavigate()
  const { isDrawerOpen, setOpen } = useContext(
    LayoutContext,
  ) as LayoutContextType
  const isMobile = useMobileHook()

  const session_id = useSessionId()
  const agent = useAgentId()

  const isSelected = session_id === session.id

  const deleteSession = async (e: MouseEvent) => {
    e?.stopPropagation()
    try {
      await apiService.delete_session(agent, session.id)

      context.setSessions((prevSessions) => {
        return [
          ...prevSessions.filter(
            (prevSession) => prevSession.id !== session.id,
          ),
        ]
      })
      if (isSelected) context.on_new_chat(agent)
    } catch (e: unknown) {
      console.error(e)
      context.setSnack(config?.errorMessage || 'Error deleting session')
    }
  }

  const truncText = (text: string) => {
    const maxLength = 30
    if (text.length > maxLength) return `${text.substring(0, maxLength)}...`
    return text
  }

  const formatTimestamp = (unixTimestamp: string | number) => {
    const date = new Date(unixTimestamp)

    const datePart = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })

    const timePart = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })

    return `${datePart} at ${timePart}`
  }

  // Type-safe access to custom theme properties
  const historyBg = theme.palette.background.history
  const cardHoverBg = theme.palette.background.cardHover
  const selectedText = theme.palette.text.selected

  return (
    <Box
      className="session-history"
      // height={isDrawerOpen() ? 'auto' : 0}
      width={isDrawerOpen() ? drawerWidth - 35 : 0}
      onClick={async () => {
        await navigate(`/agents/${session.app_name}/session/${session.id}`)
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
            ? historyBg
            : undefined
          : undefined,
        '&:hover': {
          backgroundColor: isSelected ? historyBg : cardHoverBg,
          '.session-trash-button': {
            opacity: 1,
          },
        },
      }}
    >
      {isDrawerOpen() ? (
        <Box sx={{ flexGrow: 1 }}>
          <Tooltip
            placement="right"
            title={session.title}
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
            <>
              <Typography
                sx={{ flexGrow: 1 }}
                color={isSelected ? selectedText : undefined}
                fontWeight={500}
                fontSize={'14px'}
                lineHeight={'20px'}
                variant="h6"
              >
                {truncText(session.title!)}
              </Typography>
              <Typography
                sx={{ flexGrow: 1 }}
                color={isSelected ? selectedText : undefined}
                fontWeight={300}
                fontSize={'10px'}
                lineHeight={'20px'}
                variant="h5"
                noWrap
              >
                {formatTimestamp(session.last_update_time)}
              </Typography>
            </>
          </Tooltip>
        </Box>
      ) : null}

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
