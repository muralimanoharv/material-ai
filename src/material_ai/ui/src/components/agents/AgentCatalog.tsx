import React, { useState, useMemo } from 'react'
import {
  Grid,
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Stack,
  InputBase,
  useTheme,
  alpha,
  Chip,
  Fade,
  type Theme,
} from '@mui/material'
import {
  Search as SearchIcon,
  GridView as GridViewIcon,
  TableRows as TableRowsIcon,
  SmartToy as RobotIcon,
  Clear as ClearIcon,
  VerifiedUser as VerifiedIcon,
  FiberManualRecord as StatusIcon,
  Terminal as TerminalIcon,
} from '@mui/icons-material'
import type { Agent } from '../../schema'
import { useNavigate } from 'react-router'

interface AgentCatalogProps {
  agents?: Agent[]
}

// Unified Terminology Constants
const TERMS = {
  IDENTITY: 'Agent Identity',
  DESCRIPTION: 'Description',
  ENGINE: 'Model',
  STATUS: 'Status',
}

/**
 * Animated Counter Component for Total Agent Count
 */
const AnimatedCounter: React.FC<{ target: number }> = ({ target }) => {
  const theme: Theme = useTheme()

  return (
    <Box
      sx={{
        textAlign: 'center',
        p: 2,
        borderRadius: 4,
        bgcolor: alpha(theme.palette.primary.main, 0.04),
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        minWidth: 120,
      }}
    >
      <Typography
        variant="h3"
        sx={{
          fontWeight: 900,
          color: theme.palette.primary.main,
          lineHeight: 1,
        }}
      >
        {target}
      </Typography>
      <Typography
        variant="overline"
        sx={{
          fontWeight: 800,
          color: theme.palette.text.secondary,
          display: 'block',
        }}
      >
        Agents
      </Typography>
    </Box>
  )
}

