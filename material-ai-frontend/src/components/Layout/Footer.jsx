import { Box } from "@mui/material";
import PromptInput from "../Footer/PromptInput";




export default function Footer() {
    return <Box sx={
        {
            flexShrink: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }
    }>
        <PromptInput />
    </Box>
}