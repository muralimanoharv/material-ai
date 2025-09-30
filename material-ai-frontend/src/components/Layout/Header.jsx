import { Box, IconButton, Typography } from "@mui/material"
import LinearProgress from '@mui/material/LinearProgress';
import { useContext } from "react";
import { AppContext, LayoutContext } from "../../context";
import MenuIcon from '@mui/icons-material/Menu';
import { useMobileHook } from "../../hooks";

export default function Header() {
    const { loading, on_new_chat} = useContext(AppContext)
    const { setOpen } = useContext(LayoutContext)
    const isMobile = useMobileHook();
    return (
        <Box sx={{ position: 'relative' }}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'flex-start', alignItems: 'center', gap: '16px'
                }}
                mt={'12px'}
                mb={'10px'}
                padding={'6px 12px'}>
                {isMobile && (
                    <IconButton onClick={() => {
                        setOpen(true)
                    }}>
                        <MenuIcon fontSize="small" />
                    </IconButton>
                )
                }
                <Box sx={{ cursor: 'pointer' }} onClick={() => {
                    on_new_chat()
                }}>
                    <Typography fontSize={'22px'} lineHeight={'26px'} variant="h4"> Gemini </Typography>

                </Box>
            </Box>
            {
                loading && <Box sx={{ position: 'absolute', left: 0, bottom: -20, width: '100%' }}>
                    <LinearProgress />
                    <br />
                </Box>
            }
        </Box>
    )
}