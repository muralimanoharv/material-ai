import { useLocation, useNavigate } from 'react-router'
import { AutoAwesome } from '@mui/icons-material'
import DrawerButton from '../other/DrawerButton'
import { useTheme } from '@mui/material'
import { useContext } from 'react'
import {
  AppContext,
  LayoutContext,
  type AppContextType,
  type LayoutContextType,
} from '../../../context'
import { useMobileHook } from '../../../hooks'

export default function AgentsButton() {
  const { promptLoading, user } = useContext(AppContext) as AppContextType
  const navigate = useNavigate()

  const { setOpen } = useContext(LayoutContext) as LayoutContextType

  const isMobile = useMobileHook()

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
        if (isMobile) setOpen(false)
      }}
    />
  )
}
