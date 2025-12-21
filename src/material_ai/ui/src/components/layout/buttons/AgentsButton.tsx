import { useLocation, useNavigate } from 'react-router'
import { AutoAwesome } from '@mui/icons-material'
import DrawerButton from '../../material/DrawerButton'
import { useTheme } from '@mui/material'
import { useContext } from 'react'
import { AppContext, type AppContextType } from '../../../context'

export default function AgentsButton() {
  const { promptLoading, user } = useContext(AppContext) as AppContextType
  const navigate = useNavigate()

  const theme = useTheme()

  const location = useLocation()

  const isSelected = location.pathname == '/agents'

  return (
    <DrawerButton
      dataTestid="page-agents-button"
      disabled={promptLoading || !user}
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
