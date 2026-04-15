import React, { useState } from 'react'

import MUI from '@mui/material'
import MUIIcons from '@mui/icons-material'

const {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  Avatar,
  IconButton,
  Tooltip,
  Paper,
  Zoom,
  Fade,
} = MUI

const {
  Search,
  SmartToy,
  AutoAwesome,
  SportsSoccer,
  Terminal,
  Architecture,
  WavingHand,
  Settings,
  Launch,
  Circle,
} = MUIIcons

const GoogleStyleAgents = (props) => {
  const AGENTS = props.agents
  const [search, setSearch] = useState('')
  const [activeConsole, setActiveConsole] = useState(null)

  const filteredAgents = AGENTS.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase()),
  )

  const handleLaunch = (agentId) => {
    setActiveConsole(agentId === activeConsole ? null : agentId)
  }

  return (
    <Box
      sx={{
        p: { xs: 2, md: 6 },
        bgcolor: '#F8F9FA',
        minHeight: '100vh',
        fontFamily: '"Google Sans", "Roboto", "Helvetica", "Arial", sans-serif',
      }}
    >
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography
          variant="h2"
          fontWeight="700"
          sx={{
            color: '#3C4043',
            letterSpacing: '-0.02em',
            mb: 2,
          }}
        >
          Agent
          <Box component="span" sx={{ color: '#4285F4' }}>
            Central
          </Box>
        </Typography>
        <Typography
          variant="h6"
          sx={{ color: '#70757A', mb: 5, fontWeight: 400 }}
        >
          The power of generative AI, organized for your business.
        </Typography>

        {/* Search Bar - Google Styled */}
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Paper
            elevation={0}
            sx={{
              p: '2px 4px',
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              maxWidth: 700,
              borderRadius: '30px',
              border: '1px solid #DADCE0',
              boxShadow: '0 1px 6px rgba(32,33,36,.28)',
              '&:hover': {
                boxShadow: '0 1px 8px rgba(32,33,36,.35)',
              },
            }}
          >
            <InputAdornment position="start" sx={{ ml: 2 }}>
              <Search sx={{ color: '#70757A' }} />
            </InputAdornment>
            <TextField
              fullWidth
              variant="standard"
              placeholder="Search specialized agents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{ disableUnderline: true }}
              sx={{ px: 2, py: 1 }}
            />
            <Tooltip title="Voice Search">
              <IconButton sx={{ p: '10px' }} color="primary">
                <SmartToy sx={{ color: '#4285F4' }} />
              </IconButton>
            </Tooltip>
          </Paper>
        </Box>
      </Box>

      {/* Agents List */}
      <Grid container spacing={4} justifyContent="center">
        {filteredAgents.map((agent) => (
          <Grid key={agent.id} size={{ xs: 12 }}>
            <Fade in timeout={500}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: '24px',
                  border: '1px solid #DADCE0',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    borderColor: agent.color,
                    bgcolor: `${agent.color}05`, // Very subtle tint
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Grid container spacing={3} alignItems="center">
                    <Grid size={{ xs: 12, md: 'auto' }}>
                      <Avatar
                        sx={{
                          width: 64,
                          height: 64,
                          bgcolor: `${agent.color}15`,
                          color: agent.color,
                          borderRadius: '16px',
                        }}
                      >
                        {agent.icon}
                      </Avatar>
                    </Grid>

                    <Grid size={{ xs: 12, md: 8 }}>
                      <Stack
                        direction="row"
                        spacing={2}
                        alignItems="center"
                        sx={{ mb: 1 }}
                      >
                        <Typography
                          variant="h5"
                          fontWeight="600"
                          sx={{ color: '#202124' }}
                        >
                          {agent.name}
                        </Typography>
                        <Chip
                          label={agent.status}
                          size="small"
                          sx={{
                            bgcolor: '#E6F4EA',
                            color: '#1E8E3E',
                            fontWeight: 'bold',
                            textTransform: 'capitalize',
                          }}
                        />
                      </Stack>
                      <Typography
                        variant="body1"
                        sx={{ color: '#5F6368', mb: 2, lineHeight: 1.6 }}
                      >
                        {agent.description}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Chip
                          label={agent.model}
                          variant="outlined"
                          size="small"
                          sx={{ borderRadius: '8px' }}
                        />
                        <Chip
                          label="API V2"
                          variant="outlined"
                          size="small"
                          sx={{ borderRadius: '8px' }}
                        />
                      </Stack>
                    </Grid>

                    <Grid
                      size={{ xs: 12, md: true }}
                      sx={{ display: 'flex', justifyContent: 'flex-end' }}
                    >
                      <Button
                        variant="contained"
                        disableElevation
                        onClick={() => handleLaunch(agent.id)}
                        startIcon={
                          activeConsole === agent.id ? <Terminal /> : <Launch />
                        }
                        sx={{
                          bgcolor: agent.color,
                          borderRadius: '20px',
                          px: 4,
                          py: 1,
                          textTransform: 'none',
                          fontSize: '1rem',
                          fontWeight: '500',
                          '&:hover': {
                            bgcolor: agent.color,
                            filter: 'brightness(0.9)',
                          },
                        }}
                      >
                        {activeConsole === agent.id
                          ? 'Close Console'
                          : 'Launch Agent'}
                      </Button>
                    </Grid>
                  </Grid>

                  {/* Playful Interactive Console Area */}
                  {activeConsole === agent.id && (
                    <Zoom in={activeConsole === agent.id}>
                      <Box
                        sx={{
                          mt: 4,
                          p: 3,
                          bgcolor: '#202124',
                          borderRadius: '16px',
                          color: '#FFF',
                          fontFamily: 'monospace',
                          position: 'relative',
                          display: 'grid',
                          gridTemplateColumns: 'minmax(0, 1fr)',
                          width: '100%',
                          overflowX: 'auto',
                        }}
                      >
                        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                          <Circle sx={{ fontSize: 12, color: '#EA4335' }} />
                          <Circle sx={{ fontSize: 12, color: '#FBBC05' }} />
                          <Circle sx={{ fontSize: 12, color: '#34A853' }} />
                        </Stack>
                        <Typography variant="body2" sx={{ color: agent.color }}>
                          {`[system@${agent.id}]: Initializing ${agent.name}...`}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          {`> Loading dependencies for ${agent.model}...`}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          {`> Handshake successful. Waiting for commands.`}
                        </Typography>
                        <Box
                          sx={{ mt: 2, display: 'flex', alignItems: 'center' }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ color: '#34A853', mr: 1 }}
                          >
                            $
                          </Typography>
                          <Box
                            component="span"
                            sx={{
                              width: 10,
                              height: 20,
                              bgcolor: '#FFF',
                              display: 'inline-block',
                              animation: 'blink 1s infinite',
                            }}
                          />
                        </Box>

                        <style>{`
                          @keyframes blink {
                            0% { opacity: 1; }
                            50% { opacity: 0; }
                            100% { opacity: 1; }
                          }
                        `}</style>
                      </Box>
                    </Zoom>
                  )}
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>

      {/* Action Footer */}
      <Box
        sx={{
          mt: 10,
          py: 6,
          borderTop: '1px solid #DADCE0',
          textAlign: 'center',
        }}
      >
        <Grid container justifyContent="center" spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" sx={{ color: '#3C4043', mb: 3 }}>
              Ready to scale your AI workforce?
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="outlined"
                sx={{
                  borderRadius: '20px',
                  color: '#5F6368',
                  borderColor: '#DADCE0',
                  textTransform: 'none',
                }}
              >
                Request Custom Agent
              </Button>
              <IconButton sx={{ bgcolor: '#FFF', border: '1px solid #DADCE0' }}>
                <Settings />
              </IconButton>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

export default GoogleStyleAgents
