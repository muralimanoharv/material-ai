import { useContext } from "react";
import DrawerButton from "../../material/DrawerButton";
import AddCommentOutlinedIcon from '@mui/icons-material/AddCommentOutlined';
import { AppContext } from "../../../context";
import { useNavigate } from "react-router-dom";


export default function NewChatButton() {
    const { clear_history, loading } = useContext(AppContext)
    const navigate = useNavigate()
    return <DrawerButton
        disabled={loading}
        tooltip="New Chat (Ctrl+Shift+O)"
        icon={AddCommentOutlinedIcon} title="New chat"
        onClick={() => {
            clear_history()
            navigate('/')
        }} />
}