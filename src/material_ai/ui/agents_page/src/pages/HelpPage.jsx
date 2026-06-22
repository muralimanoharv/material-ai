import React from 'react'
import MUI from '@mui/material'
import MUIIcons from '@mui/icons-material'

const { Fade, Box, Typography, Card, List, ListItem, ListItemText, Divider } =
  MUI
const { HelpOutline } = MUIIcons

export default function HelpPage() {
  return (
    <Fade in>
      <Box sx={{ p: { xs: 2, md: 0 }, maxWidth: 1200, margin: '0 auto' }}>
        <Typography variant="h4" fontWeight="600" mb={4} color="text.primary">
          <HelpOutline
            sx={{ mr: 1, verticalAlign: 'bottom', color: '#E53935' }}
          />{' '}
          Support Center
        </Typography>
        <Card variant="outlined" sx={{ borderRadius: '16px' }}>
          <List disablePadding>
            <ListItem sx={{ py: 3, px: 4 }}>
              <ListItemText
                primary="How do I trigger a specific agent tool?"
                secondary="Tools are automatically selected by the agent's LLM based on your prompt context."
                primaryTypographyProps={{
                  fontWeight: 600,
                  mb: 1,
                  color: 'text.primary',
                }}
              />
            </ListItem>
            <Divider />
            <ListItem sx={{ py: 3, px: 4 }}>
              <ListItemText
                primary="How are sub-agents managed?"
                secondary="Sub-agents act as specialists. The parent agent delegates tasks to them dynamically."
                primaryTypographyProps={{
                  fontWeight: 600,
                  mb: 1,
                  color: 'text.primary',
                }}
              />
            </ListItem>
            <Divider />
            <ListItem sx={{ py: 3, px: 4 }}>
              <ListItemText
                primary="Contact Engineering Support"
                secondary="Email: support@agent-hub.internal"
                primaryTypographyProps={{
                  fontWeight: 600,
                  mb: 1,
                  color: 'text.primary',
                }}
              />
            </ListItem>
          </List>
        </Card>
      </Box>
    </Fade>
  )
}
