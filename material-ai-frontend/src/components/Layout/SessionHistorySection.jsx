import { useContext, useEffect, useState } from "react"
import { AppContext, LayoutContext } from "../../context"
import { get_session_history } from "../../api"
import { Box, Tooltip, Typography, useTheme } from "@mui/material"
import { drawerWidth } from "../material/MaterialDrawer"
import { useNavigate } from "react-router-dom"


export default function SessionHistorySection() {
    const context = useContext(AppContext)
    const { open } = useContext(LayoutContext)
    const [pagination, setPagination] = useState({ startIdx: 0, endIdx: 5 })
    const [sessions, setSessions] = useState([])
    const theme = useTheme()
    const navigate = useNavigate()
    useEffect(() => {
        get_session_history(context)({ ...pagination })
            .then(sessions => {
                setSessions(sessions)
            })
    }, [])
    return <>
        <Box display={open ? 'flex' : 'none'} flexDirection='column' padding='0 16px' gap='10px'>
            <Typography fontSize={'14px'} variant="h6">Recent</Typography>
            {
                sessions.map(
                    session => <Tooltip placement="right"  title={session.id}><Box onClick={() => {
                        navigate(`/${session.id}`)
                    }} key={session.id} width={drawerWidth - 35}
                        sx={{
                            cursor: 'pointer',
                            padding: '8px 8px 8px 12px',
                            borderRadius: '16px',
                            backgroundColor: context.session === session.id
                                ? '#d3e3fd' : undefined,
                            '&:hover': {
                                backgroundColor: context.session === session.id ?
                                    '#d3e3fd' : theme.palette.background.cardHover,
                            }
                        }}
                    >
                        <Typography
                            color={context.session === session.id ? '#0842a0' : undefined}
                            fontWeight={500}
                            fontSize={'14px'}
                            lineHeight={'20px'}
                            variant="h6"
                            noWrap>
                            {session.id}
                        </Typography>
                    </Box>
                    </Tooltip>
                )
            }
        </Box>
    </>
}