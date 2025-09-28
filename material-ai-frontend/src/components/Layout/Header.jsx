import { Box, Typography } from "@mui/material"
import { useNavigate } from "react-router-dom"


export default function Header() {
    const navigate = useNavigate()
    return <Box 
    onClick={() => {
        navigate('/')
    }} sx={{cursor: 'pointer'}} mt={'12px'} mb={'10px'} padding={'6px 12px'}>
        <Typography fontSize={'22px'} lineHeight={'26px'} variant="h4"> Gemini </Typography>
    </Box>
}