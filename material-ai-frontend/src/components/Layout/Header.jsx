import { Box, Typography } from "@mui/material"
import { useNavigate } from "react-router-dom"
import LinearProgress from '@mui/material/LinearProgress';
import { useContext } from "react";
import { AppContext } from "../../context";

export default function Header() {
    const navigate = useNavigate()
    const { loading } = useContext(AppContext)
    return (
        <Box sx={{position: 'relative'}}>
            <Box
                onClick={() => {
                    navigate('/')
                }}
                sx={{ cursor: 'pointer' }}
                mt={'12px'}
                mb={'10px'}
                padding={'6px 12px'}>
                <Typography fontSize={'22px'} lineHeight={'26px'} variant="h4"> Gemini </Typography>
            </Box>
            {
                loading && <Box sx={{position: 'absolute' , left: 0, bottom: -20, width: '100%'}}>
                    <LinearProgress />
                    <br />
                </Box>
            }
        </Box>
    )
}