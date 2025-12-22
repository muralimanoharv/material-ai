import { Box } from '@mui/material'
import FileBox, { type FileData } from './FileBox'

interface FilesBoxProps {
  files: FileData[]
  alignSelf?: string
  justifyContent?: string
}

export default function FilesBox(props: FilesBoxProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: '10px',
        alignSelf: props.alignSelf,
        justifyContent: props.justifyContent,
        width: '100%',
        alignItems: 'center',
        flexWrap: 'wrap',
        paddingLeft: '60px',
      }}
    >
      {props.files.map((file) => (
        <FileBox key={file.name} file={file} prefix="chat" />
      ))}
    </Box>
  )
}
