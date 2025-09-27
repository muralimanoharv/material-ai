import { Box, IconButton, Tooltip } from "@mui/material";
import CopyAllOutlinedIcon from '@mui/icons-material/CopyAllOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useContext } from "react";
import { ChatItemContext, AppContext } from "../../context";


export default function UserButtons() {
    const { chat } = useContext(ChatItemContext)
    const { setSnack, setPrompt } = useContext(AppContext)
    return <Box className="actions-child" sx={{
        marginLeft: '20px',
        opacity: '0',
        transition: 'opacity 0.5s ease'
    }}>
        <Tooltip title="Copy prompt">
            <IconButton onClick={async () => {
                await navigator.clipboard.writeText(chat.prompt);
                setSnack('Prompt copied')
            }}>
                <CopyAllOutlinedIcon fontSize="small" />
            </IconButton>
        </Tooltip>
        <Tooltip title="Edit prompt">
            <IconButton onClick={() => {
                setPrompt(chat.prompt)
            }}>
                <EditOutlinedIcon fontSize="small" />
            </IconButton>
        </Tooltip>
    </Box>
}