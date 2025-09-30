import ChatSection from "../Chat/ChatSection";
import { useContext } from "react";
import { AppContext } from "../../context";
import { Box, Typography, useTheme } from "@mui/material";


export default function ChatPage() {
    const { user, showHeading } = useContext(AppContext)
    const theme = useTheme()

    return <>
        {showHeading && (
            <Box sx={{ height: '50vh', gap: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                <Typography
                    className="animated-text"
                    variant="h1"
                    sx={{
                        backgroundImage: 'linear-gradient(90deg, #3186ff 0, #346bf1 50%, #4fa0ff 100%)',
                        'WebkitBackgroundClip': 'text',
                        color: 'transparent'
                    }}
                >
                    Hello, {user}
                </Typography>
                <Typography
                    textAlign='center'
                    color={theme.palette.text.tagline}
                    fontWeight={400}
                    variant="h1"
                    className="tagline-text">
                    What should we do today?
                </Typography>
            </Box>
        )}
        <ChatSection />
    </>
}