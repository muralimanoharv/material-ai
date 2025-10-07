import { useContext } from 'react'
import MenuIcon from '@mui/icons-material/Menu'
import { LayoutContext } from '../../../context'
import DrawerButton from '../../material/DrawerButton'

export default function MenuButton() {
  const { open, setOpen, setHoverOpen } = useContext(LayoutContext)
  return (
    <DrawerButton
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
