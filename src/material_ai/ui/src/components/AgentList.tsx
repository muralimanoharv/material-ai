import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  IconButton, 
  Stack,
  Avatar,
  useTheme
} from '@mui/material';
import { 
  SmartToy as BotIcon, 
  MoreVert as MoreIcon, 
  Circle as StatusIcon,
  AutoAwesome as SparkleIcon
} from '@mui/icons-material';
import type { Agent } from '../schema';


const AgentList = ({agents} : {agents: Agent[]}) => {
  const theme = useTheme();

  return (
    <Box sx={{ p: 3, bgcolor: theme.palette.background.default }}>
      
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
        <SparkleIcon sx={{ color: theme.palette.primary.main }} />
        <Typography variant="h5" sx={{ color: theme.palette.text.h5, fontWeight: 600 }}>
          Your Agents
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
                }
              }}
            >
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Avatar sx={{ 
                    bgcolor: agent.status === 'active' ? theme.palette.background.history : '#e0e0e0', 
                    color: agent.status === 'active' ? theme.palette.text.selected : theme.palette.text.tertiary 
                  }}>
                    <BotIcon />
                  </Avatar>
                  <IconButton size="small" sx={{ color: theme.palette.text.tertiary }}>
                    <MoreIcon fontSize="small" />
                  </IconButton>
                </Stack>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>
                    {agent.name}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, minHeight: '40px', color: theme.palette.text.tertiary }}>
                    {agent.description}
                  </Typography>
                </Box>

                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 3 }}>
                  <Chip 
                    label={agent.model} 
                    size="small" 
                    sx={{ 
                      fontSize: '0.7rem', 
                      bgcolor: theme.palette.background.default, 
                      color: theme.palette.text.secondary,
                      border: `1px solid ${theme.palette.background.cardHover}`
                    }} 
                  />
                  
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <StatusIcon sx={{ 
                      fontSize: 10, 
                      color: agent.status === 'active' ? theme.palette.primary.main : theme.palette.text.tagline 
                    }} />
                    <Typography variant="caption" sx={{ 
                      color: agent.status === 'active' ? theme.palette.text.selected : theme.palette.text.tagline,
                      fontWeight: 500
                    }}>
                      {agent.status === 'active' ? 'Active' : 'Idle'}
                    </Typography>
                  </Stack>
                </Stack>

              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AgentList;