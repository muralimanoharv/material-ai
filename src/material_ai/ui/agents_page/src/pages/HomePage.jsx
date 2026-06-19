import React from 'react'
import { Link } from 'react-router'
import MUI from '@mui/material'
import MUIIcons from '@mui/icons-material'

const { Fade, Box, Typography, Grid, Card, CardActionArea } = MUI
const { ChatBubbleOutline, Business, HelpOutline, HealthAndSafety } = MUIIcons

export default function HomePage() {
  return (
    <Fade in>
      <Box sx={{ p: { xs: 2, md: 0 }, maxWidth: 1200, margin: '0 auto' }}>
        <Typography
          variant="h3"
          fontWeight="700"
          align="center"
          gutterBottom
          color="text.primary"
        >
          Welcome to AgentHub
        </Typography>
        <Typography variant="h6" color="text.secondary" align="center" mb={6}>
          Select a module below to get started.
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={6}>
            <Card
              variant="outlined"
              sx={{ height: '100%', borderRadius: '16px' }}
            >
              <CardActionArea
                component={Link}
                to="/agents/prompts"
                sx={{ height: '100%', p: 3 }}
              >
                <ChatBubbleOutline
                  sx={{ fontSize: 40, color: '#4285F4', mb: 2 }}
                />
                <Typography
                  variant="h5"
                  fontWeight="600"
                  gutterBottom
                  color="text.primary"
                >
                  Prompt Library
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Access sample queries and kickstart your research tasks.
                </Typography>
              </CardActionArea>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card
              variant="outlined"
              sx={{ height: '100%', borderRadius: '16px' }}
            >
              <CardActionArea
                component={Link}
                to="/agents/company"
                sx={{ height: '100%', p: 3 }}
              >
                <Business sx={{ fontSize: 40, color: '#0F9D58', mb: 2 }} />
                <Typography
                  variant="h5"
                  fontWeight="600"
                  gutterBottom
                  color="text.primary"
                >
                  Company & Agents
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Learn about our mission and browse active AI models.
                </Typography>
              </CardActionArea>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card
              variant="outlined"
              sx={{ height: '100%', borderRadius: '16px' }}
            >
              <CardActionArea
                component={Link}
                to="/agents/help"
                sx={{ height: '100%', p: 3 }}
              >
                <HelpOutline sx={{ fontSize: 40, color: '#E53935', mb: 2 }} />
                <Typography
                  variant="h5"
                  fontWeight="600"
                  gutterBottom
                  color="text.primary"
                >
                  Support Center
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Get help with tool configurations and engineering support.
                </Typography>
              </CardActionArea>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card
              variant="outlined"
              sx={{ height: '100%', borderRadius: '16px' }}
            >
              <CardActionArea
                component={Link}
                to="/agents/health"
                sx={{ height: '100%', p: 3 }}
              >
                <HealthAndSafety
                  sx={{ fontSize: 40, color: '#F4B400', mb: 2 }}
                />
                <Typography
                  variant="h5"
                  fontWeight="600"
                  gutterBottom
                  color="text.primary"
                >
                  System Health
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Monitor server uptime, memory usage, and compute resources.
                </Typography>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Fade>
  )
}
