import React from 'react'
import MUI from '@mui/material'
import MUIIcons from '@mui/icons-material'

const {
  Fade,
  Box,
  Typography,
  Stack,
  Chip,
  Card,
  Divider,
  Grid,
  LinearProgress,
} = MUI
const { HealthAndSafety, Speed, Memory, Storage } = MUIIcons

export default function HealthPage({ health }) {
  if (!health) {
    return (
      <Box sx={{ textAlign: 'center', mt: 10 }}>
        <Typography variant="h6" color="text.secondary">
          Health data is currently unavailable.
        </Typography>
      </Box>
    )
  }

  return (
    <Fade in>
      <Box sx={{ p: { xs: 2, md: 0 }, maxWidth: 1200, margin: '0 auto' }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={4}
        >
          <Typography variant="h4" fontWeight="600" color="text.primary">
            <HealthAndSafety
              sx={{ mr: 1, verticalAlign: 'bottom', color: '#F4B400' }}
            />{' '}
            System Diagnostics
          </Typography>
          <Chip
            label={health.status === 'ok' ? 'System Operational' : 'Degraded'}
            color={health.status === 'ok' ? 'success' : 'error'}
            variant="filled"
          />
        </Stack>

        <Card
          variant="outlined"
          sx={{
            borderRadius: '16px',
            mb: 4,
            p: 3,
            bgcolor: 'background.default',
          }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={4}
            divider={<Divider orientation="vertical" flexItem />}
          >
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                textTransform="uppercase"
              >
                App Name
              </Typography>
              <Typography
                variant="body1"
                fontWeight="600"
                color="text.primary"
                sx={{ fontFamily: 'monospace' }}
              >
                {health.appName}
              </Typography>
            </Box>
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                textTransform="uppercase"
              >
                Version
              </Typography>
              <Typography
                variant="body1"
                fontWeight="600"
                color="text.primary"
                sx={{ fontFamily: 'monospace' }}
              >
                v{health.version}
              </Typography>
            </Box>
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                textTransform="uppercase"
              >
                Uptime
              </Typography>
              <Typography
                variant="body1"
                fontWeight="600"
                color="text.primary"
                sx={{ fontFamily: 'monospace' }}
              >
                {health.uptime}
              </Typography>
            </Box>
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                textTransform="uppercase"
              >
                Environment
              </Typography>
              <Chip
                label={health.debug ? 'Debug Mode' : 'Production'}
                size="small"
                color={health.debug ? 'warning' : 'primary'}
                sx={{ mt: 0.5 }}
              />
            </Box>
          </Stack>
        </Card>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card
              variant="outlined"
              sx={{ borderRadius: '12px', height: '100%', p: 3 }}
            >
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <Speed color="primary" />
                <Typography variant="h6" fontWeight="600" color="text.primary">
                  Compute (CPU)
                </Typography>
              </Stack>
              <Typography
                variant="h3"
                fontWeight="700"
                color="text.primary"
                mb={1}
              >
                {health.system.cpu_percent_used}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={health.system.cpu_percent_used}
                sx={{ height: 8, borderRadius: 4, mb: 2 }}
                color={
                  health.system.cpu_percent_used > 80 ? 'error' : 'primary'
                }
              />
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card
              variant="outlined"
              sx={{ borderRadius: '12px', height: '100%', p: 3 }}
            >
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <Memory color="primary" />
                <Typography variant="h6" fontWeight="600" color="text.primary">
                  Memory (RAM)
                </Typography>
              </Stack>
              <Typography
                variant="h3"
                fontWeight="700"
                color="text.primary"
                mb={1}
              >
                {health.system.memory.percent_used}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={health.system.memory.percent_used}
                sx={{ height: 8, borderRadius: 4, mb: 2 }}
                color={
                  health.system.memory.percent_used > 80 ? 'error' : 'primary'
                }
              />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Available: {health.system.memory.available}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total: {health.system.memory.total}
                </Typography>
              </Stack>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card
              variant="outlined"
              sx={{ borderRadius: '12px', height: '100%', p: 3 }}
            >
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <Storage color="primary" />
                <Typography variant="h6" fontWeight="600" color="text.primary">
                  Storage
                </Typography>
              </Stack>
              <Typography
                variant="h3"
                fontWeight="700"
                color="text.primary"
                mb={1}
              >
                {health.system.disk.percent_used}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={health.system.disk.percent_used}
                sx={{ height: 8, borderRadius: 4, mb: 2 }}
                color={
                  health.system.disk.percent_used > 80 ? 'error' : 'primary'
                }
              />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Free: {health.system.disk.free}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total: {health.system.disk.total}
                </Typography>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Fade>
  )
}
