import { IconButton, Tooltip } from '@mui/material'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import KeyboardArrowUpOutlinedIcon from '@mui/icons-material/KeyboardArrowUpOutlined'

export default function UserTextToggleButton({ textExpand, textExpandToggle }) {
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
