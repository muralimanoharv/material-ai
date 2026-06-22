import { memo } from 'react'
import type * as Types from '@a2ui/web_core/types/types'
import type { A2UIComponentProps } from '@a2ui/react/v0_8'
import {
  useA2UIComponent,
  classMapToString,
  stylesToObject,
} from '@a2ui/react/v0_8'
import { Box, Typography } from '@mui/material'

/**
 * AudioPlayer component - renders an audio player with optional description.
 *
 * Uses Material UI Box and Typography, wrapping the native HTML5 audio element.
 */
export const AudioPlayer = memo(function AudioPlayer({
  node,
  surfaceId,
}: A2UIComponentProps<Types.AudioPlayerNode>) {
  const { theme, resolveString } = useA2UIComponent(node, surfaceId)
  const props = node.properties

  const url = resolveString(props.url)
  const description = resolveString(props.description ?? null)

  if (!url) {
    return null
  }

  return (
    <Box
      className={classMapToString(theme.components.AudioPlayer)}
      style={stylesToObject(theme.additionalStyles?.AudioPlayer)}
    >
      {description && <Typography component="p">{description}</Typography>}
      <audio src={url} controls />
    </Box>
  )
})

export default AudioPlayer
