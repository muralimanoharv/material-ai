import ChatSection from '../Chat/ChatSection'
import { useContext } from 'react'
import { AppContext } from '../../context'
import { Box, Typography, useTheme } from '@mui/material'
import { config } from '../../assets/config'

export default function ChatPage() {
  const { user, showHeading } = useContext(AppContext)
  const theme = useTheme()

  return (
    <>
      {showHeading && (
        <Box
          sx={{
            height: '50vh',
            gap: '10px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
          }}
        >
          {user ? (
            <>
              <Typography
                className="animated-text"
                variant="h1"
                sx={{
                  backgroundImage:
                    'linear-gradient(90deg, #3186ff 0, #346bf1 50%, #4fa0ff 100%)',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                Hello, {user?.given_name}
              </Typography>
              <Typography
                textAlign="center"
                color={theme.palette.text.tagline}
                fontWeight={400}
                variant="h1"
                className="tagline-text"
              >
                {config.greeting}
              </Typography>
            </>
          ) : (
            <>
              <Typography
                className="animated-text"
                variant="h1"
                fontWeight={500}
                fontSize={'45px'}
                sx={{
                  color: theme.palette.text.primary,
                }}
              >
                Meet {config.title},
              </Typography>
              <Typography
                textAlign="center"
                color={theme.palette.text.primary}
                fontWeight={500}
                fontSize={'45px'}
                variant="h1"
                className="tagline-text"
              >
                your personal AI assistant
              </Typography>
            </>
          )}
        </Box>
      )}
      <ChatSection />
    </>
  )
}
