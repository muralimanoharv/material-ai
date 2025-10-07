import { useTheme } from '@emotion/react'
import { Box, IconButton, Tooltip, Typography } from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'
import { fetch_artifact, UNAUTHORIZED } from '../../api'
import { formatBase64Data } from '../../utils'
import { useContext } from 'react'
import { AppContext } from '../../context'
import { config } from '../../assets/config'

export default function FileBox(props) {
  const context = useContext(AppContext)
  const file = props.file
  const theme = useTheme()
  const fileName = file.name
  const parts = fileName.split('.')
  const name = parts[0]
  const extension = parts[parts.length - 1]

  const onClick = async () => {
    try {
      if (props.showClear) return
      let inlineData
      if (file.inlineData) {
        inlineData = file.inlineData
      } else if (file.type === 'artifact') {
        let artifact = await fetch_artifact(context)({
          artifact_name: file.name,
          version: file.version,
        })
        inlineData = artifact.inlineData
      }
      if (!inlineData) return
      const response = await fetch(
        formatBase64Data(
          inlineData.data,
          inlineData.mimeType || inlineData.mime_type,
        ),
      )
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      window.open(blobUrl, '_blank')
    } catch (e) {
      if (e.name == UNAUTHORIZED) return
      console.error(e)
      context.setSnack(config.errorMessage)
    }
  }

  if (['jpg', 'jpeg', 'png', 'svg', 'gif', 'webp'].includes(extension)) {
    return (
      <Tooltip title={fileName} key={fileName}>
        <img
          style={{
            width: '80px',
            height: '80px',
            objectFit: 'cover',
            cursor: 'pointer',
          }}
          src={formatBase64Data(file.inlineData.data, file.inlineData.mimeType)}
          onClick={onClick}
          alt={fileName}
        />
      </Tooltip>
    )
  }

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
          cursor: !props.showClear ? 'pointer' : undefined,
          backgroundColor: theme.palette.background?.card,
          '&:hover': {
            backgroundColor: !props.showClear
              ? theme.palette.background?.cardHover
              : undefined,
          },
        }}
        key={fileName}
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
            <Typography noWrap color={theme.palette.text.primary} variant="h5">
              {name}
            </Typography>
            {props.showClear && (
              <IconButton
                onClick={() => props.onClearFile(fileName)}
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
              src={extension == 'pdf' ? `/pdf.png` : '/csv.png'}
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
