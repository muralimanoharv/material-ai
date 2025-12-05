import { Box, IconButton, Typography, LinearProgress } from '@mui/material'
import { useContext } from 'react'
import {
  AppContext,
  LayoutContext,
  type AppContextType,
  type LayoutContextType,
} from '../../context'
import MenuIcon from '@mui/icons-material/Menu'
import { useAgentId, useMobileHook } from '../../hooks'
import SigninButton from '../SigninButton'
import UserAvatar from './UserAvatar'
import { useNavigate } from 'react-router'

export default function Header() {
  // We cast the context to our strict types
  const { loading, user, health, config, agents } = useContext(
    AppContext,
  ) as AppContextType
  const { setOpen } = useContext(LayoutContext) as LayoutContextType

  const navigate = useNavigate()

  const isMobile = useMobileHook()

  const agentId = useAgentId()

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0px 12px',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: '16px',
        }}
        mt={'12px'}
        mb={'10px'}
        padding={'6px 0px'}
      >
        {isMobile && (
          <IconButton
            onClick={() => {
              setOpen(true)
            }}
          >
            <MenuIcon fontSize="small" />
          </IconButton>
        )}
        <Box
          sx={{ cursor: 'pointer' }}
          title={health?.version}
          onClick={() => {
            navigate('/agents')
          }}
        >
          <Typography
            sx={{ userSelect: 'none' }}
            fontSize={'22px'}
            lineHeight={'26px'}
            variant="h4"
          >
            {config.title}
          </Typography>
        </Box>
      </Box>

      {agentId && (
        <Box>
          <Typography
            lineHeight={'26px'}
            fontSize={'16px'}
            sx={{ userSelect: 'none' }}
            variant="h4"
          >
            {agents.find((agent) => agent.id == agentId)?.name}
          </Typography>
        </Box>
      )}

      {user ? (
        <UserAvatar />
      ) : (
        <>
          {loading ? null : (
            <>
              {user ? (
                <UserAvatar />
              ) : (
                <Box>
                  <SigninButton borderRadius="4px" />
                </Box>
              )}
            </>
          )}
        </>
      )}

      {loading && (
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            bottom: -20,
            width: '100%',
          }}
        >
          <LinearProgress />
          <br />
        </Box>
      )}
    </Box>
  )
}
