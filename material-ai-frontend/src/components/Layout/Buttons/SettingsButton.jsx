
import { useContext } from "react"
import { LayoutContext } from "../../../context"
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import SettingsIcon from '@mui/icons-material/Settings';


export default function SettingsButton() {
    const {
        setOpen,
        setSettingsDrawerOpen,
    } = useContext(LayoutContext)
    return <ListItem disablePadding 
    sx={
        { display: 'block'}
    }>
        <ListItemButton
            onClick={() => {
                setOpen(false)
                setSettingsDrawerOpen(true)
            }}
            disableRipple
            sx={[
                {
                    minHeight: 48,
                    px: 2.5,
                },
                open
                    ? {
                        justifyContent: 'initial',
                    }
                    : {
                        justifyContent: 'center',
                    },
            ]}
        >
            <ListItemIcon
                sx={[
                    {
                        minWidth: 0,
                        justifyContent: 'center',
                    },
                    open
                        ? {
                            mr: 3,
                        }
                        : {
                            mr: 'auto',
                        },
                ]}
            >
                <SettingsIcon fontSize="small"/>
            </ListItemIcon>
            <ListItemText
                primary={"Settings & help"}
                sx={[
                    open
                        ? {
                            opacity: 1,
                        }
                        : {
                            opacity: 0,
                        },
                ]}
            />
        </ListItemButton>
    </ListItem>
}