const AgentCatalog: React.FC<AgentCatalogProps> = ({ agents = [] }) => {
  const theme: Theme = useTheme()
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table')
  const navigate = useNavigate()

  const filteredAgents = useMemo(() => {
    return agents.filter(
      (agent) =>
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [searchTerm, agents])

  const handleAgentClick = (agent: Agent) => {
    navigate(`/agents/info/${agent.id}`)
  }

  const StatusBadge: React.FC<{ status: string; id: string; type: string }> = ({
    status,
    id,
    type,
  }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <StatusIcon
        sx={{
          fontSize: 10,
          color:
            status === 'active'
              ? theme.palette.success.main
              : theme.palette.text.disabled,
        }}
      />
      <Typography
        data-testid={`agents-page-${type}-${id}-status`}
        variant="body2"
        sx={{
          fontWeight: 700,
          color:
            status === 'active'
              ? theme.palette.success.dark
              : theme.palette.text.secondary,
          fontSize: '0.8rem',
          textTransform: 'uppercase',
        }}
      >
        {status}
      </Typography>
    </Box>
  )

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 2, md: 5 } }}>
      <Grid container spacing={3}>
        {/* Header Section */}
        <Grid size={{ xs: 12 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              mb: 1,
            }}
          >
            <Box>
              <Typography
                variant="h3"
                data-testid="agents-page-header"
                sx={{
                  fontWeight: 900,
                  letterSpacing: '-0.04em',
                  color: theme.palette.text.primary,
                }}
              >
                Agent Catalog
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mt: 1 }}
              >
                <VerifiedIcon
                  sx={{ color: theme.palette.primary.main, fontSize: 18 }}
                />
                <Typography
                  variant="body1"
                  sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}
                >
                  Agent Registry Dashboard
                </Typography>
              </Stack>
            </Box>
            <AnimatedCounter target={agents.length} />
          </Box>
          <Divider
            sx={{ mb: 4, borderColor: alpha(theme.palette.divider, 0.1) }}
          />
        </Grid>

        {/* Search & Layout Control */}
        <Grid size={{ xs: 12 }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            alignItems="center"
          >
            <Paper
              elevation={0}
              sx={{
                flexGrow: 1,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                px: 2.5,
                py: 0.75,
                borderRadius: '14px',
                border: `1.5px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.paper,
                transition: 'all 0.2s ease',
                '&:focus-within': {
                  borderColor: theme.palette.primary.main,
                  boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}`,
                },
              }}
            >
              <SearchIcon sx={{ color: theme.palette.primary.main, mr: 1.5 }} />
              <InputBase
                fullWidth
                placeholder="Search registry by identity, description, or model engine..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchTerm(e.target.value)
                }
                sx={{ fontSize: '1rem', fontWeight: 500 }}
              />
              {searchTerm && (
                <IconButton size="small" onClick={() => setSearchTerm('')}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              )}
            </Paper>

            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_e, v) => v && setViewMode(v)}
              size="small"
              sx={{
                bgcolor: alpha(theme.palette.action.selected, 0.05),
                p: 0.5,
                borderRadius: '14px',
                border: `1px solid ${theme.palette.divider}`,
                '& .MuiToggleButton-root': {
                  border: 'none',
                  borderRadius: '10px',
                  px: 2.5,
                  color: theme.palette.text.secondary,
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.background.paper,
                    color: theme.palette.primary.main,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    '&:hover': {
                      backgroundColor: theme.palette.background.paper,
                    },
                  },
                },
              }}
            >
              <ToggleButton value="grid">
                <GridViewIcon fontSize="small" data-testid="agents-grid-view" />
              </ToggleButton>
              <ToggleButton value="table">
                <TableRowsIcon
                  fontSize="small"
                  data-testid="agents-table-view"
                />
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Grid>

        {/* Unified Display View */}
        <Grid size={{ xs: 12 }}>
          {viewMode === 'grid' ? (
            <Fade in={true} timeout={500}>
              <Grid container spacing={3}>
                {filteredAgents.map((agent) => (
                  <Grid key={agent.id} size={{ xs: 12, md: 6, lg: 4 }}>
                    <Card
                      onClick={() => handleAgentClick(agent)}
                      data-testid={`agents-page-card-${agent.id}`}
                      sx={{
                        height: '100%',
                        borderRadius: 5,
                        cursor: 'pointer',
                        border: `1px solid ${theme.palette.divider}`,
                        boxShadow: 'none',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          borderColor: theme.palette.primary.main,
                          transform: 'translateY(-6px)',
                          boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.04)}`,
                        },
                      }}
                    >
                      <CardContent sx={{ p: 4 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            mb: 3,
                          }}
                        >
                          <Avatar
                            sx={{
                              bgcolor: alpha(theme.palette.primary.main, 0.08),
                              color: theme.palette.primary.main,
                              width: 48,
                              height: 48,
                              borderRadius: 3,
                            }}
                          >
                            <RobotIcon />
                          </Avatar>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography
                              variant="caption"
                              display="block"
                              color="text.secondary"
                              sx={{ fontWeight: 800, mb: 0.5 }}
                            >
                              {TERMS.STATUS}
                            </Typography>
                            <StatusBadge
                              status={agent.status}
                              id={agent.id}
                              type="card"
                            />
                          </Box>
                        </Box>

                        <Typography
                          variant="overline"
                          color="primary"
                          sx={{ fontWeight: 800, letterSpacing: 1.2 }}
                        >
                          {TERMS.IDENTITY}
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 800,
                            mb: 2,
                            color: theme.palette.text.primary,
                          }}
                          data-testid={`agents-page-card-${agent.id}-heading`}
                        >
                          {agent.name}
                        </Typography>

                        <Typography
                          variant="overline"
                          color="text.secondary"
                          sx={{ fontWeight: 800 }}
                        >
                          {TERMS.DESCRIPTION}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          data-testid={`agents-page-card-${agent.id}-description`}
                          sx={{
                            mb: 4,
                            lineHeight: 1.7,
                            minHeight: '4.8em',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {agent.description}
                        </Typography>

                        <Divider
                          sx={{
                            mb: 2,
                            borderColor: alpha(theme.palette.divider, 0.5),
                          }}
                        />

                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Box>
                            <Typography
                              variant="caption"
                              display="block"
                              color="text.secondary"
                              sx={{ fontWeight: 800 }}
                            >
                              {TERMS.ENGINE}
                            </Typography>
                            <Typography
                              variant="body2"
                              data-testid={`agents-page-card-${agent.id}-model`}
                              sx={{
                                fontWeight: 700,
                                fontFamily: 'monospace',
                                color: theme.palette.primary.main,
                              }}
                            >
                              {agent.model}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Fade>
          ) : (
            /* Professional Material Table */
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr)',
                width: '100%',
                overflowX: 'auto',
              }}
            >
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                  borderRadius: 5,
                  border: `1px solid ${theme.palette.divider}`,
                  overflow: 'hidden',
                }}
              >
                <Table>
                  <TableHead
                    sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}
                  >
                    <TableRow>
                      <TableCell
                        sx={{
                          fontWeight: 800,
                          color: theme.palette.text.secondary,
                          fontSize: '0.7rem',
                          textTransform: 'uppercase',
                          py: 2.5,
                        }}
                      >
                        {TERMS.IDENTITY}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 800,
                          color: theme.palette.text.secondary,
                          fontSize: '0.7rem',
                          textTransform: 'uppercase',
                        }}
                      >
                        {TERMS.DESCRIPTION}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 800,
                          color: theme.palette.text.secondary,
                          fontSize: '0.7rem',
                          textTransform: 'uppercase',
                        }}
                      >
                        {TERMS.ENGINE}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 800,
                          color: theme.palette.text.secondary,
                          fontSize: '0.7rem',
                          textTransform: 'uppercase',
                        }}
                      >
                        {TERMS.STATUS}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredAgents.map((agent) => (
                      <TableRow
                        key={agent.id}
                        data-testid={`agents-page-row-${agent.id}`}
                        hover
                        onClick={() => handleAgentClick(agent)}
                        sx={{
                          cursor: 'pointer',
                          '&:last-child td': { border: 0 },
                        }}
                      >
                        <TableCell>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                            }}
                          >
                            <Avatar
                              variant="rounded"
                              sx={{
                                bgcolor: alpha(
                                  theme.palette.primary.main,
                                  0.05,
                                ),
                                color: theme.palette.primary.main,
                                width: 36,
                                height: 36,
                                borderRadius: 2,
                              }}
                            >
                              <RobotIcon fontSize="small" />
                            </Avatar>
                            <Box>
                              <Typography
                                variant="subtitle2"
                                data-testid={`agents-page-row-${agent.id}-heading`}
                                sx={{ fontWeight: 800 }}
                              >
                                {agent.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: theme.palette.text.disabled,
                                  fontFamily: 'monospace',
                                }}
                              >
                                {agent.id}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ maxWidth: 400 }}>
                          <Typography
                            data-testid={`agents-page-row-${agent.id}-description`}
                            variant="body2"
                            color="text.secondary"
                            noWrap
                            sx={{ fontStyle: 'italic' }}
                          >
                            {agent.description}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            data-testid={`agents-page-row-${agent.id}-model`}
                            label={agent.model}
                            size="small"
                            icon={
                              <TerminalIcon
                                sx={{ fontSize: '14px !important' }}
                              />
                            }
                            sx={{
                              fontWeight: 700,
                              fontFamily: 'monospace',
                              bgcolor: alpha(theme.palette.primary.main, 0.04),
                              color: theme.palette.primary.main,
                              border: 'none',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <StatusBadge
                            status={agent.status}
                            id={agent.id}
                            type="row"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Empty Search State */}
          {filteredAgents.length === 0 && (
            <Fade in={true}>
              <Box
                sx={{
                  textAlign: 'center',
                  py: 15,
                  borderRadius: 5,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 800, color: theme.palette.text.secondary }}
                >
                  No Matching Intelligence Units
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: theme.palette.text.disabled, mt: 1 }}
                >
                  Try refining your search keywords or clearing filters.
                </Typography>
                <IconButton
                  onClick={() => setSearchTerm('')}
                  sx={{
                    mt: 2,
                    color: theme.palette.primary.main,
                    bgcolor: theme.palette.background.paper,
                  }}
                >
                  <ClearIcon />
                </IconButton>
              </Box>
            </Fade>
          )}
        </Grid>
      </Grid>
    </Box>
  )
}

export default AgentCatalog
