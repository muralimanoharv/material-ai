import { useContext } from "react"
import { LayoutContext } from "../../../context"

import MenuIcon from '@mui/icons-material/Menu';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';


export default function MenuButton() {
    const {
        open,
        setOpen
    } = useContext(LayoutContext)
    return <ListItem disablePadding
        sx={{
            display: 'block',
        }}
    >
        <ListItemButton
            disableRipple
            onClick={() => setOpen(!open)}
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
                <MenuIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
                primary={""}
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