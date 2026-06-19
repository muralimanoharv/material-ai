import { AudioPlayerApi } from '@a2ui/web_core/v0_9/basic_catalog'
import { createComponentImplementation } from '@a2ui/react/v0_9'
import { Stack, Typography, Box } from '@mui/material'

export const AudioPlayer = createComponentImplementation(
  AudioPlayerApi,
  ({ props }) => {
    return (
      <Stack spacing={0.5} sx={{ width: '100%' }}>
        {props.description && (
          <Typography variant="caption" color="text.secondary">
            {props.description}
          </Typography>
        )}

        {/* We use MUI's Box component mapped to the 'audio' HTML tag. 
          This allows us to style the native player using the standard sx prop. */}
        <Box
          component="audio"
          src={props.url}
          controls
          sx={{
            width: '100%',
            outline: 'none',
          }}
        />
      </Stack>
    )
  },
)
