import { useMemo } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  Stack,
  alpha,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import { InfoOutlined as InfoIcon } from '@mui/icons-material'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import type { Health } from '../schema'

ChartJS.register(ArcElement, Tooltip, Legend)

const HealthDashboard = ({ data }: { data: Health }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const memoryChartData = useMemo(() => {
    if (!data) return null
    return {
      labels: ['Used', 'Available'],
      datasets: [
        {
          data: [
            data.system.memory.percent_used,
            100 - data.system.memory.percent_used,
          ],
          backgroundColor: [
            theme.palette.primary.main,
            theme.palette.background.history,
          ],
          borderWidth: 0,
          circumference: 180,
          rotation: 270,
          cutout: '80%',
          borderRadius: 10,
        },
      ],
    }
  }, [data, theme])

  if (!data) return null
  const { system, appName, version, uptime } = data

  const cardStyle = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    bgcolor: theme.palette.background.paper,
    borderRadius: 4,
    boxShadow: 'none',
    overflow: 'hidden', // Prevents internal chart overflow
    transition: 'background-color 0.2s ease-in-out',
    '&:hover': { bgcolor: theme.palette.background.cardHover },
  }

  return (
    <Box
      sx={{
        p: 0, // Removed initial box padding
        width: '100%',
        overflowX: 'hidden', // Forces no horizontal scroll on the root
        bgcolor: theme.palette.background.default,
        minHeight: '100vh',
      }}
    >
      {/* Container for content with responsive margins */}
      <Box sx={{ p: isMobile ? 2 : 4 }}>
        <Grid container spacing={isMobile ? 2 : 3} alignItems="stretch">
          {/* Card 1: System Info */}
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card sx={cardStyle}>
              <CardContent>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ mb: 2 }}
                >
                  <InfoIcon
                    sx={{ fontSize: 18, color: theme.palette.text.tertiary }}
                  />
                  <Typography
                    variant="overline"
                    sx={{
                      color: theme.palette.text.tertiary,
                      fontWeight: 'bold',
                    }}
                  >
                    System Instance
                  </Typography>
                </Stack>
                <Typography
                  variant={isMobile ? 'h6' : 'h5'}
                  sx={{ color: theme.palette.text.h5, fontWeight: 600, mb: 1 }}
                >
                  {appName}
                </Typography>
                <Stack
                  direction={isMobile ? 'row' : 'column'}
                  spacing={isMobile ? 3 : 1}
                >
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ color: theme.palette.text.tagline }}
                    >
                      Version
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip
                        label={version}
                        size="small"
                        sx={{
                          bgcolor: theme.palette.background.history,
                          color: theme.palette.text.selected,
                          fontWeight: 'bold',
                        }}
                      />
                    </Box>
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ color: theme.palette.text.tagline }}
                    >
                      Uptime
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.text.primary,
                        fontWeight: 500,
                      }}
                    >
                      {uptime.split('.')[0]}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Card 2: CPU Load */}
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card sx={cardStyle}>
              <CardContent>
                <Typography
                  variant="overline"
                  sx={{
                    color: theme.palette.text.tertiary,
                    fontWeight: 'bold',
                  }}
                >
                  Compute Load
                </Typography>
                <Typography
                  variant={isMobile ? 'h4' : 'h3'}
                  sx={{
                    color: theme.palette.text.primary,
                    my: 1,
                    fontWeight: 500,
                  }}
                >
                  {system.cpu_percent_used}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={system.cpu_percent_used}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 5,
                      bgcolor: theme.palette.primary.main,
                    },
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Card 3: Memory Allocation */}
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card sx={cardStyle}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography
                  variant="overline"
                  sx={{
                    color: theme.palette.text.tertiary,
                    fontWeight: 'bold',
                    display: 'block',
                    textAlign: 'left',
                    mb: 2,
                  }}
                >
                  Memory Allocation
                </Typography>
                {/* Fixed Height Wrapper to prevent ChartJS layout shifts */}
                <Box
                  sx={{
                    height: 100,
                    width: '100%',
                    position: 'relative',
                    mb: 1,
                  }}
                >
                  {memoryChartData && (
                    <Doughnut
                      data={memoryChartData}
                      options={{
                        maintainAspectRatio: false,
                        responsive: true,
                        plugins: { legend: { display: false } },
                      }}
                    />
                  )}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: theme.palette.text.primary,
                        fontWeight: 600,
                      }}
                    >
                      {system.memory.percent_used}%
                    </Typography>
                  </Box>
                </Box>
                <Typography
                  variant="caption"
                  sx={{ color: theme.palette.text.tertiary }}
                >
                  {system.memory.available} free of {system.memory.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Card 4: Storage */}
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card sx={cardStyle}>
              <CardContent>
                <Typography
                  variant="overline"
                  sx={{
                    color: theme.palette.text.tertiary,
                    fontWeight: 'bold',
                  }}
                >
                  Storage
                </Typography>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-end"
                  sx={{ my: 1 }}
                >
                  <Typography
                    variant={isMobile ? 'h5' : 'h4'}
                    sx={{ color: theme.palette.text.primary, fontWeight: 500 }}
                  >
                    {system.disk.percent_used}%
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: theme.palette.text.secondary, mb: 0.5 }}
                  >
                    {system.disk.used} used
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={system.disk.percent_used}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    bgcolor: alpha('#34a853', 0.1),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 5,
                      bgcolor: '#34a853',
                    },
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

export default HealthDashboard
