import { useContext } from "react"
import { withLayout } from "../../hooks"
import { AppContext, type AppContextType } from "../../context"
import { Box } from "@mui/material"
import { Link } from "react-router"



function AgentsPage() {
    const { agents } = useContext(AppContext) as AppContextType
    return <Box sx={{
        display: 'flex',
        flexDirection: "column",
        justifyContent: 'space-between',
        gap: '10px'
    }}>
        {agents.map(agent => {
            return <Link to={`/agents/${agent.name}`}>{agent.name}</Link>
        })}
    </Box>
}

export default withLayout(AgentsPage, {showFooter: false})