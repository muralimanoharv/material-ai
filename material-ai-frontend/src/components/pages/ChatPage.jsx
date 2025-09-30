import { useParams } from "react-router-dom";
import ChatSection from "../Chat/ChatSection";
import { useContext, useEffect, useMemo, useState } from "react";
import { AppContext } from "../../context";
import { Box, Typography, useTheme } from "@mui/material";


export default function ChatPage() {
    const { setSession, user, history, sessionLoading } = useContext(AppContext)
    const [appLoad, setAppLoad] = useState(false)
    const params = useParams()
    const theme = useTheme()

    useEffect(() => {
        setAppLoad(true)
    }, [])

    useEffect(() => {
        setSession(params.sessionId)
    }, [params.sessionId])

    const Greeting = useMemo(() => {
        return (
            <Box sx={{ height: '50vh', gap: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                <Typography
                    className="animated-text"
                    variant="h1"
                    sx={{
                        backgroundImage: 'linear-gradient(90deg, #3186ff 0, #346bf1 50%, #4fa0ff 100%)',
                        '-webkit-background-clip': 'text',
                        color: 'transparent'
                    }}
                >Hello, {user}
                </Typography>
                <Typography
                    color={theme.palette.text.tagline}
                    fontWeight={400}
                    variant="h1"
                    className="tagline-text">
                    What should we do today?
                </Typography>
            </Box>
        )
    }, [])

    let Heading = null;

    if ((!params.sessionId) || (!sessionLoading && appLoad && history.length == 0)) {
        Heading = Greeting
    }

    return <>
        {Heading}
        <ChatSection />
    </>
}