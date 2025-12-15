import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Avatar,
  useTheme,
  CardActionArea,
} from '@mui/material'
import {
  SmartToy as BotIcon,
  Circle as StatusIcon,
  AutoAwesome as SparkleIcon,
} from '@mui/icons-material'
import type { Agent } from '../schema'
import { formatModelName } from '../utils'
import { useNavigate } from 'react-router'

const AgentList = ({ agents }: { agents: Agent[] }) => {
  const theme = useTheme()
  const navigate = useNavigate()

  return (
    <Box sx={{ p: 3, bgcolor: theme.palette.background.default }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
        <SparkleIcon sx={{ color: theme.palette.primary.main }} />
        <Typography
          variant="h5"
          sx={{ color: theme.palette.text.h5, fontWeight: 600 }}
          data-testid="agents-page-header"
        >
          Agents
        </Typography>
      </Stack>

      <Grid container spacing={3}>
        {agents.map((agent) => (
          <Grid key={agent.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                borderRadius: 4,
                bgcolor: theme.palette.background.card,
                transition: 'all 0.2s ease-in-out',
                cursor: 'pointer',
                border: '1px solid transparent',
                '&:hover': {
                  bgcolor: theme.palette.background.cardHover,
                },
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <CardActionArea
                onClick={() => {
                  navigate(`/agents/${agent.id}`)
                }}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'stretch',
                }}
              >
                <CardContent
                  sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '100%',
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                  >
                    <Avatar
                      sx={{
                        bgcolor:
                          agent.status === 'active'
                            ? theme.palette.background.history
                            : theme.palette.background.paper,
                        color:
                          agent.status === 'active'
                            ? theme.palette.text.selected
                            : theme.palette.text.tertiary,
                      }}
                    >
                      <BotIcon />
                    </Avatar>
                  </Stack>
                  <Box sx={{ mt: 2, flexGrow: 1 }}>
                    <Typography
                      data-testid={`agents-page-card-${agent.id}-heading`}
                      variant="h6"
                      sx={{
                        color: theme.palette.text.primary,
                        fontWeight: 'bold',
                      }}
                    >
                      {agent.name}
                    </Typography>
                    <Typography
                      data-testid={`agents-page-card-${agent.id}-description`}
                      variant="body2"
                      sx={{
                        mt: 1,
                        color: theme.palette.text.tertiary,
                        display: '-webkit-box',
                        overflow: 'hidden',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 4,
                      }}
                    >
                      {agent.description}
                    </Typography>
                  </Box>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mt: 3 }}
                  >
                    <Chip
                      data-testid={`agents-page-card-${agent.id}-model`}
                      label={formatModelName(agent.model)}
                      size="small"
                      sx={{
                        fontSize: '0.7rem',
                        bgcolor: theme.palette.background.default,
                        color: theme.palette.text.secondary,
                        border: `1px solid ${theme.palette.background.cardHover}`,
                      }}
                    />

                    <Stack direction="row" alignItems="center" spacing={1}>
                      <StatusIcon
                        sx={{
                          fontSize: 10,
                          color:
                            agent.status === 'active'
                              ? theme.palette.primary.main
                              : theme.palette.text.tagline,
                        }}
                      />
                      <Typography
                        variant="caption"
                        data-testid={`agents-page-card-${agent.id}-status`}
                        sx={{
                          color:
                            agent.status === 'active'
                              ? theme.palette.text.selected
                              : theme.palette.text.tagline,
                          fontWeight: 500,
                        }}
                      >
                        {agent.status === 'active' ? 'Active' : 'Idle'}
                      </Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default AgentList
