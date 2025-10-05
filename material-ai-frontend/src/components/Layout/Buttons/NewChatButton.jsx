import { useContext } from 'react'
import DrawerButton from '../../material/DrawerButton'
import AddCommentOutlinedIcon from '@mui/icons-material/AddCommentOutlined'
import { AppContext, LayoutContext } from '../../../context'
import { useMobileHook } from '../../../hooks'

export default function NewChatButton() {
  const { on_new_chat, promptLoading, user } = useContext(AppContext)
  const { setOpen } = useContext(LayoutContext)
  const isMobile = useMobileHook()
  return (
    <DrawerButton
      disabled={promptLoading || !user}
      tooltip="New Chat (Ctrl+Shift+O)"
      icon={<AddCommentOutlinedIcon fontSize="small" />}
      title="New chat"
      onClick={() => {
        on_new_chat()
        if (isMobile) setOpen(false)
      }}
    />
  )
}
