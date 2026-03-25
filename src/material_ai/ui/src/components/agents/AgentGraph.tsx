/* eslint-disable */
import React, { useState, useCallback, useEffect, useRef } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Paper,
  Stack,
  Button,
  Chip,
  IconButton,
  Avatar,
  Slide,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  alpha,
  keyframes,
  ToggleButton,
  ToggleButtonGroup,
  useMediaQuery,
  type Theme,
} from '@mui/material'
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  BackgroundVariant,
  Panel,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react'
import type {
  Node,
  Edge,
  NodeProps,
  ReactFlowInstance,
  NodeChange,
  EdgeChange,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import {
  SmartToy as RobotIcon,
  Build as ToolIcon,
  RestartAlt as ResetIcon,
  GpsFixed as CenterIcon,
  Close,
  Terminal as ModelIcon,
  PowerSettingsNew as StatusIcon,
  Description as DescIcon,
  ZoomIn as ZoomIcon,
  Bolt as ActionIcon,
  CheckCircle as SuccessIcon,
  ReceiptLong as LogIcon,
  Timeline as TraceIcon,
  Visibility as BlueprintIcon,
  PlayArrow as PlayIcon,
} from '@mui/icons-material'
import type { Agent, ChatPart, Tool } from '../../schema'

// --- Types ---
type AppMode = 'static' | 'live'
type ExecutionStatus = 'idle' | 'calling' | 'responded'

interface CustomNodeData extends Record<string, unknown> {
  label: string
  nodeType: 'agent' | 'tool'
  executionStatus: ExecutionStatus
  lastCallArgs?: any
  lastResponseResult?: any
  name?: string
  description?: string
  model?: string
  status?: string
  id?: string
  appMode: AppMode
}

interface AgentOrchestrationProps {
  data: Agent
  events?: ChatPart[][]
  initialMode?: AppMode
  allowLiveMode?: boolean
}

// --- Animations ---
const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(237, 108, 2, 0.4); }
  70% { transform: scale(1.02); box-shadow: 0 0 0 10px rgba(237, 108, 2, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(237, 108, 2, 0); }
`

// --- Node Components ---

const AgentNode: React.FC<NodeProps<Node<CustomNodeData>>> = ({ data }) => {
  const theme = useTheme()
  const status = data.executionStatus
  const isLive = data.appMode === 'live'
  const isActive = isLive && (status === 'calling' || status === 'responded')

  const borderColor = !isLive
    ? theme.palette.primary.main
    : status === 'calling'
      ? theme.palette.warning.main
      : status === 'responded'
        ? theme.palette.success.main
        : theme.palette.divider

  return (
    <Card
      variant="outlined"
      sx={{
        minWidth: 320,
        borderRadius: 3,
        borderColor: borderColor,
        borderWidth: status === 'idle' ? 1.5 : 4,
        bgcolor: 'background.paper',
        animation:
          isLive && status === 'calling' ? `${pulse} 2s infinite` : 'none',
        transition: 'all 0.3s ease',
        boxShadow: isActive ? theme.shadows[10] : theme.shadows[1],
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: theme.palette.text.disabled, width: 6, height: 6 }}
      />
      <CardContent sx={{ p: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
          <RobotIcon
            color={isActive ? 'inherit' : 'primary'}
            sx={{
              fontSize: 24,
              color: isActive
                ? status === 'calling'
                  ? theme.palette.warning.main
                  : theme.palette.success.main
                : undefined,
            }}
          />
          <Typography variant="body2" fontWeight="700" color="text.primary">
            {data.name}
          </Typography>
        </Stack>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: 'block',
            height: 40,
            overflow: 'hidden',
            whiteSpace: 'pre-wrap',
            lineHeight: 1.3,
            mb: 2,
          }}
        >
          {data.description}
        </Typography>
        <Divider sx={{ mb: 1.5, opacity: 0.4 }} />
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Chip
            label={(isLive ? status : data.status || 'idle').toUpperCase()}
            size="small"
            sx={{
              height: 18,
              fontSize: '0.6rem',
              fontWeight: 800,
              bgcolor:
                status === 'calling'
                  ? 'warning.main'
                  : status === 'responded'
                    ? 'success.main'
                    : 'action.disabledBackground',
              color: status === 'idle' ? 'text.secondary' : 'common.white',
              borderRadius: 1,
            }}
          />
          <Typography
            variant="caption"
            sx={{
              fontStyle: 'italic',
              color: 'text.secondary',
              fontSize: '0.65rem',
            }}
          >
            {data.model || 'Logic Core'}
          </Typography>
        </Stack>
      </CardContent>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: theme.palette.text.disabled, width: 6, height: 6 }}
      />
    </Card>
  )
}

const ToolNode: React.FC<NodeProps<Node<CustomNodeData>>> = ({ data }) => {
  const theme = useTheme()
  const status = data.executionStatus
  const isLive = data.appMode === 'live'

  const bg =
    isLive && status === 'calling'
      ? theme.palette.warning.main
      : isLive && status === 'responded'
        ? theme.palette.success.main
        : theme.palette.text.primary
  const color =
    isLive && status !== 'idle'
      ? theme.palette.getContrastText(bg)
      : theme.palette.background.paper

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.2,
        px: 2.5,
        borderRadius: 10,
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.2,
        bgcolor: bg,
        color: color,
        boxShadow:
          isLive && status !== 'idle' ? theme.shadows[10] : theme.shadows[1],
        transition: 'all 0.4s',
      }}
    >
      <Handle type="target" position={Position.Top} />
      <ToolIcon sx={{ fontSize: 16 }} />
      <Typography variant="caption" fontWeight="bold">
        {data.label}
      </Typography>
    </Paper>
  )
}

const nodeTypes = { agent: AgentNode, tool: ToolNode }

// --- Main Engine ---

const AgentOrchestrationSuite: React.FC<AgentOrchestrationProps> = ({
  data,
  events = [],
  initialMode = 'static',
  allowLiveMode = true,
}) => {
  const theme: Theme = useTheme()
  const isMdDown = useMediaQuery(theme.breakpoints.down('md'))
  const isSmDown = useMediaQuery(theme.breakpoints.down('sm'))

  const [mode, setMode] = useState<AppMode>(
    allowLiveMode ? initialMode : 'static',
  )
  const [nodes, setNodes] = useState<Node<CustomNodeData>[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance<
    Node<CustomNodeData>,
    Edge
  > | null>(null)
  const [selectedNodeData, setSelectedNodeData] =
    useState<CustomNodeData | null>(null)
  const [zoomLevel, setZoomLevel] = useState<number>(0.5)

  const [liveHistory, setLiveHistory] = useState<ChatPart[]>([])
  const [simStep, setSimStep] = useState<number>(0)
  const [isReplayMode, setIsReplayMode] = useState<boolean>(false)
  const [processedEventsCount, setProcessedEventsCount] = useState<number>(0)

  const logEndRef = useRef<HTMLDivElement>(null)
  const lastEventSignature = useRef<string | null>(null)

  const handleRecenter = useCallback((): void => {
    if (reactFlowInstance)
      reactFlowInstance.fitView({ padding: 0.2, duration: 800 })
  }, [reactFlowInstance])

  const generateLayout = useCallback(
    (currentMode: AppMode): void => {
      if (!data) return
      const newNodes: Node<CustomNodeData>[] = []
      const newEdges: Edge[] = []
      const vSpace = 320
      const hSpace = 550
      const toolVOffset = 450

      const traverse = (
        item: Agent | Tool,
        x: number,
        y: number,
        parentId: string | null = null,
      ): void => {
        const isTool: boolean = item.type === 'tool'
        const id: string = isTool
          ? `tool-${parentId}-${item.name}`
          : (item as Agent).id

        newNodes.push({
          id,
          type: isTool ? 'tool' : 'agent',
          position: { x, y },
          data: {
            label: isTool ? item.name : (item as Agent).name,
            nodeType: item.type,
            executionStatus: 'idle',
            appMode: currentMode,
            ...item,
          },
        })

        if (parentId) {
          newEdges.push({
            id: `e-${parentId}-${id}`,
            source: parentId,
            target: id,
            type: 'default',
            style: {
              stroke: isTool
                ? theme.palette.divider
                : theme.palette.primary.main,
              strokeWidth: 3,
            },
          })
        }

        if (!isTool) {
          const agent = item as Agent
          agent.sub_agents?.forEach((sub, idx) => {
            const offset = ((agent.sub_agents.length - 1) * hSpace) / 2
            traverse(sub, x - offset + idx * hSpace, y + vSpace, id)
          })
          agent.tools?.forEach((tool, idx) => {
            const offset = ((agent.tools.length - 1) * 280) / 2
            traverse(tool, x - offset + idx * 280, y + toolVOffset, id)
          })
        }
      }
      traverse(data, 0, 0)
      setNodes(newNodes)
      setEdges(newEdges)
    },
    [theme, data],
  )

  // Synchronizes visual statuses (colors, animations, pulse) based on visible history
  const syncVisualsWithTrace = useCallback(
    (trace: ChatPart[]): void => {
      setNodes((nds) =>
        nds.map((node) => {
          let status: ExecutionStatus = 'idle'
          let args = undefined
          let result = undefined

          trace.forEach((event) => {
            if (event.functionCall) {
              const call = event.functionCall
              if (
                node.id === call.name ||
                node.id === call.args?.agent_name ||
                node.data.name === call.name
              ) {
                status = 'calling'
                args = call.args
              }
            }
            if (event.functionResponse) {
              const res = event.functionResponse
              if (
                node.id === res.name ||
                node.data.name === res.name ||
                node.id.includes(res.name)
              ) {
                status = 'responded'
                result = res.response?.result
              }
            }
          })
          return {
            ...node,
            data: {
              ...node.data,
              executionStatus: status,
              lastCallArgs: args,
              lastResponseResult: result,
            },
          }
        }),
      )

      setEdges((eds) =>
        eds.map((e) => {
          let active = false
          trace.forEach((event) => {
            if (event.functionCall) {
              const call = event.functionCall
              if (
                e.target === call.name ||
                e.target === call.args?.agent_name ||
                e.id.includes(call.name)
              )
                active = true
            }
          })
          return {
            ...e,
            animated: active,
            style: {
              ...e.style,
              stroke: active
                ? theme.palette.warning.main
                : theme.palette.divider,
            },
          }
        }),
      )
    },
    [theme],
  )

  // Handle Event Stream Reactively
  useEffect(() => {
    if (mode === 'live' && !isReplayMode && events.length > 0) {
      const currentSignature = JSON.stringify(
        events.map((e) => e[0].functionCall?.id || e[0].functionResponse?.id),
      )
      if (currentSignature !== lastEventSignature.current) {
        const flat = events.flat()
        setLiveHistory(flat)
        syncVisualsWithTrace(flat)
        setProcessedEventsCount(events.length)
        lastEventSignature.current = currentSignature
        handleRecenter()
      }
    }
  }, [
    events,
    mode,
    isReplayMode,
    processedEventsCount,
    syncVisualsWithTrace,
    handleRecenter,
  ])

  // RESET LOGIC
  const handleFullReset = useCallback((): void => {
    setSimStep(0)
    setLiveHistory([])
    setSelectedNodeData(null)
    setProcessedEventsCount(0)
    lastEventSignature.current = null
    setIsReplayMode(true)
    generateLayout(mode)
    setTimeout(handleRecenter, 150)
  }, [mode, generateLayout, handleRecenter])

  // Manual Replay Logic
  const handleManualNext = (): void => {
    if (simStep < events.length) {
      const nextBatch = events[simStep]
      const newHistory = [...liveHistory, ...nextBatch]
      setLiveHistory(newHistory)
      syncVisualsWithTrace(newHistory)
      setSimStep((prev) => prev + 1)
    }
  }

  // Sync Mode Toggles
  useEffect(() => {
    if (mode === 'static') {
      setSelectedNodeData(null)
      generateLayout('static')
    } else {
      generateLayout('live')
      // If we have history or events, ensure they are rendered in live mode
      if (liveHistory.length > 0) syncVisualsWithTrace(liveHistory)
      else if (!isReplayMode && events.length > 0)
        syncVisualsWithTrace(events.flat())
    }
    setTimeout(handleRecenter, 200)
  }, [mode])

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [liveHistory])

  const getDrawerHeaderBg = (): string => {
    if (mode === 'static' || !selectedNodeData)
      return theme.palette.primary.main
    if (selectedNodeData.executionStatus === 'calling')
      return theme.palette.warning.main
    if (selectedNodeData.executionStatus === 'responded')
      return theme.palette.success.main
    return theme.palette.text.primary
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        color: 'text.primary',
        overflow: 'hidden',
      }}
    >
      {/* HEADER TOOLBAR */}
      <Box
        sx={{
          p: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          zIndex: 1100,
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="space-between"
          sx={{ flexWrap: 'nowrap' }}
        >
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{ flexShrink: 1, minWidth: 0 }}
          >
            <Avatar
              sx={{
                bgcolor: mode === 'live' ? 'warning.main' : 'primary.main',
                borderRadius: 2,
                width: 36,
                height: 36,
              }}
            >
              {mode === 'live' ? (
                <TraceIcon sx={{ fontSize: 18 }} />
              ) : (
                <BlueprintIcon sx={{ fontSize: 18 }} />
              )}
            </Avatar>
            {!isSmDown && (
              <Box sx={{ minWidth: 120 }}>
                <Typography variant="subtitle2" fontWeight="900" noWrap>
                  {mode === 'live' ? 'Execution Trace' : 'Agent Blueprint'}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: '0.65rem', display: 'block' }}
                >
                  V.7.3 Orchestrator
                </Typography>
              </Box>
            )}

            {allowLiveMode && (
              <ToggleButtonGroup
                value={mode}
                exclusive
                onChange={(_, v) => v && setMode(v)}
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.text.primary, 0.04),
                  borderRadius: 2,
                  height: 36,
                  ml: 1,
                }}
              >
                <ToggleButton value="static" sx={{ px: 2, gap: 1 }}>
                  <BlueprintIcon fontSize="small" sx={{ mr: { md: 1 } }} />
                  {!isMdDown && (
                    <Typography variant="caption" fontWeight="700">
                      Blueprint
                    </Typography>
                  )}
                </ToggleButton>
                <ToggleButton value="live" sx={{ px: 2, gap: 1 }}>
                  <TraceIcon sx={{ fontSize: 12, mr: { md: 1 } }} />
                  {!isMdDown && (
                    <Typography variant="caption" fontWeight="700">
                      Trace
                    </Typography>
                  )}
                </ToggleButton>
              </ToggleButtonGroup>
            )}
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ flexShrink: 0 }}
          >
            {mode === 'live' && isReplayMode && (
              <Button
                variant="contained"
                color="warning"
                size="small"
                disableElevation
                onClick={handleManualNext}
                disabled={simStep >= events.length}
                startIcon={<PlayIcon />}
                sx={{ borderRadius: 2, height: 36, px: 2 }}
              >
                {!isSmDown ? 'Execute Next' : 'Next'}
              </Button>
            )}
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              onClick={handleFullReset}
              startIcon={<ResetIcon />}
              sx={{
                borderRadius: 2,
                height: 36,
                px: 2,
                borderColor: 'divider',
              }}
            >
              Reset
            </Button>
            <Button
              variant="contained"
              color="secondary"
              size="small"
              disableElevation
              onClick={handleRecenter}
              startIcon={<CenterIcon />}
              sx={{ borderRadius: 2, height: 36, px: 2 }}
            >
              Recenter
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* MAIN LAYOUT */}
      <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
        <Box
          sx={{
            flexGrow: 1,
            position: 'relative',
            bgcolor: theme.palette.mode === 'dark' ? '#0a0a0c' : '#ffffff',
          }}
        >
          <ReactFlow<Node<CustomNodeData>, Edge>
            nodes={nodes}
            edges={edges}
            onNodesChange={useCallback(
              (c: NodeChange<Node<CustomNodeData>>[]) =>
                setNodes((n) => applyNodeChanges<Node<CustomNodeData>>(c, n)),
              [],
            )}
            onEdgesChange={useCallback(
              (c: EdgeChange[]) => setEdges((e) => applyEdgeChanges(c, e)),
              [],
            )}
            onNodeClick={(_e, node) => setSelectedNodeData(node.data)}
            onPaneClick={() => setSelectedNodeData(null)}
            nodeTypes={nodeTypes}
            onInit={(instance) => {
              setReactFlowInstance(instance)
              setTimeout(() => instance.fitView({ padding: 0.2 }), 250)
            }}
            onMove={(_e, v) => setZoomLevel(v.zoom)}
            defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
            zoomOnScroll={false}
            preventScrolling={false}
            zoomOnPinch={true}
            panOnDrag={true}
            minZoom={0.05}
            maxZoom={2}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={30}
              size={1}
              color={
                theme.palette.mode === 'dark'
                  ? alpha(theme.palette.divider, 0.4)
                  : '#cbd5e1'
              }
            />

            <Controls showFitView={false} position="bottom-left">
              <style>{`
                  .react-flow__controls { display: flex !important; flex-direction: column !important; gap: 12px !important; background: transparent !important; box-shadow: none !important; border: none !important; }
                  .react-flow__controls-button { background-color: ${theme.palette.background.paper} !important; color: ${theme.palette.text.primary} !important; border: 1px solid ${theme.palette.divider} !important; border-radius: 8px !important; width: 34px !important; height: 34px !important; box-shadow: ${theme.shadows[2]} !important; }
                  .react-flow__controls-button:hover { background-color: ${theme.palette.action.hover} !important; }
                  .react-flow__controls-button svg { fill: ${theme.palette.text.primary} !important; }
               `}</style>
            </Controls>

            <Panel position="top-right">
              <Paper
                variant="outlined"
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: 5,
                  bgcolor: alpha(theme.palette.background.paper, 0.8),
                  backdropFilter: 'blur(12px)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  borderColor: 'divider',
                }}
              >
                <ZoomIcon fontSize="small" color="primary" />
                <Typography
                  variant="caption"
                  fontWeight="900"
                  color="text.primary"
                >
                  {(zoomLevel * 100).toFixed(0)}%
                </Typography>
              </Paper>
            </Panel>
          </ReactFlow>

          {/* INSPECTOR DRAWER */}
          <Slide
            direction="left"
            in={!!selectedNodeData}
            mountOnEnter
            unmountOnExit
          >
            <Paper
              elevation={24}
              sx={{
                position: 'absolute',
                right: 16,
                top: 16,
                bottom: 16,
                width: { xs: 'calc(100% - 32px)', sm: 480 },
                zIndex: 1000,
                borderRadius: 6,
                display: 'flex',
                flexDirection: 'column',
                bgcolor: alpha(theme.palette.background.paper, 0.98),
                backdropFilter: 'blur(24px)',
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
              }}
            >
              {selectedNodeData && (
                <>
                  <Box
                    sx={{
                      p: 4,
                      bgcolor: getDrawerHeaderBg(),
                      color: theme.palette.getContrastText(getDrawerHeaderBg()),
                      transition: 'background-color 0.3s ease',
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                    >
                      <Avatar
                        sx={{
                          bgcolor: alpha('#fff', 0.2),
                          width: 56,
                          height: 56,
                          boxShadow: theme.shadows[2],
                        }}
                      >
                        <RobotIcon sx={{ fontSize: 32, color: 'inherit' }} />
                      </Avatar>
                      <IconButton
                        size="small"
                        onClick={() => setSelectedNodeData(null)}
                        sx={{ color: 'inherit' }}
                      >
                        <Close />
                      </IconButton>
                    </Stack>
                    <Typography
                      variant="h5"
                      fontWeight="900"
                      sx={{ mt: 3, letterSpacing: -1 }}
                    >
                      {selectedNodeData.name || selectedNodeData.label}
                    </Typography>
                    <Chip
                      label={
                        mode === 'live'
                          ? selectedNodeData.executionStatus.toUpperCase()
                          : selectedNodeData.nodeType.toUpperCase()
                      }
                      size="small"
                      sx={{
                        mt: 1.5,
                        fontWeight: '900',
                        bgcolor: alpha('#000', 0.15),
                        color: 'inherit',
                        border: 'none',
                      }}
                    />
                  </Box>
                  <Box sx={{ p: 4, flexGrow: 1, overflowY: 'auto' }}>
                    <Stack spacing={4}>
                      {mode === 'live' ? (
                        <>
                          <Box>
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                              sx={{ mb: 1.5 }}
                            >
                              <ActionIcon fontSize="small" color="primary" />
                              <Typography
                                variant="overline"
                                color="text.secondary"
                                fontWeight="900"
                              >
                                Arguments
                              </Typography>
                            </Stack>
                            <Paper
                              sx={{
                                p: 2,
                                bgcolor: alpha(
                                  theme.palette.text.primary,
                                  0.03,
                                ),
                                borderRadius: 3,
                                border: '1px solid',
                                borderColor: 'divider',
                                maxHeight: 200,
                                overflowY: 'auto',
                              }}
                            >
                              <Typography
                                variant="caption"
                                component="pre"
                                sx={{
                                  fontFamily: 'monospace',
                                  whiteSpace: 'pre-wrap',
                                  wordBreak: 'break-all',
                                  color: 'text.primary',
                                  fontSize: '0.75rem',
                                }}
                              >
                                {selectedNodeData.lastCallArgs
                                  ? JSON.stringify(
                                      selectedNodeData.lastCallArgs,
                                      null,
                                      2,
                                    )
                                  : '// Awaiting packet content'}
                              </Typography>
                            </Paper>
                          </Box>
                          <Box>
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                              sx={{ mb: 1.5 }}
                            >
                              <SuccessIcon fontSize="small" color="success" />
                              <Typography
                                variant="overline"
                                color="text.secondary"
                                fontWeight="900"
                              >
                                Execution Response
                              </Typography>
                            </Stack>
                            <Paper
                              sx={{
                                p: 2,
                                bgcolor: alpha(
                                  theme.palette.success.main,
                                  0.05,
                                ),
                                border: '1px solid',
                                borderColor: alpha(
                                  theme.palette.success.main,
                                  0.2,
                                ),
                                borderRadius: 3,
                                maxHeight: 350,
                                overflowY: 'auto',
                              }}
                            >
                              <Typography
                                variant="caption"
                                component="pre"
                                sx={{
                                  fontFamily: 'monospace',
                                  whiteSpace: 'pre-wrap',
                                  wordBreak: 'break-all',
                                  color:
                                    theme.palette.mode === 'dark'
                                      ? theme.palette.success.light
                                      : theme.palette.success.dark,
                                  fontSize: '0.75rem',
                                }}
                              >
                                {selectedNodeData.lastResponseResult
                                  ? JSON.stringify(
                                      selectedNodeData.lastResponseResult,
                                      null,
                                      2,
                                    )
                                  : '// Processing payload...'}
                              </Typography>
                            </Paper>
                          </Box>
                        </>
                      ) : (
                        <>
                          <Box>
                            <Stack
                              direction="row"
                              spacing={1.5}
                              alignItems="center"
                              sx={{ mb: 1.5 }}
                            >
                              <DescIcon fontSize="small" color="primary" />
                              <Typography
                                variant="overline"
                                color="text.secondary"
                                fontWeight="900"
                              >
                                Specifications
                              </Typography>
                            </Stack>
                            <Typography
                              variant="body2"
                              sx={{
                                whiteSpace: 'pre-wrap',
                                lineHeight: 1.8,
                                color: 'text.primary',
                              }}
                            >
                              {selectedNodeData.description}
                            </Typography>
                          </Box>
                          <Box>
                            <List dense disablePadding>
                              <ListItem disableGutters sx={{ py: 1.5 }}>
                                <ListItemIcon sx={{ minWidth: 44 }}>
                                  <ModelIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText
                                  primary={
                                    <Typography
                                      variant="caption"
                                      fontWeight="900"
                                      color="text.secondary"
                                    >
                                      ARCH: ENGINE
                                    </Typography>
                                  }
                                  secondary={
                                    <Typography
                                      variant="body2"
                                      fontWeight="bold"
                                    >
                                      {selectedNodeData.model ||
                                        'v7.3 TypeScript'}
                                    </Typography>
                                  }
                                />
                              </ListItem>
                              <ListItem disableGutters sx={{ py: 1.5 }}>
                                <ListItemIcon sx={{ minWidth: 44 }}>
                                  <StatusIcon
                                    color={
                                      selectedNodeData.status === 'active'
                                        ? 'success'
                                        : 'error'
                                    }
                                  />
                                </ListItemIcon>
                                <ListItemText
                                  primary={
                                    <Typography
                                      variant="caption"
                                      fontWeight="900"
                                      color="text.secondary"
                                    >
                                      STATUS: REGISTRY
                                    </Typography>
                                  }
                                  secondary={
                                    <Typography
                                      variant="body2"
                                      fontWeight="bold"
                                    >
                                      {selectedNodeData.status?.toUpperCase() ||
                                        'READY'}
                                    </Typography>
                                  }
                                />
                              </ListItem>
                            </List>
                          </Box>
                        </>
                      )}
                    </Stack>
                  </Box>
                  <Box
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      borderTop: '1px solid',
                      borderColor: 'divider',
                      bgcolor: alpha(theme.palette.text.primary, 0.02),
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight="800"
                      sx={{ letterSpacing: 2 }}
                    >
                      AGENT CORE v7.3
                    </Typography>
                  </Box>
                </>
              )}
            </Paper>
          </Slide>
        </Box>

        {/* TRACE PANEL */}
        {mode === 'live' && allowLiveMode && !isMdDown && (
          <Box
            sx={{
              width: 400,
              borderLeft: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box
              sx={{
                p: 2.5,
                borderBottom: '1px solid',
                borderColor: 'divider',
                bgcolor: alpha(theme.palette.warning.main, 0.05),
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <LogIcon color="warning" />
                <Typography variant="subtitle2" fontWeight="900">
                  SYSTEM EVENT LOG
                </Typography>
              </Stack>
            </Box>
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
              {liveHistory.length === 0 ? (
                <Box sx={{ textAlign: 'center', mt: 8, opacity: 0.4 }}>
                  <Typography variant="caption">
                    Awaiting execution packets...
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1.5}>
                  {liveHistory.map((ev, i) => {
                    const isCall = !!ev.functionCall
                    const name = isCall
                      ? ev.functionCall?.name
                      : ev.functionResponse?.name
                    return (
                      <Paper
                        key={i}
                        variant="outlined"
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          bgcolor: isCall
                            ? alpha(theme.palette.warning.main, 0.02)
                            : alpha(theme.palette.success.main, 0.02),
                          borderLeft: '5px solid',
                          borderColor: isCall ? 'warning.main' : 'success.main',
                          boxShadow: theme.shadows[1],
                        }}
                      >
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          sx={{ mb: 1 }}
                        >
                          <Chip
                            label={`Event #${i + 1}`}
                            size="small"
                            sx={{
                              height: 16,
                              fontSize: '0.5rem',
                              fontWeight: 900,
                            }}
                          />
                          <Typography
                            variant="caption"
                            sx={{ opacity: 0.5, fontSize: '0.6rem' }}
                          >
                            {new Date().toLocaleTimeString()}
                          </Typography>
                        </Stack>
                        <Typography
                          variant="caption"
                          fontWeight="900"
                          color={isCall ? 'warning.main' : 'success.main'}
                          display="block"
                        >
                          {isCall
                            ? 'INITIATED FUNCTION CALL'
                            : 'RECEIVED FUNCTION RESPONSE'}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            fontFamily: 'monospace',
                            fontWeight: 800,
                            color: 'text.primary',
                            mt: 0.5,
                            display: 'block',
                          }}
                        >
                          {name}
                        </Typography>
                      </Paper>
                    )
                  })}
                  <div ref={logEndRef} />
                </Stack>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default AgentOrchestrationSuite
