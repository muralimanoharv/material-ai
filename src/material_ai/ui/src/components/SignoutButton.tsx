import { Button } from '@mui/material'
import { useContext } from 'react'
import { AppContext, type AppContextType } from '../context'
import { UNAUTHORIZED } from '../service/api.service'

export default function SignoutButton() {
  const context = useContext(AppContext) as AppContextType
  const { setUser, setSnack, on_new_chat, config } = context

  const handleSignOut = async () => {
    try {
      await context.apiService.sign_out()

      setUser(undefined)
      on_new_chat()
    } catch (e: unknown) {
      if (e instanceof Error && e.name === UNAUTHORIZED) {
        return
      }
      console.error(e)
      setSnack(config.errorMessage)
    }
  }

  return (
    <Button
      onClick={handleSignOut}
      color="inherit"
      variant="contained"
      sx={{ padding: '10px 24px' }}
    >
      Sign out
    </Button>
  )
}
