import { useContext } from 'react'
import MenuIcon from '@mui/icons-material/Menu'
import { LayoutContext, type LayoutContextType } from '../../../context'
import DrawerButton from '../../material/DrawerButton'

export default function MenuButton() {
  const { open, setOpen, setHoverOpen } = useContext(
    LayoutContext,
  ) as LayoutContextType

  return (
    <DrawerButton
      dataTestid="page-menu-button"
      tooltip="Expand menu"
      icon={<MenuIcon fontSize="small" />}
      title=""
      onClick={() => {
        setOpen(!open)
        setHoverOpen(false)
      }}
    />
  )
}
