import { useParams } from "react-router-dom";
import ChatSection from "../Chat/ChatSection";
import { useContext, useEffect } from "react";
import { AppContext } from "../../context";




export default function ChatPage() {
    const { setSession } = useContext(AppContext)
    const params = useParams()

    useEffect(() => {
        setSession(params.sessionId)
    }, [params.sessionId])
    return <ChatSection />
}