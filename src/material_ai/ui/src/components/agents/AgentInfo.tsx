import React, { useContext, useEffect, useState } from 'react'
import {
  Grid,
  Box,
  Typography,
  Button,
  Stack,
  Chip,
  Divider,
  useTheme,
  alpha,
  type Theme,
  Paper,
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  ChatBubbleOutline as ChatIcon,
  Business as EnterpriseIcon,
  SettingsSuggest as EngineIcon,
  AutoStories as CatalogIcon,
  FiberManualRecord as StatusIcon,
  Terminal as ModelIcon,
  DescriptionOutlined as DocIcon,
} from '@mui/icons-material'
import AccountTree from '@mui/icons-material/AccountTree'
import { useNavigate } from 'react-router'
import type { Agent } from '../../schema'
import { AppContext, type AppContextType } from '../../context'
import Markdown from 'react-markdown'
import AgentFlow from './AgentGraph'

interface AgentInfoPageProps {
  agent: Agent
}

/**
 * Agent Info Page - Professional Minimalist View with Documentation
 */
const AgentInfo: React.FC<AgentInfoPageProps> = ({ agent }) => {
  const context = useContext(AppContext) as AppContextType
  const theme: Theme = useTheme()
  const navigate = useNavigate()

  const [readme, setReadme] = useState('')

  useEffect(() => {
    const handleCustomChange = () => {
      context.apiService.get_agent_readme(agent.id).then((response) => {
        setReadme(response)
      })
    }

    window.addEventListener('i18n', handleCustomChange)
    return () => window.removeEventListener('i18n', handleCustomChange)
  }, [])

  useEffect(() => {
    context.apiService.get_agent_readme(agent.id).then((response) => {
      setReadme(response)
    })
  }, [])

  const isActive = agent.status.toLowerCase() === 'active'

  return (
    <Box
      sx={{
        flexGrow: 1,
        p: { xs: 3, md: 6 },
        maxWidth: '1000px',
        margin: '0 auto',
      }}
    >
      <Grid container spacing={4}>
        {/* Navigation Action */}
        <Grid size={{ xs: 12 }}>
          <Button
            onClick={() => {
              navigate('/agents')
            }}
            startIcon={<ArrowBackIcon />}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              color: theme.palette.text.secondary,
              px: 0,
              '&:hover': {
                backgroundColor: 'transparent',
                color: theme.palette.primary.main,
              },
            }}
          >
            {context.config.get().buttons.backToRegistry}
          </Button>
        </Grid>

        {/* Core Content Section */}
        <Grid size={{ xs: 12 }}>
          <Stack spacing={3}>
            {/* Identity Header */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Chip
                icon={<StatusIcon sx={{ fontSize: '10px !important' }} />}
                label={agent.status.toUpperCase()}
                size="small"
                sx={{
                  fontWeight: 800,
                  fontSize: '0.65rem',
                  bgcolor: isActive
                    ? alpha(theme.palette.success.main, 0.1)
                    : alpha(theme.palette.text.disabled, 0.1),
                  color: isActive
                    ? theme.palette.success.dark
                    : theme.palette.text.secondary,
                  borderRadius: 1.5,
                  border: 'none',
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  fontFamily: 'monospace',
                  color: theme.palette.text.disabled,
                  fontWeight: 700,
                }}
              >
                UUID: {agent.id}
              </Typography>
            </Stack>

            {/* Agent Name - Sized to 24px */}
            <Typography
              variant="h5"
              data-testid={`agents-page-info-${agent.id}-heading`}
              sx={{
                fontWeight: 800,
                color: theme.palette.text.primary,
                fontSize: '24px',
                letterSpacing: '-0.01em',
              }}
            >
              {context.config.getAgent(agent.id)?.title || agent.name}
            </Typography>

            {/* Description Body */}
            <Typography
              variant="body1"
              sx={{
                color: theme.palette.text.secondary,
                lineHeight: 1.7,
                maxWidth: '850px',
                fontSize: '1.05rem',
              }}
            >
              {agent.description}
            </Typography>

            {/* Technical Metadata */}
            <Box>
              <Typography
                variant="overline"
                sx={{
                  fontWeight: 800,
                  color: theme.palette.text.disabled,
                  display: 'block',
                  mb: 0.5,
                }}
              >
                {context.config.get().pages.agentsPage.agentModelCol}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <ModelIcon
                  sx={{ fontSize: 16, color: theme.palette.primary.main }}
                />
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 700, fontFamily: 'monospace' }}
                >
                  {agent.model}
                </Typography>
              </Stack>
            </Box>

            <Divider
              sx={{ my: 2, borderColor: alpha(theme.palette.divider, 0.1) }}
            />

            {/* Action Suite - Buttons Section */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 800,
                  mb: 3,
                  color: theme.palette.text.primary,
                }}
              >
                {context.config.get().pages.agentInfoPage.agentOperations}
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    data-testid={`agents-page-info-${agent.id}-chat-button`}
                    onClick={() => {
                      navigate(`/agents/${agent.id}`)
                    }}
                    disableElevation
                    startIcon={<ChatIcon />}
                    sx={{
                      py: 1.8,
                      borderRadius: 3,
                      textTransform: 'none',
                      fontWeight: 800,
                      fontSize: '1rem',
                      backgroundColor: theme.palette.primary.main,
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                      },
                    }}
                  >
                    {context.config.get().buttons.interactWithAgent}
                  </Button>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    disabled
                    startIcon={<EnterpriseIcon />}
                    sx={{
                      py: 1.5,
                      borderRadius: 3,
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '8px',
                      color: theme.palette.text.primary,
                      borderColor: theme.palette.divider,
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        backgroundColor: alpha(
                          theme.palette.primary.main,
                          0.02,
                        ),
                      },
                    }}
                  >
                    {context.config.get().buttons.deployToGeminiEnterprize}
                  </Button>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    disabled
                    startIcon={<EngineIcon />}
                    sx={{
                      py: 1.5,
                      borderRadius: 3,
                      fontSize: '8px',
                      textTransform: 'none',
                      fontWeight: 700,
                      color: theme.palette.text.primary,
                      borderColor: theme.palette.divider,
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        backgroundColor: alpha(
                          theme.palette.primary.main,
                          0.02,
                        ),
                      },
                    }}
                  >
                    {context.config.get().buttons.deployToAgentEngine}
                  </Button>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    disabled
                    startIcon={<CatalogIcon />}
                    sx={{
                      py: 1.5,
                      borderRadius: 3,
                      textTransform: 'none',
                      fontSize: '8px',
                      fontWeight: 700,
                      color: theme.palette.text.primary,
                      borderColor: theme.palette.divider,
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        backgroundColor: alpha(
                          theme.palette.primary.main,
                          0.02,
                        ),
                      },
                    }}
                  >
                    {context.config.get().buttons.deployToAgentCatalog}
                  </Button>
                </Grid>
              </Grid>
            </Box>

            <Divider
              sx={{ my: 4, borderColor: alpha(theme.palette.divider, 0.1) }}
            />

            {/* Documentation (Markdown Section) */}
            <Box>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 3 }}
              >
                <DocIcon sx={{ color: theme.palette.primary.main }} />
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 800, color: theme.palette.text.primary }}
                >
                  {context.config.get().pages.agentInfoPage.documentation}
                </Typography>
              </Stack>

              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 4,
                  //   bgcolor: alpha(theme.palette.action.hover, 0.4),
                  border: `1px solid ${theme.palette.divider}`,
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1fr)',
                  width: '100%',
                  overflowX: 'auto',
                }}
              >
                <Markdown>{readme}</Markdown>
              </Paper>
              <Divider
                sx={{ my: 4, borderColor: alpha(theme.palette.divider, 0.1) }}
              />
              <Box>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ mb: 3 }}
                >
                  <AccountTree sx={{ color: theme.palette.primary.main }} />
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 800, color: theme.palette.text.primary }}
                  >
                    {context.config.get().pages.agentInfoPage.trace}
                  </Typography>
                </Stack>

                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    border: `1px solid ${theme.palette.divider}`,
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr)',
                    width: '100%',
                    overflowX: 'auto',
                  }}
                >
                  <AgentFlow data={agent} events={[]} allowLiveMode={false} />
                </Paper>
              </Box>
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  )
}

export default AgentInfo
