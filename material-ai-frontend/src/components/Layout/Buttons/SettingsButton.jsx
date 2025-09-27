
import { useContext } from "react"
import { LayoutContext } from "../../../context"
import SettingsIcon from '@mui/icons-material/Settings';
import DrawerButton from "../../material/DrawerButton";


export default function SettingsButton() {
    const { open, setOpen, setSettingsDrawerOpen } = useContext(LayoutContext)
    return <DrawerButton icon={SettingsIcon} title="Settings & help" onClick={() => {
        setOpen(false)
        setSettingsDrawerOpen(true)
    }} />
}