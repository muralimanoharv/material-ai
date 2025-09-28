import { useContext, useEffect, useState } from "react"
import { AppContext, LayoutContext } from "../../context"
import { fetch_session } from "../../api"
import { Box, Tooltip, Typography, useTheme } from "@mui/material"
import { drawerWidth } from "../material/MaterialDrawer"
import { useNavigate } from "react-router-dom"


export default function SessionHistorySection() {
    const context = useContext(AppContext)
    const { open } = useContext(LayoutContext)
    return <>
        <Box display={'flex'} flexDirection='column' padding='0 16px' gap='10px'>
            <Typography display={open ? 'block' : 'none'} fontSize={'14px'} variant="h6">Recent</Typography>
            {
                context.sessions.reverse().map(
                    session => <SessionItem key={session.id} session={session} />
                )
            }
        </Box>
    </>
}

function SessionItem(props) {
    const context = useContext(AppContext)
    const theme = useTheme()
    const navigate = useNavigate()
    const session = props.session;
    const [title, setTitle] = useState(session.id)
    const { open } = useContext(LayoutContext)

    useEffect(() => {
        fetch_session(context)(
            {
                session_id: session.id
            }
        ).then(dto => {
            try {
                const events = dto.events.filter(event => event.content.role == 'user')
                const firstEvent = events[0]
                const parts = firstEvent.content.parts.filter(part => part['text'])
                const firstPart = parts[0];
                setTitle(firstPart.text)
            } catch (e) {
                console.error(e)
                setTitle(session.id)
            }

        })
    }, [])

    return <Tooltip placement="right" title={title}>

        <Box className="session-history"
            onClick={() => {
                navigate(`/${session.id}`)
            }}
            key={session.id}
            height={open ? 'auto' : 0}
            width={open ? drawerWidth - 35 : 0}
            sx={{
                opacity: open ? '1' : '0',
                cursor: 'pointer',
                padding: '8px 8px 8px 12px',
                borderRadius: '16px',
                backgroundColor: open ? (context.session === session.id
                    ? theme.palette.background.history : undefined ) : undefined,
                '&:hover': {
                    backgroundColor: context.session === session.id ?
                        theme.palette.background.history : theme.palette.background.cardHover,
                }
            }}
        >
            <Typography
                color={context.session === session.id ? theme.palette.text.selected : undefined}
                fontWeight={500}
                fontSize={'14px'}
                lineHeight={'20px'}
                variant="h6"
                noWrap>
                {title}
            </Typography>
        </Box>
    </Tooltip>
}