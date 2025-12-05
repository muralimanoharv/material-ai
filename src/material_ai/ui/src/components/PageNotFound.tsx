import { useNavigate } from 'react-router'
import {
  Box,
  Typography,
  Button,
  Stack,
  useTheme,
  Container,
} from '@mui/material'
import {
  SearchOff as SearchOffIcon,
  Home as HomeIcon,
} from '@mui/icons-material'

const PageNotFound = ({
  title = 'Page Not Found',
  message = 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.',
  buttonLabel = 'Back to Home',
  redirectPath = '/agents',
}) => {
  const theme = useTheme()
  const navigate = useNavigate()

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          py: 4,
        }}
      >
        <Stack spacing={3} alignItems="center">
          <Box
            sx={{
              bgcolor: theme.palette.background.paper,
              borderRadius: '50%',
              p: 4,
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px dashed ${theme.palette.divider}`,
              boxShadow: theme.shadows[1],
            }}
          >
            <SearchOffIcon
              sx={{
                fontSize: 80,
                color: theme.palette.text.tertiary,
                opacity: 0.6,
              }}
            />
          </Box>

          <Typography variant="h3" fontWeight={700} color="text.primary">
            {title}
          </Typography>

          <Typography
            variant="h6"
            fontWeight={400}
            color="text.secondary"
            sx={{ maxWidth: 600, lineHeight: 1.6 }}
          >
            {message}
          </Typography>

          <Box sx={{ pt: 3 }}>
            <Button
              size="large"
              startIcon={<HomeIcon />}
              onClick={() => navigate(redirectPath)}
              sx={{
                borderRadius: '50px',
                px: 5,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '1rem',
                boxShadow: theme.shadows[4],
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  boxShadow: theme.shadows[10],
                  transform: 'translateY(-3px)',
                },
              }}
            >
              {buttonLabel}
            </Button>
          </Box>
        </Stack>
      </Box>
    </Container>
  )
}

export default PageNotFound
