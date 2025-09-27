
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import { List, Tooltip, Typography } from "@mui/material";
import { useContext } from 'react';
import { LayoutContext } from '../../context';

export default function DrawerButton({ icon: Icon, title, onClick, tooltip = '' }) {
    const { open } = useContext(LayoutContext)
    return <List>
        <Tooltip title={tooltip}>
            <ListItem disablePadding
                sx={
                    { display: 'block' }
                }>
                <ListItemButton
                    onClick={onClick}
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
                        <Icon fontSize="small" />
                    </ListItemIcon>
                    <Typography
                        fontWeight={300}
                        variant="h5"
                        sx={[
                            open
                                ? {
                                    opacity: 1,
                                }
                                : {
                                    opacity: 0,
                                },
                        ]}
                    >
                        {title}
                    </Typography>
                </ListItemButton>
            </ListItem>
        </Tooltip>
    </List>
}