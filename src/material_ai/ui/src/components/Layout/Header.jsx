import {
  Avatar,
  Box,
  IconButton,
  ListItemAvatar,
  Typography,
} from '@mui/material'
import LinearProgress from '@mui/material/LinearProgress'
import { useContext } from 'react'
import { AppContext, LayoutContext } from '../../context'
import MenuIcon from '@mui/icons-material/Menu'
import { useMobileHook } from '../../hooks'
import SigninButton from '../SigninButton'
import UserAvatar from './UserAvatar'

export default function Header() {
  const { loading, on_new_chat, user, health, config } = useContext(AppContext)
  const { setOpen } = useContext(LayoutContext)
  const isMobile = useMobileHook()
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
            on_new_chat()
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
