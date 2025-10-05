
import { useContext } from "react"
import { LayoutContext } from "../../../context"
import SettingsIcon from '@mui/icons-material/Settings';
import DrawerButton from "../../material/DrawerButton";


export default function SettingsButton() {
    const { setOpen, setSettingsDrawerOpen } = useContext(LayoutContext)
    return <DrawerButton tooltip="Settings" icon={<SettingsIcon fontSize="small"/>} title="Settings & help" onClick={() => {
        setOpen(false)
        setSettingsDrawerOpen(true)
    }} />
}