import { useLocation, useNavigate } from 'react-router'
import { AutoAwesome } from '@mui/icons-material'
import DrawerButton from '../../material/DrawerButton'
import { useTheme } from '@mui/material'

export default function AgentsButton() {
  const navigate = useNavigate()

  const theme = useTheme()

  const location = useLocation()

  const isSelected = location.pathname == '/agents'

  return (
    <DrawerButton
      tooltip="Agents"
      icon={
        <AutoAwesome
          sx={{
            color: isSelected
              ? theme.palette.text.selected
              : theme.palette.text.tertiary,
          }}
        />
      }
      title="Agents"
      onClick={() => {
        navigate('/agents')
      }}
    />
  )
}
