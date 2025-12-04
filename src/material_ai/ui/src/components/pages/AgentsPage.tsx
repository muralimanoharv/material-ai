import { useContext } from "react"
import { withLayout } from "../../hooks"
import { AppContext, type AppContextType } from "../../context"
import { Box } from "@mui/material"
import Greeting from "../Greeting"
import AgentList from "../AgentList"



function AgentsPage() {
    const { agents, user } = useContext(AppContext) as AppContextType
    if(!user) {
        return <Greeting />
    }
    return <Box sx={{
        display: 'flex',
        flexDirection: "column",
        justifyContent: 'space-between',
        gap: '10px'
    }}>
        <AgentList agents={agents}/>
    </Box>
}

export default withLayout(AgentsPage, {showFooter: true})