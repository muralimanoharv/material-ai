import { IconButton, Tooltip } from '@mui/material'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import KeyboardArrowUpOutlinedIcon from '@mui/icons-material/KeyboardArrowUpOutlined'

interface UserTextToggleButtonProps {
  textExpand: boolean
  textExpandToggle: () => void
}

export default function UserTextToggleButton({
  textExpand,
  textExpandToggle,
}: UserTextToggleButtonProps) {
  return (
    <Tooltip title={textExpand ? 'Collapse text' : 'Expand text'}>
      <IconButton onClick={textExpandToggle}>
        {textExpand ? (
          <KeyboardArrowUpOutlinedIcon />
        ) : (
          <KeyboardArrowDownOutlinedIcon />
        )}
      </IconButton>
    </Tooltip>
  )
}
