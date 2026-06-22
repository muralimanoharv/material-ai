import React from 'react'
import { Link } from 'react-router'
import MUI from '@mui/material'
import MUIIcons from '@mui/icons-material'

const { AppBar, Toolbar, Stack, Typography, Button, Box, Avatar, Tooltip } = MUI
const { SmartToy } = MUIIcons

export default function GlobalHeader({ user }) {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
        mb: 4,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 6 } }}>
        <Stack direction="row" spacing={4} alignItems="center">
          <Typography
            variant="h6"
            fontWeight="700"
            color="primary"
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <SmartToy /> AgentHub
          </Typography>
          <Stack
            direction="row"
            spacing={1}
            display={{ xs: 'none', md: 'flex' }}
          >
            <Button
              component={Link}
              to="/"
              variant="text"
              color="inherit"
              sx={{ textTransform: 'none' }}
            >
              Home
            </Button>
            <Button
              component={Link}
              to="/agents/prompts"
              variant="text"
              color="inherit"
              sx={{ textTransform: 'none' }}
            >
              Prompts
            </Button>
            <Button
              component={Link}
              to="/agents/company"
              variant="text"
              color="inherit"
              sx={{ textTransform: 'none' }}
            >
              Company
            </Button>
            <Button
              component={Link}
              to="/agents/help"
              variant="text"
              color="inherit"
              sx={{ textTransform: 'none' }}
            >
              Help
            </Button>
            <Button
              component={Link}
              to="/agents/health"
              variant="text"
              color="inherit"
              sx={{ textTransform: 'none' }}
            >
              System Health
            </Button>
          </Stack>
        </Stack>

        {user && (
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}
            >
              <Typography
                variant="subtitle2"
                fontWeight="600"
                color="text.primary"
                lineHeight={1.2}
              >
                {user.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
            <Tooltip title="Profile">
              <Avatar
                src={user.picture}
                alt={user.name}
                sx={{
                  width: 40,
                  height: 40,
                  border: '2px solid',
                  borderColor: 'primary.main',
                }}
              >
                {user.given_name?.[0]}
              </Avatar>
            </Tooltip>
          </Stack>
        )}
      </Toolbar>
    </AppBar>
  )
}
