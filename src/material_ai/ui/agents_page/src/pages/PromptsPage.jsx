import React from 'react'
import MUI from '@mui/material'
import MUIIcons from '@mui/icons-material'
import { GLOBAL_PROMPTS } from '../data/constants'

const { Fade, Box, Typography, Grid, Paper } = MUI
const { ChatBubbleOutline, PlayArrow } = MUIIcons

export default function PromptsPage() {
  return (
    <Fade in>
      <Box sx={{ p: { xs: 2, md: 0 }, maxWidth: 1200, margin: '0 auto' }}>
        <Typography variant="h4" fontWeight="600" mb={1} color="text.primary">
          <ChatBubbleOutline
            sx={{ mr: 1, verticalAlign: 'bottom', color: '#4285F4' }}
          />{' '}
          Prompt Library
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={4}>
          Sample queries to kickstart your interactions with our agents.
        </Typography>

        <Grid container spacing={2}>
          {GLOBAL_PROMPTS.map((prompt, idx) => (
            <Grid item xs={12} key={idx}>
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <PlayArrow sx={{ color: '#4285F4', mr: 2, mt: 0.5 }} />
                <Typography
                  variant="body1"
                  fontWeight="500"
                  color="text.primary"
                >
                  "{prompt}"
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Fade>
  )
}
