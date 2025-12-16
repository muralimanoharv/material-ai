import { useTheme, Box, IconButton, Tooltip, Typography } from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'
import { formatBase64Data } from '../../../utils'
import { useContext } from 'react'
import { AppContext, type AppContextType } from '../../../context'
import type { InlineData } from '../../../schema'
import { useParams } from 'react-router'
import { useAgentId } from '../../../hooks'

export interface FileData {
  name: string
  version?: number | string
  type?: 'upload' | 'artifact' | string
  inlineData?: InlineData
}

interface FileBoxProps {
  file: FileData
  showClear?: boolean
  onClearFile?: (fileName: string) => void
}

export default function FileBox(props: FileBoxProps) {
  const context = useContext(AppContext) as AppContextType
  const { config, apiService } = context

  const { file, showClear, onClearFile } = props
  const theme = useTheme()

  const agent = useAgentId() as string

  const fileName = file.name
  const parts = fileName.split('.')
  const name = parts[0]
  const extension = parts[parts.length - 1]
  const params = useParams()

  const onClick = async () => {
    try {
      if (showClear) return
      const user = context.user
      if (!user) return
      const session = params['sessionId']
      if (!session) return

      let inlineData = file.inlineData

      if (file.inlineData) {
        inlineData = file.inlineData
      } else if (file.type === 'artifact') {
        const artifact = await apiService.fetch_artifact(agent, {
          artifact_name: file.name,
          version: file.version ?? 0,
          session,
        })
        inlineData = artifact.inlineData
      }

      if (!inlineData) return

      const mime = inlineData.mimeType || 'application/octet-stream'

      const response = await fetch(formatBase64Data(inlineData.data, mime))

      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      window.open(blobUrl, '_blank')
    } catch (e: unknown) {
      console.error(e)
      context.setSnack(config?.errorMessage || 'Error opening file')
    }
  }

  // Image Rendering Logic
  if (
    ['jpg', 'jpeg', 'png', 'svg', 'gif', 'webp'].includes(
      extension.toLowerCase(),
    )
  ) {
    // We safeguard against missing inlineData for images to prevent crashes
    const imgSrc = file.inlineData
      ? formatBase64Data(file.inlineData.data, file.inlineData.mimeType || '')
      : '' // Placeholder or error state could go here

    return (
      <Tooltip title={fileName} key={fileName}>
        <img
          style={{
            width: '80px',
            height: '80px',
            objectFit: 'cover',
            cursor: 'pointer',
          }}
          src={imgSrc}
          onClick={onClick}
          alt={fileName}
        />
      </Tooltip>
    )
  }

  const cardBg =
    (theme.palette.background).card || theme.palette.grey[100]
  const cardHoverBg =
    (theme.palette.background).cardHover || theme.palette.grey[200]

  return (
    <Tooltip title={fileName} key={fileName}>
      <Box
        onClick={onClick}
        sx={{
          minWidth: '150px',
          width: '210px',
          display: 'flex',
          justifyContent: 'flex-start',
          borderRadius: '16px',
          padding: '16px 16px 16px 16px',
          '&:hover .file-clear-button': {
            opacity: '1',
          },
          cursor: !showClear ? 'pointer' : undefined,
          backgroundColor: cardBg,
          '&:hover': {
            backgroundColor: !showClear ? cardHoverBg : undefined,
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            width: '100%',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '5px',
              position: 'relative',
            }}
          >
            <Typography noWrap color="text.primary" variant="h5">
              {name}
            </Typography>
            {showClear && onClearFile && (
              <IconButton
                onClick={(e) => {
                  e.stopPropagation()
                  onClearFile(fileName)
                }}
                className="file-clear-button"
                sx={{
                  backgroundColor: theme.palette.background.default,
                  opacity: '0',
                  position: 'absolute',
                  right: -10,
                  top: -10,
                }}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: '10px' }}>
            <img
              style={{ width: '16px', height: '16px' }}
              src={extension === 'pdf' ? `/pdf.png` : '/csv.png'}
              alt={extension}
            />
            <Typography variant="h6" textTransform="uppercase" fontWeight={500}>
              {extension}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Tooltip>
  )
}
