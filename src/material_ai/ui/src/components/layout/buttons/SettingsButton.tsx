import { useContext } from 'react'
import {
  AppContext,
  LayoutContext,
  type AppContextType,
  type LayoutContextType,
} from '../../../context'
import SettingsIcon from '@mui/icons-material/Settings'
import DrawerButton from '../other/DrawerButton'

export default function SettingsButton() {
  const { config } = useContext(AppContext) as AppContextType
  const { setOpen, setSettingsDrawerOpen } = useContext(
    LayoutContext,
  ) as LayoutContextType

  return (
    <DrawerButton
      dataTestid="page-settings-button"
      tooltip="Settings"
      icon={<SettingsIcon fontSize="small" />}
      title={config.get().buttons.settingsAndHelp}
      onClick={() => {
        setOpen(false)
        setSettingsDrawerOpen(true)
      }}
    />
  )
}
