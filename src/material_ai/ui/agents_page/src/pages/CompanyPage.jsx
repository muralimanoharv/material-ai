import React from 'react'
import MUI from '@mui/material'
import MUIIcons from '@mui/icons-material'

const {
  Fade,
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Stack,
  Chip,
  Divider,
  Tooltip,
} = MUI
const { Business, BuildCircle, AccountTree } = MUIIcons

export default function CompanyPage({ agents = [] }) {
  return (
    <Fade in>
      <Box sx={{ p: { xs: 2, md: 0 }, maxWidth: 1200, margin: '0 auto' }}>
        <Card variant="outlined" sx={{ borderRadius: '16px', p: 4, mb: 6 }}>
          <Typography variant="h4" fontWeight="600" mb={2} color="text.primary">
            <Business
              sx={{ mr: 1, verticalAlign: 'bottom', color: '#0F9D58' }}
            />{' '}
            About Us
          </Typography>
          <Typography variant="body1" paragraph color="text.primary">
            We are pioneering the integration of Generative AI into specific
            workflows. Our multi-agent frameworks are designed to securely
            handle complex chaining, user interface generation, and data
            synthesis.
          </Typography>
        </Card>

        <Typography variant="h5" fontWeight="700" mb={3} color="text.primary">
          Active Agents ({agents.length})
        </Typography>

        <Grid container spacing={3} alignItems="stretch">
          {agents.map((agent) => (
            <Grid item xs={12} md={6} key={agent.id} sx={{ display: 'flex' }}>
              <Card
                variant="outlined"
                sx={{
                  width: '100%',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <CardContent sx={{ flexGrow: 1, overflow: 'hidden' }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    mb={2}
                    gap={2}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="h6"
                        fontWeight="600"
                        color="text.primary"
                        noWrap
                      >
                        {agent.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontFamily: 'monospace' }}
                      >
                        {agent.model}
                      </Typography>
                    </Box>
                    <Chip
                      label={agent.status}
                      size="small"
                      color={agent.status === 'active' ? 'success' : 'default'}
                      variant="outlined"
                      sx={{ flexShrink: 0 }}
                    />
                  </Stack>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    mb={3}
                    sx={{ wordBreak: 'break-word', whiteSpace: 'pre-line' }}
                  >
                    {agent.description?.trim() || 'No description provided.'}
                  </Typography>
                </CardContent>
                <Divider />
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'action.hover',
                    display: 'flex',
                    gap: 2,
                  }}
                >
                  <Tooltip title="Available Tools">
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={0.5}
                      color="text.secondary"
                    >
                      <BuildCircle fontSize="small" />
                      <Typography variant="caption" fontWeight="600">
                        {agent.tools?.length || 0}
                      </Typography>
                    </Stack>
                  </Tooltip>
                  <Tooltip title="Sub-Agents">
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={0.5}
                      color="text.secondary"
                    >
                      <AccountTree fontSize="small" />
                      <Typography variant="caption" fontWeight="600">
                        {agent.sub_agents?.length || 0}
                      </Typography>
                    </Stack>
                  </Tooltip>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Fade>
  )
}
