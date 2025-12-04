import { Box, Typography, useTheme } from "@mui/material";
import { useContext } from "react";
import { AppContext, type AppContextType } from "../context";



function Greeting() {
    let { user, config, loading, history} = useContext(
    AppContext,
  ) as AppContextType
  const theme = useTheme()

    let showHeading = false

  if (!loading) {
    showHeading = !history.length
  }
  if(!showHeading) return null;
    return <Box
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
                color={
                  theme.palette.text.tagline || theme.palette.text.secondary
                }
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
}

export default Greeting